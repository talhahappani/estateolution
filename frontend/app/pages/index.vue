<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Transactions Dashboard</h2>
      <button @click="store.loadTransactions()" class="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-100 transition">Refresh Data</button>
    </div>

    <div v-if="store.isLoading" class="text-center py-10">
      <p class="text-gray-500 animate-pulse">Loading transactions...</p>
    </div>

    <div v-else-if="store.error" class="bg-red-50 text-red-600 p-4 rounded-md">
      {{ store.error }}
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="store.transactions.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-500">No transactions found. Please create one from the backend API.</td>
          </tr>

          <tr v-for="transaction in store.transactions" :key="transaction._id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="font-medium text-gray-900">{{ transaction.propertyTitle }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize" :class="transaction.transactionType === 'sale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                {{ transaction.transactionType }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${{ transaction.totalServiceFee.toLocaleString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                {{ formatStage(transaction.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <NuxtLink :to="`/transactions/${transaction._id}`" class="text-indigo-600 hover:text-indigo-900"> Manage &rarr; </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useTransactionStore } from "../../stores/useTransactionStore";
import type { TransactionStatus } from "../../types";

const store = useTransactionStore();

// Fetch data when the component is mounted
onMounted(() => {
  store.loadTransactions();
});

// Helper to format enum to readable text (e.g., 'earnest_money' -> 'Earnest Money')
const formatStage = (stage: TransactionStatus) => {
  return stage
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
</script>
