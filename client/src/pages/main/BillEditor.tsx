import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, SquarePen, Check } from "lucide-react";
import BillHeader from "@/components/bill/BillHeader";
import BillDashboard from "@/components/bill/BillDashboard";
import type { getBillDataPayload } from "@/types/billingAppTypes";
export type BillHeaderProps = {
  name: string;
  date: string;
};
const BillEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialItems, setInitialItems] = useState<getBillDataPayload | null>(
    null
  );
  const editButtonRef = useRef<HTMLButtonElement | null>(null);
  const billHeaderDivRef = useRef<HTMLDivElement | null>(null);
  const getInputValues = useRef<() => { name: string; date: string }>(() => ({
    name: "",
    date: "",
  }));

  const [isEditingHeader, setIsEditingHeader] = useState<boolean>(false);
  const [billHeader, setBillHeader] = useState<BillHeaderProps>({
    name: "Bill Name",
    date:
      "" +
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  });

  useEffect(() => {
    const init = location.state as getBillDataPayload;
    console.log(init);

    if (init) {
      setInitialItems(init);
    }
  }, [location.state]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isEditingHeader &&
        editButtonRef.current &&
        !editButtonRef.current.contains(e.target as Node) &&
        billHeaderDivRef.current &&
        !billHeaderDivRef.current.contains(e.target as Node)
      ) {
        setIsEditingHeader(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditingHeader]);

  const handleSave = () => {
    const { name, date } = getInputValues.current();

    setBillHeader((prev) => ({
      name: name.trim() || prev.name,
      date: date.trim() || prev.date,
    }));

    setIsEditingHeader(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl max-md:max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-1 cursor-pointer">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Edit Bill</h1>

            {isEditingHeader ? (
              <button
                ref={editButtonRef}
                onClick={() => {
                  handleSave();
                  setIsEditingHeader(!isEditingHeader);
                }}
                className="p-1"
              >
                <Check className="h-6 w-6 text-gray-600" />
              </button>
            ) : (
              <button
                ref={editButtonRef}
                onClick={() => setIsEditingHeader(!isEditingHeader)}
                className="p-1"
              >
                <SquarePen className="h-6 w-6 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl max-md:max-w-md mx-auto px-4 py-6">
        <div ref={billHeaderDivRef}>
          <BillHeader
            isEditing={isEditingHeader}
            defaultValue={billHeader}
            exposeValue={(getter) => {
              getInputValues.current = getter;
            }}
          />
        </div>

        {/* Bill Dashboard */}
        {initialItems ? (
          <BillDashboard
            billHeaderData={billHeader}
            discountType={initialItems.discountType}
            initialDiscountValue={initialItems.initialDiscountValue}
            initialServicePercent={initialItems.initialServicePercent}
            initialSubtotal={initialItems.initialSubtotal}
            items={initialItems.items}
            key={initialItems.initialTaxPercent}
          />
        ) : (
          <p className="text-center text-gray-500">Loading bill data...</p>
        )}
      </div>
    </div>
  );
};

export default BillEditor;
