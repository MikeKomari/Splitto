import type { BillItem, PersonInBill } from "@/types/types";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import ProfileItem from "./ProfileItem";
import AssignPersonBillModal from "./AssignPersonBillModal";
import toast, { Toaster } from "react-hot-toast";
type AssignBillItemProps = {
  item: BillItem;
  people: PersonInBill[];
  togglePersonAssignment: (itemId: number, personId: number) => void;
};
const AssignBillItem: React.FC<AssignBillItemProps> = ({
  item,
  people,
  togglePersonAssignment,
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };
  const handleConfirmModal = (profileId: number | undefined) => {
    if (profileId === undefined) {
      toast.error("Please select a person to assign.");
      return;
    }
    // Logic to handle adding a new person
    togglePersonAssignment(item.id, profileId);
    setIsOpenModal(false);
  };

  const handleTryingToAddMorePeople = () => {
    if (item.assignedTo.length === item.quantity) {
      toast.error("Max people reached. Please remove somebody.");
      return;
    }
    setIsOpenModal(true);
  };

  return (
    <>
      <AssignPersonBillModal
        isOpen={isOpenModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmModal}
        people={people}
        foodName={item.item_name}
      />
      <Toaster />
      <div key={item.id} className="bg-white rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-gray-600 mr-3">{item.quantity}x</span>
            <span className="font-medium text-gray-900">{item.item_name}</span>
          </div>
          <span className="font-semibold text-gray-900">
            ${(item.pricePerUnit * item.quantity).toFixed(2)}
          </span>
        </div>
        <div className="grid grid-cols-7 space-x-2">
          {item.assignedTo.map((person) => {
            const personData = people.find((p) => p.id === person);
            if (!personData) return null; // Skip if person not found
            return (
              <ProfileItem
                key={personData.id}
                id={personData.id}
                name={personData.name}
                route={personData.avatar}
                toggle={() => togglePersonAssignment(item.id, personData.id)}
              />
            );
          })}
          <div className="flex items-center flex-col">
            <button
              onClick={handleTryingToAddMorePeople}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm"
            >
              <Plus className="h-5 w-5" />
            </button>
            <p className="text-sm text-center">Add</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignBillItem;
