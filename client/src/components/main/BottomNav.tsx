import { Camera, History, House, LayoutDashboard, User } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  const currentUrl = location.pathname;
  return (
    <div className="fixed bottom-5 left-0 right-0 bg-white border-t border-gray-200 rounded-3xl mx-4 shadow-lg flex justify-between items-center p-4 gap-5 z-10">
      {/* Home */}
      <div
        className={`flex-1 flex justify-center items-center opacity-60 hover:opacity-100 transition-opacity ${
          currentUrl === "/app" ? "opacity-100" : ""
        }`}
      >
        <Link to="/app/" className="flex flex-col items-center">
          <House className="h-6 w-6" color="#301934" />
        </Link>
      </div>

      {/* History */}
      <div
        className={`flex-1 flex justify-center items-center opacity-60 hover:opacity-100 transition-opacity ${
          currentUrl === "/app/history" ? "opacity-100" : ""
        }`}
      >
        <Link to="/app/" className="flex flex-col items-center">
          <History className="h-6 w-6" color="#301934" />
        </Link>
      </div>

      {/* Camera */}
      <div className="relative flex-1 flex justify-center items-center ">
        <Link
          to="/app/camera"
          className="relative z-20 bg-mainBgColor text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
          style={{ marginTop: "-32px" }}
        >
          <Camera className="h-7 w-7" />
        </Link>
      </div>

      {/* Other */}
      <div
        className={`flex-1 flex justify-center items-center opacity-60 hover:opacity-100 transition-opacity ${
          currentUrl === "/app/history" ? "opacity-100" : ""
        }`}
      >
        <Link to="/app/other" className="flex flex-col items-center">
          {/* Replace with your third icon */}
          <LayoutDashboard className="h-6 w-6" color="#301934" />
        </Link>
      </div>

      {/* Profile */}
      <div
        className={`flex-1 flex justify-center items-center opacity-60 hover:opacity-100 transition-opacity ${
          currentUrl === "/app/profile" ? "opacity-100" : ""
        }`}
      >
        <Link to="/app/" className="flex flex-col items-center">
          <User className="h-6 w-6" color="#301934" />
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
