import { API } from "@/services/API";
import type { BillItem } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
const allowedFiles = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/heic",
  "image/heif",
];

type responseData = {
  items: {
    item_id: number;
    item_name: string;
    quantity: number;
    pricePerUnit: number;
  }[];
  subtotals: {
    subtotal: number;
    grandTotal: number;
    add_charges: {
      PB1: number;
      service_charge: number;
    };
    discount?: unknown;
  };
};

export type billData = {
  items: BillItem[];
  subtotals: {
    subtotal: number;
    grand_totals: number;
    add_charges: {
      PB1: number;
      service_charge: number;
    };
    discount: { discount_total: number; discount_percentage: number };
    price_after_discount: number;
  };
};

const useGetBillData = () => {
  const [billData, setBillData] = useState<billData | null>(null);

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      if (!allowedFiles.includes(file.type)) {
        toast.error("Unsupported file type");
        return;
      }

      console.log(file);

      const formData = new FormData();
      formData.append("file", file);

      const response = await API.post("/split", formData);

      if (!response.status) {
        toast.error("File upload failed");
        return;
      }

      const parsedData = {
        items: response.data.items.map(
          (item: {
            item_id: number;
            item_name: string;
            quantity: number;
            pricePerUnit: number;
          }) => ({
            id: item.item_id,
            item_name: item.item_name,
            pricePerUnit: item.pricePerUnit,
            quantity: item.quantity,
            assignedTo: [],
          })
        ),
        subtotals: response.data.subtotals,
      };

      setBillData(parsedData);
      return parsedData; // return parsed for mutateAsync
    },

    onError: (e) => {
      if (axios.isAxiosError(e) && e.response) {
        const errorMessage = e.response.data?.message || "Login Gagal";
        toast.error(errorMessage);
      } else {
        toast.error("Terdapat kesalahan! Mohon coba lagi");
      }
    },
  });

  return {
    uploadFile: uploadFile.mutateAsync,
    isLoading: uploadFile.isPending,
    error: uploadFile.error,
    billData,
  };
};

export default useGetBillData;
