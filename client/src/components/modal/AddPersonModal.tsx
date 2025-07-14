import initialProfile1Routes from "@/assets/profile1Routes";
import React, { useState } from "react";

type AddPersonModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (profileId: number, name: string) => void;
  message?: string;
};

const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
  message,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<number>(0);
  const [name, setName] = useState<string>("");

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
      <div className="relative w-full max-w-lg min-h-[20vh] mx-4 bg-[#FFF9F8] rounded-xl p-8 text-center shadow-xl">
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 text-black text-xl font-bold hover:text-red-500"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-black mb-2">Add New Person</h2>
        <p className="text-gray-500 mb-4">Choose Profile</p>

        <div className="max-h-[35vh] border-mainBgColor border-1 rounded-lg  overflow-y-auto">
          <div className="grid-cols-4 gap-4 grid ">
            {/* {initialProfile1Routes.map((profile, index) => ())} */}
            {initialProfile1Routes.map((profile, index) => (
              <div
                key={index}
                tabIndex={0}
                className={`relative flex flex-col items-center justify-center cursor-pointer                          
                 `}
                onClick={() => setSelectedProfile(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setSelectedProfile(index);
                }}
              >
                <img
                  className="w-[50px] h-[50px] mx-auto"
                  src={profile.route || "/Splitto_logo.png"}
                  alt={profile.name || ""}
                />
                {selectedProfile === index && (
                  <span className="absolute top-1/2 bottom-1/2  text-black rounded-full  text-3xl flex items-center justify-center">
                    ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Name Input */}
        <div className="mt-4 mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBgColor"
          />
        </div>

        {/* Button */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onConfirm(selectedProfile, name)}
            disabled={isLoading}
            className="bg-mainBgColor cursor-pointer flex justify-center items-center text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
          >
            Add Person
          </button>

          <button
            onClick={onClose}
            className="border cursor-pointer border-mainBgColor text-mainBgColor font-semibold py-3 rounded-lg hover:opacity-80 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPersonModal;
