"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { categoryColors } from "@/data/categories";
import {
  ChevronDown,
  ChevronUp,
  ChevronUpCircleIcon,
  Clock,
  Hamburger,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Trash,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/useFetch";
import { BulkDeleteTransactions } from "@/actions/accounts";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

function TransactionTable({ transactions }) {
  const recurringDates = {
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
    YEARLY: "yearly",
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Filter by recurring status
    if (recurringFilter) {
      const isRecurring = recurringFilter === "recurring";
      result = result.filter(
        (transaction) => transaction.isRecurring === isRecurring
      );
    }

    // Filter by type
    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    // Sort transactions
    result.sort((a, b) => {
      let compare = 0;
      switch (sortConfig.field) {
        case "date":
          compare = new Date(a.date) - new Date(b.date);
          break;
        case "category":
          compare = a.category.localeCompare(b.category);
          break;
        case "amount":
          compare = a.amount - b.amount;
          break;
        default:
          compare = 0;
      }
      return sortConfig.direction === "asc" ? compare : -compare;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  const {
    data: deleted,
    fn: deleteFn,
    loading: deleteLoading,
  } = useFetch(BulkDeleteTransactions);

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item != id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(
        filteredAndSortedTransactions.map((transaction) => transaction.id)
      );
    }
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    ) {
      return;
    }
    await deleteFn(selectedIds);
    setSelectedIds([]);
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.error("Transaction(s) deleted successfully");
    }
  }, [deleted,deleteLoading]);
  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
  };

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const displayedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedTransactions, currentPage, itemsPerPage]);

  return (
    
    <div>
      {
        deleteLoading && (
          <BarLoader className="mb-4 w-screen mx-auto" color="#4F46E5" width={100} />
        )
      }
      {/* filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={"pl-8"}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={recurringFilter} onValueChange={setRecurringFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <Button
              variant={"destructive"}
              size={"sm"}
              onClick={handleBulkDelete}
              className={"flex items-center gap-2"}
            >
              <Trash />
              Delete Selected ({selectedIds.length})
            </Button>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant={"outline"}
              size={"icon"}
              onClick={handleClearFilters}
              title="Clear Filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Transactions */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              <Checkbox
                onCheckedChange={handleSelectAll}
                checked={
                  filteredAndSortedTransactions.length > 0 &&
                  selectedIds.length === filteredAndSortedTransactions.length
                }
              />
            </TableHead>
            <TableHead
              className={"cursor-pointer"}
              onClick={() => handleSort("date")}
            >
              <div className="flex items-center">
                Date{" "}
                {sortConfig.field === "date" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  ))}
              </div>
            </TableHead>
            <TableHead className="">Description</TableHead>
            <TableHead
              className={"cursor-pointer"}
              onClick={() => handleSort("category")}
            >
              <div className="flex items-center">
                Category{" "}
                {sortConfig.field === "category" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  ))}
              </div>
            </TableHead>
            <TableHead
              className={"cursor-pointer text-right"}
              onClick={() => handleSort("amount")}
            >
              <div className="flex text-right items-center justify-end">
                Amount{" "}
                {sortConfig.field === "amount" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  ))}
              </div>
            </TableHead>
            <TableHead className="">Recurring</TableHead>
            <TableHead className=""></TableHead>
          </TableRow>
        </TableHeader>
        {filteredAndSortedTransactions.length === 0 ? (
          <TableRow className="text-center">
            <TableCell colSpan={7} className="text-muted-foreground">
              No transactions found
            </TableCell>
          </TableRow>
        ) : (
          displayedTransactions.map((transaction, key) => (
            <TableBody key={key}>
              <TableRow>
                <TableCell className="font-medium">
                  <Checkbox
                    onCheckedChange={() => handleSelect(transaction.id)}
                    checked={selectedIds.includes(transaction.id)}
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(transaction.date), "PP")}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className="">
                  <span
                    style={{
                      background:
                        categoryColors[transaction.category] || "#f0f0f0",
                    }}
                    className="px-2 py-1 rounded text-sm text-white"
                  >
                    {transaction.category}
                  </span>
                </TableCell>
                <TableCell
                  className={`
                    ${
                      transaction.type === "EXPENSE"
                        ? "text-red-500"
                        : "text-green-500"
                    }
                    text-right font-medium
                    `}
                >
                  {transaction.type === "EXPENSE" ? "-" : "+"}${" "}
                  {transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell className="">
                  {transaction.isRecurring ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge
                          variant="outline"
                          className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                        >
                          <RefreshCcw className="h-4 w-4" />
                          {transaction.recurringInterval}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div>
                          <div>Next Date:</div>
                          <div>
                            {transaction.nextRecurringDate
                              ? format(
                                  new Date(transaction.nextRecurringDate),
                                  "PP"
                                )
                              : "N/A"}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-4 w-4" />
                      one-time
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={"ghost"}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/transaction/create?edit=${transaction.id}`
                          )
                        }
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className={"text-destructive"}
                        onClick={()=>deleteFn([transaction.id])}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          ))
        )}
      </Table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default TransactionTable;
