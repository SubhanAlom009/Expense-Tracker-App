import { inngest } from "@/app/lib/inngest/client";
import { checkBudgetAlert, handleRecurringTransactions, helloWorld, processRecurringTransaction } from "@/app/lib/inngest/functions";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlert,
    handleRecurringTransactions,
    processRecurringTransaction,
    /* your functions will be passed here later! */
  ],
});
