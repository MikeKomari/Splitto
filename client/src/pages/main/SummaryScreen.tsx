import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, ChevronDown, ChevronUp, Info } from "lucide-react";
import type { BillItem, PersonInBill } from "@/types/types";
import type { getBillDataPayload } from "@/types/billingAppTypes";
import type { BillHeaderProps } from "./BillEditor";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const [allExpanded, setAllExpanded] = useState(false);
  // const [expandedPerson, setExpandedPerson] = useState<number | null>(null);
  const [expandedPeople, setExpandedPeople] = useState<Set<number>>(new Set());
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!location.state) return;

    const { billData, people, billHeaderData } =
      location.state as SummaryScreenProps;

    setInitialData({ billData, people, billHeaderData });
    setItems(billData.items);
    setBillHeaderData(billHeaderData);
    setPeople(people);
  }, []);

  const getTax = (total: number) =>
    ((initialData?.billData.initialTaxPercent || 0) * total) / 100;

  const getService = (total: number) =>
    ((initialData?.billData.initialServicePercent || 0) * total) / 100;

  const getGrandTotal = (total: number) =>
    total + getTax(total) + getService(total);

  const toggleExpanded = (personId: number) => {
    setExpandedPeople((prev) => {
      const updated = new Set(prev);
      if (updated.has(personId)) {
        updated.delete(personId);
      } else {
        updated.add(personId);
      }
      return updated;
    });
  };

  const expandAll = () => {
    if (allExpanded) {
      setExpandedPeople(new Set());
    } else {
      setExpandedPeople(new Set(people?.map((p) => p.id)));
    }
    setAllExpanded(!allExpanded);
  };

  const handleScreenshot = async () => {
    // 1. Expand all if not already
    if (!allExpanded) {
      expandAll();
      // wait for the DOM to render expanded state
      await new Promise((r) => setTimeout(r, 300));
    }

    // 2. Take screenshot of the ref
    if (captureRef.current) {
      captureRef.current.style.color = "#000";
      captureRef.current.style.backgroundColor = "#fff";
      const canvas = await html2canvas(captureRef.current, {
        scale: 2, // higher quality
      });
      const image = canvas.toDataURL("image/png");

      // 3. Create a temporary download link
      const link = document.createElement("a");
      link.href = image;
      link.download = "bill-summary.png";
      link.click();
    }
  };

  const handleDownloadPDF = async () => {
    if (!allExpanded) {
      expandAll();
      await new Promise((r) => setTimeout(r, 300)); // wait for DOM updates
    }

    if (captureRef.current) {
      captureRef.current.style.color = "#000";
      captureRef.current.style.backgroundColor = "#fff";
      const canvas = await html2canvas(captureRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("bill-summary.pdf");
    }
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
            <button className="p-1" onClick={() => navigate("/progress")}>
              <Share2 className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div
        ref={captureRef}
        className="max-w-5xl max-md:max-w-md mx-auto px-4 py-6"
      >
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
              const isExpanded = expandedPeople.has(person.id);

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
                            {getGrandTotal(person.total).toLocaleString(
                              "id-ID"
                            )}
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
                            Rp {getTax(person.total).toLocaleString("id-ID")}
                          </span>
                        </div>
                        {/* Service */}
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Service </span>
                          <span>
                            Rp{" "}
                            {getService(person.total).toLocaleString("id-ID")}
                          </span>
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
                {initialData?.billData.initialDiscountValue?.toLocaleString(
                  "id-ID"
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 justify-between text-gray-600">
              <span>Tax</span>
              <div className="flex items-center justify-center ">
                <p className="text-blue-600 text-center max-md:w-[27px] w-[30px]  bg-transparent  border-blue-300 focus:outline-none">
                  {initialData?.billData.initialTaxPercent?.toLocaleString(
                    "id-ID"
                  ) || 0}
                </p>
                <span>%</span>
              </div>
              <span className="text-end">
                Rp&nbsp;
                {getTax(
                  initialData?.billData.initialSubtotal || 0
                ).toLocaleString("id-ID") || 0}
              </span>
            </div>
            <div className="grid grid-cols-3 text-gray-600">
              <span>Service</span>
              <div className="flex items-center justify-center ">
                <p className="text-blue-600 text-center max-md:w-[27px] w-[30px]  bg-transparent  border-blue-300 focus:outline-none">
                  {initialData?.billData.initialServicePercent?.toLocaleString(
                    "id-ID"
                  ) || 0}
                </p>
                <span>%</span>
              </div>
              <span className="text-end">
                Rp&nbsp;
                {getService(
                  initialData?.billData.initialSubtotal || 0
                ).toLocaleString("id-ID") || 0}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total Bill</span>
                <span>
                  Rp&nbsp;
                  {getGrandTotal(
                    initialData?.billData.initialSubtotal || 0
                  ).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="my-4 text-red-400 text-center">
          Don't forget to take a screenshot!
        </p>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={expandAll}
            className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold"
          >
            Expand All
          </button>
          <button
            onClick={() => navigate("/app")}
            className="flex-1 bg-mainBgColor text-white py-4 rounded-2xl font-semibold"
          >
            Done
          </button>
        </div>
        {/* <div className="flex space-x-4">
          <button
            onClick={handleScreenshot}
            className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold"
          >
            Screenshot
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex-1 bg-mainBgColor text-white py-4 rounded-2xl font-semibold"
          >
            Save to PDF
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default SummaryScreen;
