import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, ChevronDown, ChevronUp, Info } from "lucide-react";
import type { BillItem, PersonInBill } from "@/types/types";
import type { getBillDataPayload } from "@/types/billingAppTypes";
import type { BillHeaderProps } from "./BillEditor";

type SummaryScreenProps = {
  billHeaderData: BillHeaderProps;
  billData: getBillDataPayload;
  people: PersonInBill[];
};

const SummaryScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialData, setInitialData] = useState<SummaryScreenProps | null>(
    null
  );

  const [items, setItems] = useState<BillItem[] | undefined>([]);
  const [billHeaderData, setBillHeaderData] = useState<BillHeaderProps | null>(
    null
  );

  const [people, setPeople] = useState<PersonInBill[] | undefined>([]);
  const [expandedPerson, setExpandedPerson] = useState<number | null>(null);

  const toggleExpanded = (personId: number) => {
    setExpandedPerson(expandedPerson === personId ? null : personId);
  };

  useEffect(() => {
    const init = location.state as SummaryScreenProps;
    if (init) {
      setInitialData(init);
      setItems(init.billData.items);
      setBillHeaderData(init.billHeaderData);
      setPeople(init.people);
    }
  }, []);

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
            <button className="p-1" onClick={() => navigate("/progress")}>
              <Share2 className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl max-md:max-w-md mx-auto px-4 py-6">
        {/* Bill Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {billHeaderData?.name}
          </h2>
          <p className="text-gray-600">{billHeaderData?.date}</p>
        </div>

        {/* People Summary */}
        <div className="space-y-3 mb-6">
          {people &&
            people.map((person) => {
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
                            Rp{" "}
                            {(
                              person.total +
                              person.total *
                                (initialData?.billData.initialServicePercent ??
                                  0) +
                              person.total *
                                (initialData?.billData.initialTaxPercent ?? 0)
                            ).toLocaleString("id-ID")}
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
                        {items &&
                          items
                            .filter((item) =>
                              item.assignedTo?.includes(person.id)
                            )
                            .map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-sm text-gray-600 mb-1"
                              >
                                <span>1x {item.item_name}</span>
                                <span>
                                  Rp {item.pricePerUnit.toLocaleString("id-ID")}{" "}
                                  / 1x
                                </span>
                              </div>
                            ))}

                        {/* <button className="text-blue-600 text-sm font-medium mt-2">
                          Bill Details
                        </button> */}

                        <div className="w-full my-2 h-[1px] bg-gray-300 rounded-3xl"></div>

                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Subtotal </span>
                          <span>Rp {person.total.toLocaleString("id-ID")}</span>
                        </div>
                        {/* Tax */}
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Tax </span>
                          <span>
                            Rp{" "}
                            {(initialData
                              ? person.total *
                                (initialData?.billData?.initialTaxPercent ?? 0)
                              : 0
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>
                        {/* Service */}
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Service </span>
                          <span>Rp {person.total.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Cash Summary */}
        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="space-y-2">
            <div className="grid grid-cols-2  text-gray-600">
              <span>Total item</span>
              <span className="text-end">
                {items?.reduce((sum, i) => sum + i.quantity, 0)}x
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>
                Rp&nbsp;
                {initialData?.billData.initialSubtotal?.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="grid grid-cols-3 text-gray-600">
              <span>Discount</span>
              <div className="flex items-center justify-center gap-1">
                <p className="text-blue-600"></p>
              </div>
              <span className="text-end text-gray-600">
                - Rp&nbsp;
                {/* {initialData?.billData.initialSubtotal?.toLocaleString("id-ID")} */}
              </span>
            </div>
            <div className="grid grid-cols-3 justify-between text-gray-600">
              <span>Tax</span>
              <div className="flex items-center justify-center ">
                <p className="text-blue-600 text-center max-md:w-[27px] w-[30px]  bg-transparent border-b border-blue-300 focus:outline-none">
                  {initialData?.billData.initialTaxPercent?.toLocaleString(
                    "id-ID"
                  )}
                </p>
                <span>%</span>
              </div>
              {/* <span className="text-end">
              Rp&nbsp;{taxAmount.toLocaleString("id-ID")}
            </span> */}
            </div>
            {/* <div className="grid grid-cols-3 text-gray-600">
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
          </div> */}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold">
            Screenshot
          </button>
          <button className="flex-1 bg-mainBgColor text-white py-4 rounded-2xl font-semibold">
            Save to PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryScreen;
