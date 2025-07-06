import React, { useState } from "react";
import { Plus, ArrowLeft, X, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import type { BillItem, PersonInBill } from "@/types/types";
import AddPersonModal from "@/components/modal/AddPersonModal";
import toast, { Toaster } from "react-hot-toast";
import AssignBillItem from "@/components/bill/AssignBillItem";
import ProfileItem from "@/components/bill/ProfileItem";

const PersonAssignment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialItems = location.state?.items || [];
  const billHeaderData = location.state?.billHeaderData || {
    name: "Bill Name",
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  };
  const [items, setItems] = useState<BillItem[]>(initialItems);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showAllPeople, setShowAllPeople] = useState(false);
  const [people, setPeople] = useState<PersonInBill[]>([
    { id: 0, name: "Jelly", avatar: "/profile/profile1/1.png", total: 0 },
    { id: 1, name: "Amanda", avatar: "/profile/profile1/2.png", total: 0 },
    { id: 2, name: "Chris", avatar: "/profile/profile1/3.png", total: 0 },
    { id: 3, name: "Sam", avatar: "/profile/profile1/4.png", total: 0 },
    { id: 4, name: "Taylor", avatar: "/profile/profile1/5.png", total: 0 },
    { id: 5, name: "Morgan", avatar: "/profile/profile1/6.png", total: 0 },
    { id: 6, name: "Alex", avatar: "/profile/profile1/7.png", total: 0 },
    { id: 7, name: "Jordan", avatar: "/profile/profile1/8.png", total: 0 },
  ]);

  const taxRate = 0.08;

  const togglePersonAssignment = (itemId: number, personId: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              assignedTo: item.assignedTo.includes(personId)
                ? item.assignedTo.filter((id) => id !== personId)
                : [...item.assignedTo, personId],
            }
          : item
      )
    );
  };

  const calculateTotalsWithoutTax = (
    people: PersonInBill[],
    items: typeof initialItems
  ) => {
    const updatedPeople = people.map((person) => ({ ...person, total: 0 }));

    items.forEach((item: BillItem) => {
      const totalItemCost = item.pricePerUnit * item.quantity;
      const assignees = item.assignedTo;
      const sharePerPerson =
        assignees.length > 0 ? totalItemCost / assignees.length : 0;

      assignees.forEach((personId: number) => {
        const person = updatedPeople.find((p) => p.id === personId);
        if (person) {
          person.total += sharePerPerson;
        }
      });
    });
    setPeople(updatedPeople);
    toast.success("Totals calculated successfully.");
  };

  const onAddPersonConfirm = (profileId: number, name: string) => {
    if (!name.trim()) {
      toast.error("Please enter a valid name.");
      return;
    }
    const newPerson: PersonInBill = {
      id: Number(new Date()),
      name,
      avatar: `/profile/profile1/${profileId}.png`,
      total: 0,
    };
    setPeople((prev) => [...prev, newPerson]);
    setIsOpenModal(false);
  };

  const onAddPersonCancel = () => {
    setIsOpenModal(false);
  };

  const removePerson = (personId: number) => {
    setPeople((prev) => prev.filter((p) => p.id !== personId));
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter((id) => id !== personId) as number[],
      }))
    );
    toast.success("Person removed successfully.");
  };

  const handleConfirmResult = () => {
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPeople = items.reduce(
      (acc, person) => acc + person.assignedTo.length,
      0
    );
    console.log(totalItems, totalPeople);

    if (totalPeople === 0) {
      toast.error("No people assigned to items.");
      return;
    }
    if (totalItems !== totalPeople) {
      toast.error("Total items and people assigned do not match.");
      return;
    }

    navigate("/app/bills/summary/1", {
      state: { items, people, billHeaderData },
    });
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
        <AddPersonModal
          isOpen={isOpenModal}
          onClose={onAddPersonCancel}
          onConfirm={onAddPersonConfirm}
        />
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-5xl max-md:max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => navigate(-1)} className="p-1">
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                Assign People
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 text-sm font-medium">Equal</span>
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs">😊</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl max-md:max-w-md mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {billHeaderData.name}
            </h2>
            <p className="text-gray-600">{billHeaderData.date}</p>
          </div>

          {/* People List */}
          <div className="bg-white rounded-xl min-h-[15vh] flex justify-center flex-col mb-4 p-4">
            <div
              className="flex items-center justify-between mb-3 cursor-pointer"
              onClick={() => setShowAllPeople((prev) => !prev)}
            >
              <div className="flex items-center">
                <span className="font-medium text-gray-900">All People</span>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  showAllPeople ? "rotate-180" : ""
                }`}
              />
            </div>
            <div className="grid grid-cols-7  gap-y-4">
              {(showAllPeople ? people : people.slice(0, 6)).map((person) => (
                <ProfileItem
                  key={person.id}
                  id={person.id}
                  route={person.avatar}
                  remove={removePerson}
                  name={person.name}
                />
              ))}
              <div className="flex items-center flex-col">
                <button
                  onClick={() => setIsOpenModal(true)}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <p className="text-sm text-center">Add</p>
              </div>
            </div>

            <p className="text-xs my-2 text-red-400">
              Click twice to remove someone!
            </p>
          </div>

          <p className="space-y-4 text-center mb-4 text-gray-600">Items List</p>

          {/* Items List */}
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <AssignBillItem
                item={item}
                people={people}
                key={item.id}
                togglePersonAssignment={togglePersonAssignment}
              />
            ))}
          </div>

          <div className="bg-white rounded-xl p-4 mb-6">
            <div className="space-y-2">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="flex justify-between text-gray-800"
                >
                  <span>{person.name}</span>
                  <span>Rp {person.total.toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => calculateTotalsWithoutTax(people, items)}
            className="w-full bg-white rounded-xl p-4 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors flex items-center justify-center text-blue-600 cursor-pointer"
          >
            <Plus className="h-5 w-5 mr-2" />
            Calculate Total
          </button>

          <button
            onClick={handleConfirmResult}
            className="w-full bg-black text-white mt-4 py-4 rounded-2xl font-semibold text-lg"
          >
            Confirm Result
          </button>
        </div>
      </div>
    </>
  );
};

export default PersonAssignment;
