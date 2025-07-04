import React from "react";
import { Outlet } from "react-router-dom";

const BillLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default BillLayout;
