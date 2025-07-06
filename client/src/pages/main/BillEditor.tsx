import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, SquarePen, Check } from "lucide-react";
import BillHeader from "@/components/bill/BillHeader";
import BillDashboard from "@/components/bill/BillDashboard";
export type BillHeaderProps = {
  name: string;
  date: string;
};
const BillEditor = () => {
  const navigate = useNavigate();
  const editButtonRef = useRef<HTMLButtonElement | null>(null);
  const billHeaderDivRef = useRef<HTMLDivElement | null>(null);
  const getInputValues = useRef<() => { name: string; date: string }>(() => ({
    name: "",
    date: "",
  }));

  const [isEditingHeader, setIsEditingHeader] = useState<boolean>(false);
  const [billHeader, setBillHeader] = useState<BillHeaderProps>({
    name: "Gourmet Coffee",
    date: "Sept 4, 2024",
  });

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
        <BillDashboard billHeaderData={billHeader} />
      </div>
    </div>
  );
};

export default BillEditor;
