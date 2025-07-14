import initialProfile1Routes from "@/assets/profile1Routes";
import React, { useState } from "react";
import type AssignBillItem from "./AssignBillItem";
import type { PersonInBill } from "@/types/types";

type AssignPersonBillModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (profileId: number) => void;
  people: PersonInBill[];
  foodName: string;
};

const AssignPersonBillModal: React.FC<AssignPersonBillModalProps> = ({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
  foodName,
  people = [],
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

        <h2 className="text-2xl font-bold text-black mb-2">Assign Person</h2>
        <p className="text-gray-500 mb-4">{foodName}</p>

        <div className="max-h-[35vh] border-mainBgColor border-1 rounded-lg  overflow-y-auto">
          <div className="grid-cols-4 gap-4 grid ">
            {/* {initialProfile1Routes.map((profile, index) => ())} */}
            {people.map((profile, index) => (
              <div
                key={index}
                className={`relative flex flex-col items-center justify-center cursor-pointer                          
                 `}
                onClick={() => setSelectedProfile(profile.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setSelectedProfile(index);
                }}
              >
                <img
                  className="w-[50px] h-[50px] mx-auto"
                  src={profile.avatar || "/Splitto_logo.png"}
                  alt={profile.name || ""}
                />
                <span className="text-sm text-gray-800">
                  {profile.name || "Unknown"}
                </span>
                {selectedProfile === profile.id && (
                  <span className="absolute top-1/2 bottom-1/2  text-black rounded-full  text-3xl flex items-center justify-center">
                    ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Button */}
        <div className="flex flex-col gap-1 mt-4">
          <button
            onClick={() => onConfirm(selectedProfile)}
            disabled={isLoading}
            className="bg-mainBgColor cursor-pointer flex justify-center items-center text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
          >
            Assign Person
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

export default AssignPersonBillModal;
