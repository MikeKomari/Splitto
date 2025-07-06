import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, ChevronDown, ChevronUp, Info } from "lucide-react";
import type { BillItem, PersonInBill } from "@/types/types";

const SummaryScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialItems = location.state?.items || [];
  const [items, setItems] = useState<BillItem[]>(initialItems);
  const [people, setPeople] = useState<PersonInBill[]>(
    location.state?.people || []
  );
  const billHeaderData = location.state?.billHeaderData || {
    name: "Bill Name",
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  };
  const [expandedPerson, setExpandedPerson] = useState<number | null>(null);

  // const people = [
  //   {
  //     id: "1",
  //     name: "Jelly",
  //     color: "bg-blue-500",
  //     total: 12.63,
  //     items: ["Caesar Salad"],
  //   },
  //   {
  //     id: "2",
  //     name: "Amanda",
  //     color: "bg-orange-500",
  //     total: 18.4,
  //     items: ["Cappuccino", "Caesar Salad"],
  //   },
  //   {
  //     id: "3",
  //     name: "Billie",
  //     color: "bg-mainBgColor",
  //     total: 4.96,
  //     items: ["Iced Tea"],
  //   },
  //   {
  //     id: "4",
  //     name: "Charlie",
  //     color: "bg-yellow-500",
  //     total: 8.78,
  //     items: ["Chocolate Donut"],
  //   },
  // ];

  const toggleExpanded = (personId: number) => {
    setExpandedPerson(expandedPerson === personId ? null : personId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl max-md:max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Bill Split Summary
            </h1>
            <button className="p-1">
              <Share2 className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl max-md:max-w-md mx-auto px-4 py-6">
        {/* Bill Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {billHeaderData.name}
          </h2>
          <p className="text-gray-600">{billHeaderData.date}</p>
        </div>

        {/* People Summary */}
        <div className="space-y-3 mb-6">
          {people.map((person) => {
            const isExpanded = expandedPerson === person.id;

            return (
              <div
                key={person.id}
                className="bg-white rounded-xl overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpanded(person.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={person.avatar}
                        className="w-10 h-10 mr-3"
                        alt=""
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {person.name}'s Total
                        </h3>
                        <p className="text-lg font-bold text-gray-900">
                          ${person.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1">
                        <Info className="h-4 w-4 text-gray-400" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="pt-3">
                      {items
                        .filter((item) => item.assignedTo?.includes(person.id))
                        .map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm text-gray-600 mb-1"
                          >
                            <span>1x {item.item_name}</span>
                          </div>
                        ))}
                      <button className="text-blue-600 text-sm font-medium mt-2">
                        Bill Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold">
            Save Bill
          </button>
          <button className="flex-1 bg-mainBgColor text-white py-4 rounded-2xl font-semibold">
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryScreen;
