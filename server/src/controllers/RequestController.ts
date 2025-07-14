import { RequestHandler } from "express";
import axios from "axios";
import OpenAI from "openai";
import multer from "multer";
import fs from "fs/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const upload = multer({ dest: "uploads" });

export const RequestSplitBill: RequestHandler[] = [
  upload.single("file"),
  async (req, res, next) => {
    try {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        res.status(500).json({ error: "OpenAI API key not configured" });
        return;
      }
      const file = req.file as Express.Multer.File;
      if (!file) {
        res.status(400).json({ message: "No image file uploaded" });
        return;
      }
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/JPG",
        "image/heic",
        "image/heif",
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        res.status(400).json({
          message: "Only JPEG, PNG, JPG, and HEIC/HEIF images are allowed",
        });
        return;
      }
      const imageBuffer = await fs.readFile(file.path);
      const base64Image = imageBuffer.toString("base64");
      const imageDataUrl = `data:image/${file.mimetype};base64,${base64Image}`;
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  `From this image, analyze for the items name, quantity and prices and the sub totals(before tax), grandTotals, account for the taxes too (PB1 and such), service charge if exist and subtotal following this JSON schema ONLY, no additional info except the given data and no string:\n\n` +
                  `{
                    "items": [
                      {
                        "item_id": number,
                        "item_name": "string",
                        "quantity": number,
                        "pricePerUnit": number
                      }
                    ],
                    "subtotals": {
                      "subtotal": number,
                      "add_charges": {
                        "PB1": number,
                        "service_charge": number
                      },
                      "grand_totals": number,
                      "discount" : {
                        "discount_total": number,
                        "discount_percentage": number,
                      },
                      "price_after_discount": number,
                    }
                  }
                  return without any further quotation just direct json format`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
      });
      const data = await response.choices[0].message.content;
      if (!data) {
        res.status(400).json({ message: "No data returned from OpenAI" });
        return;
      }
      await fs.unlink(file.path);
      res.json(JSON.parse(data));
    } catch (e) {
      console.error("Error in RequestSplitBill:", e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

export const OCRSplitBill: RequestHandler[] = [
  upload.single("file"),
  async (req, res, next) => {
    try {
      const file = req.file as Express.Multer.File;
      if (!file) {
        res.status(400).json({ message: "No image file uploaded" });
        return;
      }
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/heic",
        "image/heif",
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        res.status(400).json({
          message: "Only JPEG, PNG, JPG, and HEIC/HEIF images are allowed",
        });
        return;
      }
      // Implement OCR logic here
      res.json({ message: "OCR functionality not implemented yet" });
    } catch (e) {
      console.error("Error in OCRSplitBill:", e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

export const SaveSplitBill: RequestHandler = async (req, res) => {
  try {
    const userId = req.params;
    const splitBillData = req.body;
    if (
      !splitBillData ||
      !Array.isArray(splitBillData.people) ||
      splitBillData.people.length === 0
    ) {
      res.status(400).json({ message: "Invalid split bill data: missing people" });
      return;
    }

    await prisma.splitBill.create({
      data: {
        user: {
          connect: { id: splitBillData.userId },
        },
        people: {
          create: splitBillData.people.map((person: any) => ({
            name: person.name,
            items: person.items,
            subtotals: person.subtotals,
          })),
        },
      },
      include: {
        people: true,
      },
    });

    res.status(201).json("Split Bill Data Successfully Created");
  } catch (e) {
    console.error("Error in SaveSplitBill:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};