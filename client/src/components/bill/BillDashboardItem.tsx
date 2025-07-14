// import type { BillItem } from "@/types/types";
// import React from "react";

// type BillDashboardItemProps = {
//   item: BillItem;
//   editItemId: number | null;
//   setEditItemId: React.Dispatch<React.SetStateAction<number | null>>;
//   focusedItemId: number | null;
//   setFocusedItemId: React.Dispatch<React.SetStateAction<number | null>>;
//   rawPriceMap: Record<number, string>;
//   setRawPriceMap: React.Dispatch<React.SetStateAction<Record<number, string>>>;
//   updateItem: (
//     id: number,
//     field: keyof BillItem,
//     value: string | number | string[]
//   ) => void;
//   removeItem: (id: number) => void;
// };

// const BillDashboardItem: React.FC<BillDashboardItemProps> = ({
//   item,
//   editItemId,
//   focusedItemId,
//   rawPriceMap,
//   removeItem,
//   setEditItemId,
//   setFocusedItemId,
//   setRawPriceMap,
//   updateItem,
// }) => {
//   const isEditing = editItemId === item.id;

//   return (
//     <div
//       key={item.id}
//       className="bg-white rounded-xl p-4 flex items-center justify-between"
//     >
//       <div className="items-center grid grid-cols-8 gap-2 w-full">
//         {/* Quantity */}
//         {isEditing ? (
//           <input
//             type="number"
//             value={item.quantity}
//             onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
//             className="col-span-1 max-w-[40px] border-b text-gray-700 text-sm bg-transparent focus:outline-none text-center"
//             min={1}
//           />
//         ) : (
//           <span className="text-gray-600 mr-3 max-w-[30px] col-span-1">
//             {item.quantity}x
//           </span>
//         )}

//         {/* Item Name */}
//         {isEditing ? (
//           <input
//             type="text"
//             value={item.item_name}
//             onChange={(e) => updateItem(item.id, "item_name", e.target.value)}
//             className="col-span-3 border-b text-gray-800 bg-transparent font-medium text-sm focus:outline-none"
//             autoFocus={focusedItemId === item.id}
//             onBlur={() => setFocusedItemId(null)}
//           />
//         ) : (
//           <span className="font-medium text-gray-900 col-span-3">
//             {item.item_name}
//           </span>
//         )}

//         {/* Price */}
//         <div className="col-span-2 flex items-center">
//           <span className="text-gray-500">Rp</span>
//           {isEditing ? (
//             <input
//               type="text"
//               value={
//                 rawPriceMap[item.id] !== undefined
//                   ? rawPriceMap[item.id]
//                   : item.pricePerUnit.toLocaleString("id-ID")
//               }
//               onChange={(e) => {
//                 const raw = e.target.value.replace(/[^\d]/g, "");
//                 if (raw === "") {
//                   setRawPriceMap((prev) => ({
//                     ...prev,
//                     [item.id]: "",
//                   }));
//                   updateItem(item.id, "pricePerUnit", 0);
//                 } else if (!isNaN(Number(raw))) {
//                   const value = Number(raw);
//                   setRawPriceMap((prev) => ({
//                     ...prev,
//                     [item.id]: value.toLocaleString("id-ID"),
//                   }));
//                   updateItem(item.id, "pricePerUnit", value);
//                 }
//               }}
//               onBlur={() => {
//                 setEditItemId(null);
//                 setRawPriceMap((prev) => {
//                   const newMap = { ...prev };
//                   delete newMap[item.id];
//                   return newMap;
//                 });
//               }}
//               className="ml-1 w-full text-left font-semibold text-gray-900 border-b focus:outline-none"
//               inputMode="numeric"
//               pattern="[0-9]*"
//             />
//           ) : (
//             <span className="ml-1 text-gray-800 font-semibold  decoration-1 cursor-pointer">
//               {item.pricePerUnit.toLocaleString("id-ID")}
//             </span>
//           )}
//         </div>

//         {/* Actions */}
//         <div className="col-span-2 flex items-center justify-end">
//           {isEditing ? (
//             <button
//               onClick={() => setEditItemId(null)}
//               className="text-green-600 cursor-pointer hover:text-green-800 p-1"
//               title="Save"
//             >
//               <Check className="h-6 w-6" />
//             </button>
//           ) : (
//             <button
//               onClick={() => setEditItemId(item.id)}
//               className="text-mainBgColor opacity-80 hover:text-mainBgColor hover:opacity-100 p-1 cursor-pointer"
//               title="Edit"
//             >
//               <SquarePen className="h-4 w-4" />
//             </button>
//           )}
//           <button
//             onClick={() => removeItem(item.id)}
//             className="text-red-500 cursor-pointer hover:text-red-700 p-1"
//             title="Remove"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BillDashboardItem;
