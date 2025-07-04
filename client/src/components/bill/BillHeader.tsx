import formatDate from "@/utils/utils";
import React, { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
type BillHeaderProps = {
  isEditing: boolean;
  exposeValue: (getter: () => { name: string; date: string }) => void;
  defaultValue: { name: string; date: string };
};
const BillHeader: React.FC<BillHeaderProps> = ({
  isEditing,
  exposeValue,
  defaultValue,
}) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    exposeValue(() => ({
      name: nameRef.current?.value ?? "",
      date: dateRef.current?.value ?? "",
    }));
  }, [exposeValue]);
  if (isEditing) {
    return (
      <>
        <div className="text-center mb-6 flex flex-col max-w-[200px] mx-auto">
          <input
            type="text"
            ref={nameRef}
            defaultValue={defaultValue.name}
            placeholder={"Enter Bill Name / Place"}
            className="border outline-none pl-2 py-[2px] border-mainBgColor rounded-lg "
          />
          <input
            type="date"
            ref={dateRef}
            defaultValue={
              defaultValue.date
                ? new Date(defaultValue.date).toISOString().split("T")[0]
                : ""
            }
          />
          <p className="text-red-500 text-[10px]">
            If no changes are made, the defaultValue will remain the same.
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="text-center mb-6">
      <h2 className="text-xl font-bold text-gray-900">{defaultValue.name}</h2>
      <p className="text-gray-600">{formatDate(defaultValue.date)}</p>
    </div>
  );
};

export default BillHeader;
