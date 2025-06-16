import { z } from "zod";


export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["SAVINGS","CURRENT"]),
  balance: z.number().min(0, "Balance must be a positive number"),
  isDefault: z.boolean().default(false), 
});


export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().min(0, "Amount must be a positive number"),
  description: z.string().optional(),
  date: z.date({required_error: "Date is required"}),
  category: z.string().min(1, "Category is required"),
  receiptUrl: z.string().url().optional(),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
  accountId: z.string().min(1, "Account ID is required"),
}).superRefine((data,ctx) => {
  if (data.isRecurring && !data.recurringInterval) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Recurring interval is required for recurring transactions",
      path: ["recurringInterval"],
    })
  }
})