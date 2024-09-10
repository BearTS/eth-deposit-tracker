"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";

interface Transaction {
  _id: string;
  blockNumber: number;
  blockTimestamp: number;
  fee: string;
  hash: string;
  pubkey: string;
  created_at: string;
}

export function TransactionViewer() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  const fetchTransactions = async (
    pageNum: number,
    isRefresh: boolean = false,
  ) => {
    setIsLoading(true);
    try {
      const apiURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "/api";
      const response = await fetch(
        `${apiURL}/deposits?page=${pageNum}&limit=${itemsPerPage}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const data: Transaction[] = await response.json();
      if (isRefresh) {
        setTransactions(data); // Overwrite data on refresh
      } else {
        setTransactions((prev) => [...data, ...prev]); // Prepend new data
      }
      setHasMore(data.length === itemsPerPage);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1, true); // Fetch initial data
    const intervalId = setInterval(() => {
      fetchTransactions(1); // Fetch new data periodically
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    fetchTransactions(page + 1);
  };

  const handleRefresh = () => {
    setPage(1);
    fetchTransactions(1, true);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          size="icon"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-300">Block Number</TableHead>
              <TableHead className="text-gray-300">Timestamp</TableHead>
              <TableHead className="text-gray-300">Fee</TableHead>
              <TableHead className="text-gray-300">Hash</TableHead>
              <TableHead className="text-gray-300">Public Key</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id} className="hover:bg-gray-700">
                <TableCell>{transaction.blockNumber}</TableCell>
                <TableCell>
                  {new Date(transaction.blockTimestamp * 1000).toLocaleString()}
                </TableCell>
                <TableCell>{transaction.fee}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {transaction.hash}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {transaction.pubkey}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {hasMore && (
        <div className="mt-4 text-center">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
