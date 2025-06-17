export const dynamic = "force-dynamic";

import { getAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import React from "react";
import AddTransactionForm from "../_components/AddTransaction";

async function TransactionPage() {
  const accounts = await getAccounts();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="gradient-title text-5xl mb-8">Add Transaction</h1>

      <AddTransactionForm accounts={accounts} categories={defaultCategories} />
    </div>
  );
}

export default TransactionPage;
