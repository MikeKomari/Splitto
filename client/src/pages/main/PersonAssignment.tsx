import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus } from "lucide-react";

const PersonAssignment = () => {
  const navigate = useNavigate();
  const [people] = useState([
    { id: "1", name: "Jelly", color: "bg-blue-500" },
    { id: "2", name: "Amanda", color: "bg-orange-500" },
    { id: "3", name: "Billie", color: "bg-mainBgColor" },
    { id: "4", name: "Charlie", color: "bg-yellow-500" },
  ]);

  const [items] = useState([
    { id: "1", name: "Cappuccino", price: 5.4, quantity: 1, assignedTo: ["1"] },
    {
      id: "2",
      name: "Chocolate Donut",
      price: 3.15,
      quantity: 1,
      assignedTo: ["2"],
    },
    {
      id: "3",
      name: "Caesar Salad",
      price: 23.38,
      quantity: 2,
      assignedTo: ["1", "2"],
    },
    { id: "4", name: "Iced Tea", price: 4.6, quantity: 1, assignedTo: [] },
  ]);

  const subtotal = 41.51;
  const tax = 3.1;
  const total = 44.61;

  const togglePersonAssignment = (itemId: string, personId: string) => {
    // Toggle assignment logic would go here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl max-md:max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/app/bills/edit/1")}
              className="p-1"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Chill Breakkie
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
        {/* Bill Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Gourmet Coffee</h2>
          <p className="text-gray-600">Sept 4, 2024 • 08:36 AM</p>
        </div>

        {/* Items with Assignment */}
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-gray-600 mr-3">{item.quantity}x</span>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  ${item.price.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {people.map((person) => {
                  const isAssigned = item.assignedTo.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      onClick={() => togglePersonAssignment(item.id, person.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all ${
                        isAssigned ? person.color : "bg-gray-200"
                      }`}
                    >
                      {isAssigned ? (
                        person.name.charAt(0)
                      ) : (
                        <Plus className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total Bill</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={() => navigate("/app/bills/summary/1")}
          className="w-full bg-mainBgColor text-white py-4 rounded-2xl font-semibold text-lg"
        >
          Confirm Result
        </button>
      </div>
    </div>
  );
};

export default PersonAssignment;
