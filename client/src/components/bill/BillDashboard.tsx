import type { BillHeaderProps } from "@/pages/main/BillEditor";
import type { getBillDataPayload } from "@/types/billingAppTypes";
import type { BillItem } from "@/types/types";
import { Check, Plus, SquarePen, X } from "lucide-react";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
type BillHeaderDashboardProps = {
  billHeaderData: BillHeaderProps;
} & getBillDataPayload;
const BillDashboard: React.FC<BillHeaderDashboardProps> = ({
  billHeaderData,
  discountType = "amount",
  initialDiscountValue = 0,
  items = [],
  initialTaxPercent = 11,
  initialServicePercent = 5,
  initialSubtotal = 0,
}) => {
  const navigate = useNavigate();
  const [billItems, setBillItems] = useState<BillItem[]>(items || []);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<number | null>(null);
  const [rawPriceMap, setRawPriceMap] = useState<Record<number, string>>({});

  const [taxPercent, setTaxPercent] = useState(initialTaxPercent);
  const [servicePercent, setServicePercent] = useState(initialServicePercent);
  const subtotal = billItems.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0
  );
  const taxAmount = subtotal * (taxPercent / 100);
  const serviceAmount = subtotal * (servicePercent / 100);

  const [discountUsedType, setDiscountUsedType] = useState<
    "percent" | "amount"
  >(discountType);
  const [discountValue, setDiscountValue] = useState(initialDiscountValue);

  const discountAmount =
    discountType === "percent"
      ? subtotal * (discountValue / 100)
      : discountValue;

  const total = subtotal + taxAmount + serviceAmount - discountAmount;

  const updateItem = (
    id: number,
    field: keyof (typeof billItems)[0],
    value: string | number
  ) => {
    setBillItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: typeof value === "string" ? value : Number(value),
            }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setBillItems(billItems.filter((item) => item.id !== id));
  };

  const addItem = () => {
    const newId = Date.now();
    const newItem = {
      id: newId,
      item_name: "",
      pricePerUnit: 0,
      quantity: 1,
      assignedTo: [],
    };
    setBillItems((prev) => [...prev, newItem]);
    setEditItemId(newId);
    setFocusedItemId(newId);
    setRawPriceMap((prev) => ({ ...prev, [newId]: "" }));
  };

  const handleSaveEdit = () => {
    if (!items) {
      toast.error("At least save one item before proceeding.");
      return;
    }
    const tempBillData = {
      items: billItems,
      taxPercent,
      initialServicePercent: servicePercent,
      discountType: discountUsedType,
      initialDiscountValue: discountValue,
      initialSubtotal: subtotal,
    };
    navigate("/app/bills/assign/1", {
      state: { billData: tempBillData, billHeaderData },
    });
  };

  return (
    <>
      {/* Items List */}
      <div className="space-y-3 mb-6 min-h-[45vh]">
        {billItems.map((item) => {
          const isEditing = editItemId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 flex items-center justify-between"
            >
              <div className="items-center grid grid-cols-8 gap-2 w-full">
                {/* Quantity */}
                {isEditing ? (
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, "quantity", e.target.value)
                    }
                    className="col-span-1 max-w-[40px] border-b text-gray-700 text-sm bg-transparent focus:outline-none text-center"
                    min={1}
                  />
                ) : (
                  <span className="text-gray-600 mr-3 max-w-[30px] col-span-1">
                    {item.quantity}x
                  </span>
                )}

                {/* Item Name */}
                {isEditing ? (
                  <input
                    type="text"
                    value={item.item_name}
                    onChange={(e) =>
                      updateItem(item.id, "item_name", e.target.value)
                    }
                    className="col-span-3 border-b text-gray-800 bg-transparent font-medium text-sm focus:outline-none"
                    autoFocus={focusedItemId === item.id}
                    onBlur={() => setFocusedItemId(null)}
                  />
                ) : (
                  <span className="font-medium text-gray-900 col-span-3">
                    {item.item_name}
                  </span>
                )}

                {/* Price */}
                <div className="col-span-2 flex items-center">
                  <span className="text-gray-500">Rp</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={
                        rawPriceMap[item.id] !== undefined
                          ? rawPriceMap[item.id]
                          : item.pricePerUnit.toLocaleString("id-ID")
                      }
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, "");
                        if (raw === "") {
                          setRawPriceMap((prev) => ({
                            ...prev,
                            [item.id]: "",
                          }));
                          updateItem(item.id, "pricePerUnit", 0);
                        } else if (!isNaN(Number(raw))) {
                          const value = Number(raw);
                          setRawPriceMap((prev) => ({
                            ...prev,
                            [item.id]: value.toLocaleString("id-ID"),
                          }));
                          updateItem(item.id, "pricePerUnit", value);
                        }
                      }}
                      onBlur={() => {
                        setEditItemId(null);
                        setRawPriceMap((prev) => {
                          const newMap = { ...prev };
                          delete newMap[item.id];
                          return newMap;
                        });
                      }}
                      className="ml-1 w-full text-left font-semibold text-gray-900 border-b focus:outline-none"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  ) : (
                    <span className="ml-1 text-gray-800 font-semibold  decoration-1 cursor-pointer">
                      {item.pricePerUnit.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end">
                  {isEditing ? (
                    <button
                      onClick={() => setEditItemId(null)}
                      className="text-green-600 cursor-pointer hover:text-green-800 p-1"
                      title="Save"
                    >
                      <Check className="h-6 w-6" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditItemId(item.id)}
                      className="text-mainBgColor opacity-80 hover:text-mainBgColor hover:opacity-100 p-1 cursor-pointer"
                      title="Edit"
                    >
                      <SquarePen className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 cursor-pointer hover:text-red-700 p-1"
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Item Button */}
        <button
          onClick={addItem}
          className="w-full bg-white rounded-xl p-4 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors flex items-center justify-center text-blue-600 cursor-pointer"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Item
        </button>
      </div>

      {/* Bill Summary */}
      <div className="bg-white rounded-xl p-4 mb-6">
        <div className="space-y-2">
          <div className="grid grid-cols-2  text-gray-600">
            <span>Total item</span>
            <span className="text-end">
              {billItems.reduce((sum, i) => sum + i.quantity, 0)}x
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>Rp&nbsp;{subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="grid grid-cols-3 text-gray-600">
            <span>Discount</span>
            <div className="flex items-center justify-center gap-1">
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountUsedType(e.target.value as "percent" | "amount")
                }
                className="text-blue-600 bg-transparent border-b border-blue-300 focus:outline-none text-md"
              >
                <option value="percent">%</option>
                <option value="amount">Rp</option>
              </select>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setDiscountValue(value);
                }}
                className="text-blue-600 text-center w-[60px] bg-transparent border-b border-blue-300 focus:outline-none"
              />
            </div>
            <span className="text-end text-gray-600">
              - Rp&nbsp;{discountAmount.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="grid grid-cols-3 justify-between text-gray-600">
            <span>Tax</span>
            <div className="flex items-center justify-center ">
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => {
                  const value = Math.min(Number(e.target.value), 100);
                  setTaxPercent(value);
                }}
                className="text-blue-600 text-center max-md:w-[27px] w-[30px]  bg-transparent border-b border-blue-300 focus:outline-none"
                max={100}
              />
              <span>%</span>
            </div>
            <span className="text-end">
              Rp&nbsp;{taxAmount.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="grid grid-cols-3 text-gray-600">
            <span>Service</span>
            <div className="flex items-center justify-center ">
              <input
                type="number"
                value={servicePercent}
                onChange={(e) => {
                  const value = Math.min(Number(e.target.value), 100);
                  setServicePercent(value);
                }}
                className="text-blue-600 text-center max-md:w-[27px] w-[30px]  bg-transparent border-b border-blue-300 focus:outline-none"
                max={100}
              />
              <span>%</span>
            </div>
            <span className="text-end">
              Rp&nbsp;{serviceAmount.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total Bill</span>
              <span>Rp&nbsp;{total.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={() => handleSaveEdit()}
        className="cursor-pointer hover:opacity-90 w-full bg-mainBgColor text-white py-4 rounded-2xl font-semibold text-lg"
      >
        Save Edit
      </button>
      <button
        onClick={() => navigate("/app")}
        className="cursor-pointer hover:opacity-80 w-full bg-white border-1 border-mainBgColor mt-4 text-mainBgColor py-4 rounded-2xl font-semibold text-lg"
      >
        Reset
      </button>
    </>
  );
};

export default BillDashboard;
