import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Image,
  RotateCcw,
  X,
  Zap,
  ZapOff,
} from "lucide-react";
import { Toaster } from "react-hot-toast";

const CameraScreen = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError(
        "Camera access denied. Please allow camera permissions or upload an image instead."
      );
    }
  };

  const toggleFlash = async () => {
    if (!stream) return;

    try {
      const track = stream.getVideoTracks()[0];
      // Use type assertion to access non-standard 'torch' property
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & {
        torch?: boolean;
      };

      if (capabilities.torch) {
        // Use type assertion to allow 'torch' constraint
        await track.applyConstraints({
          advanced: [{ torch: !flashEnabled } as any],
        });
        setFlashEnabled(!flashEnabled);
      }
    } catch (error) {
      console.error("Flash not supported:", error);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageDataUrl);

    // Simulate scanning process
    setIsScanning(true);
    setTimeout(() => {
      setScanResult(true);
      setIsScanning(false);
    }, 3000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setCapturedImage(imageDataUrl);

        // Simulate scanning process
        setIsScanning(true);
        setTimeout(() => {
          setScanResult(true);
          setIsScanning(false);
        }, 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setScanResult(false);
    setIsScanning(false);
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleContinue = () => {
    navigate("/app/bills/edit/1");
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between text-white">
            <button
              onClick={() => navigate("/app")}
              className="p-2 cursor-pointer"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="bg-black/30 px-3 py-1 rounded-full text-sm">
                Auto
              </span>
              {!cameraError && (
                <button
                  onClick={switchCamera}
                  className="p-2 bg-black/30 rounded-full cursor-pointer"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Camera View or Captured Image */}
        <div className="absolute inset-0 flex items-center justify-center">
          {capturedImage ? (
            <div className="relative max-w-sm max-h-96">
              <img
                src={capturedImage}
                alt="Captured receipt"
                className="w-full h-full object-contain rounded-lg"
              />

              {/* Scanning overlay */}
              {isScanning && (
                <div className="absolute inset-0 border-4 border-blue-500 rounded-lg animate-pulse">
                  <div className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 border-blue-500"></div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 border-blue-500"></div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 border-blue-500"></div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 border-blue-500"></div>
                </div>
              )}
            </div>
          ) : cameraError ? (
            <div className="text-center text-white p-6">
              <div className="bg-black/70 rounded-lg p-6">
                <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-sm mb-4">{cameraError}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-mainBgColor text-white px-6 py-2 rounded-lg"
                >
                  Upload Image Instead
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Receipt scanning guide overlay - Tall rectangle like real receipts */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Scanning frame - Made taller for receipt proportions */}
                  <div className="w-64 h-[480px] border-2 border-white/50 rounded-lg relative">
                    {/* Corner indicators */}
                    <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-blue-500 rounded-br-lg"></div>

                    {/* Center guide text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/70 rounded-lg p-4 text-center">
                        <p className="text-white text-sm">
                          Position receipt within frame
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scanning text */}
          {isScanning && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
              <div className="bg-black/70 rounded-lg p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Scanning bill...</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Panel */}
        {scanResult ? (
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Gourmet Coffee
              </h3>
              <p className="text-gray-600">60th Ave New York</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">$44.61</p>
              <p className="text-sm text-gray-500">Sept 4, 2024</p>
            </div>

            <div className="flex items-center justify-center mb-6">
              <div className="bg-mainBgColor text-white px-6 py-2 rounded-full flex items-center">
                <span className="mr-2">Split Tax</span>
                <div className="w-8 h-4 bg-white rounded-full relative">
                  <div className="w-4 h-4 bg-mainBgColor rounded-full absolute right-0 top-0"></div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={retakePhoto}
                className="flex-1 cursor-pointer bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold"
              >
                Retake
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 cursor-pointer bg-mainBgColor text-white py-4 rounded-2xl font-semibold"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-8">
            {/* Upload Image Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
            >
              <Image className="h-6 w-6 text-white" />
            </button>

            {/* Camera Capture Button */}
            <button
              onClick={capturePhoto}
              disabled={isScanning || !!cameraError}
              className="cursor-pointer p-6 bg-white rounded-full shadow-lg disabled:opacity-50 hover:shadow-xl transition-shadow"
            >
              <Camera className="h-8 w-8 text-gray-900" />
            </button>

            {/* Flash Toggle Button */}
            {/* <button
            onClick={toggleFlash}
            disabled={!!cameraError}
            className={`p-4 rounded-full transition-colors ${
              flashEnabled
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-black/30 hover:bg-black/50"
            } disabled:opacity-50`}
          >
            {flashEnabled ? (
              <Zap className="h-6 w-6 text-white" />
            ) : (
              <ZapOff className="h-6 w-6 text-white" />
            )}
          </button> */}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </>
  );
};

export default CameraScreen;
