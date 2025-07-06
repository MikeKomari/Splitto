import React from "react";
import { useNavigate } from "react-router-dom";

type ErrorPageProps = {
  code?: number | string;
  message?: string;
  inProgress?: boolean;
};

const ErrorPage: React.FC<ErrorPageProps> = ({ code = "404", message = "Something went wrong.", inProgress=false }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0d1b2a] text-white h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <img
      src={
        inProgress
        ? "https://em-content.zobj.net/thumbs/240/apple/354/winking-face_1f609.png"
        : "https://em-content.zobj.net/thumbs/240/apple/354/face-screaming-in-fear_1f631.png"
      }
      alt={inProgress ? "Wink Emoji" : "Shock Emoji"}
      className="w-24 h-24"
      />
      <h1 className="text-7xl font-extrabold">{code}</h1>
      <p className="text-2xl font-medium">{message}</p>
      <button
      onClick={() => navigate(-1)}
      className="mt-6 px-6 py-3 bg-white text-[#0d1b2a] rounded-xl font-semibold hover:bg-gray-200 transition"
      >
      Go Back
      </button>
    </div>
  );
};

export default ErrorPage;
