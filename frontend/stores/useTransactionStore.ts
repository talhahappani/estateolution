import { defineStore } from "pinia";
import { ref } from "vue";
import type { Transaction, TransactionStatus } from "../types";
import { useTransactionApi } from "../composables/useTransactionApi";

export const useTransactionStore = defineStore("transaction", () => {
  const api = useTransactionApi();

  // State
  const transactions = ref<Transaction[]>([]);
  const selectedTransaction = ref<Transaction | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Actions
  const loadTransactions = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      transactions.value = await api.fetchTransactions();
    } catch (err: any) {
      error.value = err.data?.message || "Failed to fetch transactions.";
    } finally {
      isLoading.value = false;
    }
  };

  const loadTransactionById = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      selectedTransaction.value = await api.fetchTransactionById(id);
    } catch (err: any) {
      error.value = err.data?.message || "Failed to fetch transaction details.";
    } finally {
      isLoading.value = false;
    }
  };

  const changeStage = async (id: string, newStage: TransactionStatus) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedData = await api.updateTransactionStage(id, newStage);
      selectedTransaction.value = updatedData;

      const index = transactions.value.findIndex((t) => t._id === id);
      if (index !== -1) {
        transactions.value[index] = updatedData;
      }
    } catch (err: any) {
      error.value = err.data?.message || "Failed to update transaction stage.";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    transactions,
    selectedTransaction,
    isLoading,
    error,
    loadTransactions,
    loadTransactionById,
    changeStage,
  };
});
