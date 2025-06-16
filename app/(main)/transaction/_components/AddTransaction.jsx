"use client";

import { createTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import useFetch from "@/hooks/useFetch";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CreateAccountDrawer from "@/components/CreateAccountDrawer";
import { format, set } from "date-fns";
import { Calendar1Icon, LoaderCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RecieptScanner from "./RecieptScanner";

function AddTransactionForm({ accounts, categories }) {
  const router = useRouter();

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
    watch,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      date: new Date(),
      amount: "",
      description: "",
      isRecurring: false,
      accountId: accounts.find((account) => account.isDefault)?.id || "",
    },
  });

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const {
    data: transactionResult,
    error,
    fn: TransactionFn,
    loading: transactionLoading,
  } = useFetch(createTransaction);

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  const onSubmit = async (data) => {
  try {
    console.log("Form submitted with data:", data);
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
      recurringInterval: data.isRecurring ? data.recurringInterval : null, // Ensure recurringInterval is null if not recurring
    };
    await TransactionFn(formData);
  } catch (err) {
    toast.error(err?.message || "Something went wrong");
  }
};

  

  useEffect(() => {
    if (transactionResult && !transactionLoading) {
      toast.success("Transaction added successfully!");
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading]);

  const handleScanComplete = (scannedFile) => {
    console.log("Scanned file data:", scannedFile);
    if (scannedFile) {
      setValue("amount", scannedFile.amount.toString());
      setValue("date", new Date(scannedFile.date));
      if(scannedFile.category){
        setValue("category", scannedFile.category);
      }
      if(scannedFile.description){
        setValue("description", scannedFile.description);
      }
      
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      
      {/* Ai receipt */}
      <RecieptScanner onScanComplete={handleScanComplete}/>

      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">
          Type
        </label>
        <Select
          onValueChange={(value) => setValue("type", value)}
          defaultValue={type}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>

        {errors.type && (
          <p className="text-red-500 text-sm">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2 mt-4 grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Amount
          </label>
          <Input
            type={"number"}
            step="0.01"
            placeholder="Enter amount"
            {...register("amount", { valueAsNumber: true })}
          />

          {errors.amount && (
            <p className="text-red-500 text-sm">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="accountId" className="text-sm font-medium">
            Account
          </label>
          <Select
            onValueChange={(value) => setValue("accountId", value)}
            defaultValue={getValues("accountId")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => {
                return (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} (${parseFloat(account.balance).toFixed(2)})
                  </SelectItem>
                );
              })}
              <CreateAccountDrawer>
                <Button variant={"ghost"} className="w-full justify-center">
                  Add Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>

          {errors.accountId && (
            <p className="text-red-500 text-sm">{errors.accountId.message}</p>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <Select
          onValueChange={(value) => setValue("category", value)}
          defaultValue={getValues("category")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => {
              return (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {errors.category && (
          <p className="text-red-500 text-sm">{errors.category.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="date" className="text-sm font-medium">
          Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left"
            >
              {date ? format(date, "PPP") : <span>Pick a Date</span>}
              <Calendar1Icon className="ml-2 w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                if (date) {
                  setValue("date", date);
                }
              }}
              initialFocus
              disabled={(date) =>
                date > new Date() || date < new Date(2000, 0, 1)
              }
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-red-500 text-sm">{errors.date.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="date" className="text-sm font-medium">
          Description
        </label>
        <Input
          type={"text"}
          placeholder="Enter description"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>
      <div className="flex items-center space-x-2 justify-between rounded-lg border p-3">
        <div className="space-y-1">
          <label
            htmlFor="isDefault"
            className="cursor-pointer font-medium text-sm"
          >
            Recurring Transaction
          </label>
          <p className="text-sm text-muted-foreground">
            is it a recurring transaction?
          </p>
        </div>
        <Switch
          className="mt-2"
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
        />
      </div>
      {isRecurring && (
        <div>
          <label htmlFor="recurringInterval" className="text-sm font-medium">
            Recurring Interval
          </label>
          <Select
            onValueChange={(value) => setValue("recurringInterval", value)}
            defaultValue={getValues("recurringInterval") || ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Recurring interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>

          {errors.recurringInterval && (
            <p className="text-red-500 text-sm">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}
      <div className="flex items-center">
        <Button
          variant={"outline"}
          type="button"
          className={"cursor-pointer"}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        {transactionLoading ? (
          <Button className="ml-2 flex items-center">
            <LoaderCircle className="w-6 h-6 animate-spin" />
          </Button>
        ) : (
          <Button type="submit" disabled={transactionLoading} className="ml-2">
            Add Transaction
          </Button>
        )}
      </div>
    </form>
  );
}

export default AddTransactionForm;
