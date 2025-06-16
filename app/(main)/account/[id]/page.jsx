import { getAccountWithTransactions } from "@/actions/accounts";
import NotFound from "@/app/not-found";
import React, { Suspense } from "react";
import TransactionTable from "../_component/transactionTable";
import { BarLoader } from "react-spinners";
import AccountChart from "../_component/accountChart";

async function AccountsPage({ params }) {

  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);

  if (!accountData) {
    NotFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="p-6 max-w-screen ">
      <div className="flex justify-between items-end mb-6">
        <div className="w-screen">
          <h1 className="gradient-title text-6xl mb-4">{accountData.name}</h1>
          <p className="text-gray-600 mb-4">Type: {accountData.type}</p>
        </div>

        <div className=" w-screen items-end flex flex-col justify-end">
          <p className="text-gray-600 font-bold text-2xl mb-2">
            Balance: ${accountData.balance.toFixed(2)}
          </p>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">
            {accountData._count.transactions} Transactions
          </h2>
        </div>
      </div>

      {/* Charts section */}
      <Suspense
        fallback={<BarLoader className="mx-auto" color="#4F46E5" width={100} />}
      >
        <AccountChart transactions={transactions} />
      </Suspense>
      {/* Transaction Table */}
      <Suspense
        fallback={<BarLoader className="mx-auto" color="#4F46E5" width={100} />}
      >
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
}

export default AccountsPage;
