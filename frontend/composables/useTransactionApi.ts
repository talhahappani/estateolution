import type { Transaction, TransactionStatus, TransactionStats, PaginatedTransactions } from "../types";

export const useTransactionApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  // Fetch all transactions
  const fetchTransactions = async (page: number = 1, limit: number = 10, search: string = "", status: string = ""): Promise<PaginatedTransactions> => {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
    }).toString();

    return await $fetch<PaginatedTransactions>(`/transactions?${query}`, { baseURL });
  };

  // Fetch a single transaction by ID
  const fetchTransactionById = async (id: string): Promise<Transaction> => {
    return await $fetch<Transaction>(`/transactions/${id}`, { baseURL });
  };

  // Update the stage of a transaction
  const updateTransactionStage = async (id: string, newStage: TransactionStatus): Promise<Transaction> => {
    return await $fetch<Transaction>(`/transactions/${id}/stage`, {
      method: "PATCH",
      baseURL,
      body: { newStage },
    });
  };

  // Cancel a transaction
  const cancelTransaction = async (id: string, reason: string): Promise<Transaction> => {
    return await $fetch<Transaction>(`/transactions/${id}/cancel`, {
      method: "PATCH",
      baseURL,
      body: { reason },
    });
  };

  // Create a new transaction
  const createTransaction = async (data: any): Promise<Transaction> => {
    return await $fetch<Transaction>("/transactions", {
      method: "POST",
      baseURL,
      body: data,
    });
  };

  const fetchStats = async (): Promise<TransactionStats> => {
    return await $fetch<TransactionStats>("/transactions/stats", { baseURL });
  };

  const fetchAgentPerformance = async (): Promise<any[]> => {
    return await $fetch<any[]>("/transactions/agent-performance", { baseURL });
  };

  return {
    fetchTransactions,
    fetchTransactionById,
    updateTransactionStage,
    cancelTransaction,
    createTransaction,
    fetchStats,
    fetchAgentPerformance,
  };
};
