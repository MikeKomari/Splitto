import React from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Users,
  Receipt,
  ArrowRight,
  Star,
  Shield,
  Zap,
} from "lucide-react";

const Main = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Receipt className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  SplitBill
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/app"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Split Bills with
            <span className="text-indigo-600"> Ease</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Snap a photo of your receipt, add friends, and automatically split
            the bill. No more awkward math or forgotten debts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/app"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Three simple steps to split any bill perfectly
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Camera className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                1. Snap Receipt
              </h3>
              <p className="text-gray-600">
                Take a photo of your receipt and let our AI automatically detect
                items and prices
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2. Add Friends
              </h3>
              <p className="text-gray-600">
                Add the people who shared the meal and assign items to each
                person
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Receipt className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3. Split & Share
              </h3>
              <p className="text-gray-600">
                Get an instant breakdown of who owes what and share the results
                with everyone
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Split Your First Bill?
          </h2>
          <p className="text-xl text-indigo-200 mb-8">
            Join thousands of users who have simplified their dining experiences
          </p>
          <Link
            to="/app"
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            Try SplitBill Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Receipt className="h-8 w-8 text-indigo-400" />
              <span className="ml-2 text-xl font-bold">SplitBill</span>
            </div>
            <div className="text-gray-400">
              © 2024 SplitBill. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Main;
