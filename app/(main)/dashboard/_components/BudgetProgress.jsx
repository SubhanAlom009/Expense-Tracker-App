"use client";

import React, { use, useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil, X } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { updateBudget } from "@/actions/budget";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

function BudgetProgress({ initialBudget, currentExpenses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(initialBudget?.amount || "");

  const {
    data: updatedBudget,
    loading: isLoading,
    error,
    fn: updateBudgetFn,
  } = useFetch(updateBudget);

  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid budget amount.");
      return;
    }

    await updateBudgetFn(amount);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully!");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(`Error updating budget: ${error.message}`);
    }
  }, [error]);

  const handleCancel = () => {
    setIsEditing(false);
    setNewBudget(initialBudget?.amount || "");
  };

  return (
    <Card className={"mb-6"}>
      <CardHeader>
        <CardTitle>Monthly Budget (Default Account)</CardTitle>
        <div>
          {isEditing ? (
            <div className="flex items-center">
              <Input
                type={"number"}
                value={newBudget}
                onChange={(e) => setNewBudget(Number(e.target.value))}
                placeholder="Enter new budget amount"
                className="w-40 inline-block"
                autoFocus
                disabled={isLoading}
              />
              <Button
                variant={"ghost"}
                onClick={handleUpdateBudget}
                size={"icon"}
                className="ml-2 cursor-pointer hover:bg-gray-100 transition-colors"
                disabled={isLoading}
              >
                <Check className="w-4 h-4 mr-2 text-green-500" />
              </Button>
              <Button
                variant={"ghost"}
                onClick={handleCancel}
                size={"icon"}
                className="ml-2 cursor-pointer hover:bg-gray-100 transition-colors"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2 text-red-500" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <CardDescription>
                {initialBudget
                  ? `$${currentExpenses.toFixed(
                      2
                    )} of $${initialBudget.amount.toFixed(
                      2
                    )} used (${percentUsed.toFixed(2)}%)`
                  : "No budget set"}
              </CardDescription>
              <Button
                variant={"ghost"}
                onClick={() => setIsEditing(true)}
                size={"sm"}
                className="ml-2 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <Pencil className="w-4 h-4 mr-2" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {initialBudget && (
          <div>
            <Progress
              value={percentUsed}
              extraStyles={`${
                percentUsed >= 90
                  ? "bg-red-500"
                  : percentUsed >= 70
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BudgetProgress;
