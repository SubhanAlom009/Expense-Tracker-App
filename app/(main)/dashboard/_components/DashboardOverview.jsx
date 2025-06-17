"use client";

import React, { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";

function DashboardOverview({ accounts, transactions }) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((account) => account.isDefault)?.id || accounts[0]?.id
  );

  const accountTransactions = transactions.filter(
    (transaction) => transaction.accountId === selectedAccountId
  );

  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#ff0000",
    "#00c49f",
    "#0088FE",
    "#d0ed57",
    "#a4de6c",
  ];

  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear() &&
      transaction.type === "EXPENSE"
    );
  });

  const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += transaction.amount;
    return acc;
  }, {});

  //   format data for pie chart
  const pieChartData = Object.entries(expensesByCategory).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-4">
      <Card>
        <CardHeader className="flex justify-between flex-row items-center space-y-0">
          <CardTitle className={"text-base font-medium"}>
            Recent Transactions
          </CardTitle>
          <Select
            value={selectedAccountId}
            onValueChange={(value) => setSelectedAccountId(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Acoount" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-muted-foreground">No transactions found.</p>
          ) : (
            recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="mb-2 flex space-y-4 justify-between items-center"
              >
                <div>
                  <p className="text-sm font-medium">
                    {transaction.description || "untitled Transaction"} -{" "}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(transaction.date), "PP")}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      transaction.type === "EXPENSE"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {transaction.type === "EXPENSE" ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                    ${transaction.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={"text-base font-medium"}>
            Monthly Expense Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-5">
          {pieChartData.length === 0 ? (
            <p className="text-muted-foreground p-4">
              No expenses for this month.
            </p>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardOverview;
