"use client";

import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from "@/app/lib/schema";
import { Input } from "./ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "./ui/button";
import useFetch from "./../hooks/useFetch";
import { createAccount } from "@/actions/dashboard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "SAVINGS",
      balance: 0,
      isDefault: false,
    },
  });

  const {
    data: newAccount,
    loading: createAccountLoading,
    error,
    fn: createAccountFn,
  } = useFetch(createAccount);

  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data);
    await createAccountFn(data);
  };


  useEffect(() => {
    if(newAccount && !createAccountLoading) {
      toast.success("Account created successfully!");
      reset();
      setOpen(false);
    }
  },[createAccountLoading, newAccount]);

  useEffect(() => {
    if (error) {
    toast.error("Error creating account: " + error.message);
    console.error("Error creating account:", error);
  }
  },[error]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create a new account</DrawerTitle>
        </DrawerHeader>
        <div className="px-6 py-2">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label htmlFor="name">Account Name</label>
              <Input
                id="name"
                placeholder="Enter account name"
                className="mb-4"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="type">Account Type</label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValues={watch("type")}
              >
                <SelectTrigger id="type" className="mb-4">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAVINGS">SAVINGS</SelectItem>
                  <SelectItem value="CURRENT">CURRENT</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-red-500 text-sm">{errors.type.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="balance">Initial Balance</label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="mb-4"
                {...register("balance", { valueAsNumber: true })}
              />
              {errors.balance && (
                <p className="text-red-500 text-sm">{errors.balance.message}</p>
              )}
            </div>
            <div className="flex items-center space-x-2 justify-between rounded-lg border p-3">
              <div className="space-y-1">
                <label
                  htmlFor="isDefault"
                  className="cursor-pointer font-medium text-sm"
                >
                  Set as Default
                </label>
                <p className="text-sm text-muted-foreground">
                  This account will be selected by default for transactions
                </p>
              </div>
              <Switch
                id="isDefault"
                className="mt-2"
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                checked={watch("isDefault")}
              />
            </div>
            <div className="space-x-2 mt-4 flex">
              <DrawerClose asChild>
                <Button
                  variant={"outline"}
                  type="button"
                  className={"flex-1 cursor-pointer"}
                >
                  Cancel
                </Button>
              </DrawerClose>
              <Button type="submit" className="flex-1 cursor-pointer" disabled={createAccountLoading}>
                {createAccountLoading ? <p className="flex"><Loader2 className="animate-spin mr-2 h-4 w-4"/>Creating...</p> : "Create Account"}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default CreateAccountDrawer;
