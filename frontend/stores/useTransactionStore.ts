import { defineStore } from "pinia";
import { ref } from "vue";
import type { Transaction, TransactionStatus, TransactionStats } from "../types";
import { useTransactionApi } from "../composables/useTransactionApi";

export const useTransactionStore = defineStore("transaction", () => {
  const api = useTransactionApi();

  // State
  const transactions = ref<Transaction[]>([]);
  const paginationMeta = ref({ page: 1, totalPages: 1, total: 0 });
  const selectedTransaction = ref<Transaction | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const stats = ref<TransactionStats | null>(null);
  const agentPerformance = ref<any[]>([]);

  // Actions
  const loadStats = async () => {
    try {
      stats.value = await api.fetchStats();
    } catch (err: any) {
      console.error("Failed to load stats", err);
    }
  };

  const loadAgentPerformance = async () => {
    try {
      agentPerformance.value = await api.fetchAgentPerformance();
    } catch (err) {
      console.error(err);
    }
  };

  const loadTransactions = async (page: number = 1) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.fetchTransactions(page, 10);
      transactions.value = response.data;
      paginationMeta.value = {
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
      };
      await loadStats();
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

  const createNewTransaction = async (data: any) => {
    const newTx = await api.createTransaction(data);
    transactions.value.unshift(newTx); // Add to the top of the list
  };

  const cancelTx = async (id: string, reason: string) => {
    const updatedData = await api.cancelTransaction(id, reason);
    selectedTransaction.value = updatedData;
    const index = transactions.value.findIndex((t) => t._id === id);
    if (index !== -1) transactions.value[index] = updatedData;
  };

  return {
    transactions,
    paginationMeta,
    selectedTransaction,
    stats,
    agentPerformance,
    isLoading,
    error,
    loadTransactions,
    loadTransactionById,
    loadAgentPerformance,
    changeStage,
    createNewTransaction,
    cancelTx,
  };
});
