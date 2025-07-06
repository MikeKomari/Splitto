import React from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  type Plus,
  Receipt,
  Users,
  ArrowLeft,
  Menu,
  Search,
  Bell,
} from "lucide-react";
import type { BillItem } from "@/types/types";
import BottomNav from "@/components/main/BottomNav";

interface LandingProps {
  bills?: BillItem[];
}

const Landing: React.FC<LandingProps> = ({ bills }) => {
  const totalUnpaid = 430.0; // Mock data to match design
  const recentBills = [
    {
      id: "1",
      name: "Dinner Date",
      date: "Sept 4, 2024",
      total: 180.0,
      peopleCount: 5,
      icon: "🍽️",
    },
    {
      id: "2",
      name: "Monthly Groceries",
      date: "Aug 31, 2024",
      total: 320.0,
      peopleCount: 4,
      icon: "🛒",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white">
        <div className=" max-w-5xl max-md:max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Menu className="h-6 w-6 text-gray-600" />
            <div className="flex items-center space-x-4">
              <Search className="h-6 w-6 text-gray-600" />
              <Bell className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl max-md:max-w-md mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, Guest!
          </h1>
          <p className="text-gray-600 mb-6">
            Split your bills with ease and keep track of your expenses.
            {/* <span className="font-bold text-blue-600">
              ${totalUnpaid.toFixed(2)}
            </span>{" "} */}
            By clicking the button below.
          </p>
          <Link
            to="/app/camera"
            className="bg-mainBgColor text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            Split Bill
          </Link>
        </div>

        {/* Recent Bills */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Bills
            </h2>
            <button className="text-blue-600 text-sm font-medium">
              See All
            </button>
          </div>

          <div className="space-y-4">
            {/* {recentBills.map((bill) => (
              <div key={bill.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-xl">{bill.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {bill.name}
                      </h3>
                      <p className="text-sm text-gray-500">{bill.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${bill.total.toFixed(2)}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>Sharing: {bill.peopleCount} Persons</span>
                    </div>
                  </div>
                </div>
              </div>
            ))} */}

            <p className="text-gray-500 text-sm text-center">
              Log in to view your recent bills! Although this feature is not
              available yet!
            </p>
          </div>
        </div>

        {/* Refer a Friend */}
        {/* <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Refer a Friend</h3>
              <p className="text-blue-100 text-sm mb-3">Your Buzz Level</p>
              <div className="flex items-center">
                <span className="text-2xl mr-2">🚀</span>
                <span className="text-sm font-medium">Jelly2024</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">$50</p>
              <p className="text-blue-100 text-sm">Get $5</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Landing;
