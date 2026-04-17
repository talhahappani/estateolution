import type { Transaction, TransactionStatus } from "../types"; // Using relative path

export const useTransactionApi = () => {
  // @ts-ignore
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  // Fetch all transactions
  const fetchTransactions = async (): Promise<Transaction[]> => {
    return await $fetch<Transaction[]>("/transactions", { baseURL });
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

  return {
    fetchTransactions,
    fetchTransactionById,
    updateTransactionStage,
    cancelTransaction,
  };
};
