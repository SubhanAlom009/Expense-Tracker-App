"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import aj from "@/app/lib/arcjet";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => {
  const serialized = { ...obj };

  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }

  return serialized;
};

export async function createTransaction(data) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    //Arcjet to add rate limiting

    // const req = await request();

    // const decision = await aj.protect(req, {
    //   userId,
    //   requested: 1,
    // });

    // if (decision.isDenied) {
    //   if (decision.reason.isRateLimit()) {
    //     throw new Error("Rate limit exceeded. Please try again later.");
    //   }
    //   throw new Error("Request denied by Arcjet");
    // }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    const currentBalance = account.balance?.toNumber?.() || 0;
    const amount = Number(data.amount); // ensure this is a number
    const balanceChange = data.type === "EXPENSE" ? -amount : amount;
    const newBalance = currentBalance + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: {
          id: data.accountId,
        },
        data: {
          balance: newBalance,
        },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/accounts/${transaction.accountId}`);

    return {
      success: true,
      message: "Transaction created successfully",
      data: serializeAmount(transaction),
    };
  } catch (error) {
    console.log("Error creating transaction:", error?.message);
    throw new Error(error?.message || "Error creating transaction");
  }
}

// Helper function to calculate the next recurring date
function calculateNextRecurringDate(date, interval) {
  const nextDate = new Date(date);
  switch (interval) {
    case "DAILY":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "WEEKLY":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "MONTHLY":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "YEARLY":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      throw new Error("Invalid recurring interval");
  }
  return nextDate;
}

export async function scanReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const arrayBuffer = await file.arrayBuffer();

    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: base64String,
        },
      },
      prompt,
    ]);

    const response = await result.response;

    const text = await response.text();
    const cleanText = text.replace(/```(?:json)?[\n\r]+/g, "").trim();

    try {
      const data = JSON.parse(cleanText);
      return{
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        merchantName: data.merchantName,
        category: data.category,
      }
    } catch (error) {
      console.log("Error parsing JSON:", error?.message);
      throw new Error("Invalid JSON format in response");
      
    }
  } catch (error) {
    console.log("Error scanning receipt:", error?.message);
    throw new Error(error?.message || "Error scanning receipt");
  }
}

// Edit function to update a transaction -TODO
