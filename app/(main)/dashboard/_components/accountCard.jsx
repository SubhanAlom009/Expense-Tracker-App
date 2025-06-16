"use client";

import React, { useEffect } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from 'next/link';
import useFetch from "@/hooks/useFetch";
import { updateDefaultAccount } from "@/actions/accounts";
import { toast } from "sonner";

function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;

  const {
    data: updateAccount,
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    error,

  } = useFetch(updateDefaultAccount)

  const handleDefaultChange = async (e) => {
    e.preventDefault();

    if(isDefault){
      toast.warning("You need at least one default account.");
      return; 
    }

    try {
      await updateDefaultFn(id);
    } catch (err) {
      console.error("Error updating default account:", err);
    }
  }

  useEffect(() => {
    if(updateAccount?.success && !updateDefaultLoading) {
      toast.success("Default account updated successfully.");
    } 
  },[updateAccount, updateDefaultLoading]);

   useEffect(() => {
    if(error) {
      toast.error(`Error updating default account: ${error.message}`);
    } 
  },[error]);

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow group relative">
      <Link href={`/account/${id}`}>
        <CardHeader className={`flex items-center justify-between mb-2`}>
          <CardTitle>{name}</CardTitle>
          <Switch 
          checked={isDefault}
          onClick={handleDefaultChange}
          disabled={updateDefaultLoading}
          />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">
            ${parseFloat(balance).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{type} Account</p>
        </CardContent>
        <CardFooter className={`flex items-center justify-between text-sm text-muted-foreground`}>
          <div>
            <ArrowUpRight className="w-4 h-4 mr-1 inline text-green-500" />
            Income
          </div>
          <div>
            <ArrowDownRight className="w-4 h-4 text-red-500 mr-1 inline" />
            Expenses
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}

export default AccountCard;
