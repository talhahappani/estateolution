<template>
  <div>
    <!-- Header & Actions -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Transactions Dashboard</h2>
      <div class="space-x-4">
        <button @click="isCreating = !isCreating" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
          {{ isCreating ? "Cancel Creation" : "+ New Transaction" }}
        </button>
        <button @click="store.loadTransactions()" class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition">Refresh</button>
      </div>
    </div>

    <!-- Stats Cards Section -->
    <div v-if="store.stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Transactions -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100 flex items-center">
        <div class="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Total Transactions</p>
          <p class="text-2xl font-bold text-gray-900">{{ store.stats.totalTransactions }}</p>
        </div>
      </div>

      <!-- Completed -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100 flex items-center">
        <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Completed</p>
          <p class="text-2xl font-bold text-gray-900">{{ store.stats.completedTransactions }}</p>
        </div>
      </div>

      <!-- Cancelled -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100 flex items-center">
        <div class="p-3 rounded-full bg-red-100 text-red-600 mr-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Cancelled</p>
          <p class="text-2xl font-bold text-gray-900">{{ store.stats.cancelledTransactions }}</p>
        </div>
      </div>

      <!-- Total Earnings -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100 flex items-center">
        <div class="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Agency Earnings</p>
          <p class="text-2xl font-bold text-gray-900">${{ store.stats.totalAgencyEarnings.toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <!-- Create Transaction Form (Toggles visibility) -->
    <div v-if="isCreating" class="bg-white p-6 rounded-lg shadow border border-indigo-100 mb-8">
      <h3 class="text-lg font-semibold mb-4 text-indigo-900">Create New Transaction</h3>
      <form @submit.prevent="submitTransaction" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="col-span-1 md:col-span-2 lg:col-span-3">
          <label class="block text-sm font-medium text-gray-700">Property Title</label>
          <input v-model="form.propertyTitle" required type="text" placeholder="e.g., Luxury Villa in Miami" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Transaction Type</label>
          <select v-model="form.transactionType" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white">
            <option value="sale">Sale</option>
            <option value="rental">Rental</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Total Service Fee ($)</label>
          <input v-model.number="form.totalServiceFee" required type="number" min="0" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Listing Agent</label>
          <select v-model="form.listingAgentId" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white">
            <option value="" disabled>Select an agent</option>
            <option v-for="agent in agentStore.agents" :key="agent._id" :value="agent._id">{{ agent.firstName }} {{ agent.lastName }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Selling Agent</label>
          <select v-model="form.sellingAgentId" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white">
            <option value="" disabled>Select an agent</option>
            <option v-for="agent in agentStore.agents" :key="agent._id" :value="agent._id">{{ agent.firstName }} {{ agent.lastName }}</option>
          </select>
        </div>

        <div class="flex items-end lg:col-span-2">
          <button type="submit" :disabled="store.isLoading" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50">
            {{ store.isLoading ? "Saving..." : "Save Transaction" }}
          </button>
        </div>
      </form>
    </div>

    <!-- Feedback States -->
    <div v-if="store.isLoading && !isCreating" class="text-center py-10">
      <p class="text-gray-500 animate-pulse">Loading transactions...</p>
    </div>
    <div v-else-if="store.error" class="bg-red-50 text-red-600 p-4 rounded-md mb-6">
      {{ store.error }}
    </div>

    <!-- Data Table -->
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
            <td colspan="5" class="px-6 py-8 text-center text-gray-500">No transactions found. Create your first one above!</td>
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
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getStatusBadgeClass(transaction.status)">
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
import { ref, onMounted } from "vue";
import { useTransactionStore } from "../../stores/useTransactionStore";
import { useAgentStore } from "../../stores/useAgentStore";
import { useTransactionUtils } from "../../utils/useTransactionUtils";
import { toast } from "vue3-toastify";

const store = useTransactionStore();
const agentStore = useAgentStore();
const { getStatusBadgeClass, formatStage } = useTransactionUtils();

const isCreating = ref(false);
const form = ref({
  propertyTitle: "",
  transactionType: "sale",
  totalServiceFee: 0,
  listingAgentId: "",
  sellingAgentId: "",
});

// Fetch both transactions and agents on mount
onMounted(() => {
  store.loadTransactions();
  agentStore.loadAgents();
});

const submitTransaction = async () => {
  try {
    await store.createNewTransaction({ ...form.value });
    isCreating.value = false; // Hide form on success
    // Reset form
    form.value = { propertyTitle: "", transactionType: "sale", totalServiceFee: 0, listingAgentId: "", sellingAgentId: "" };
    toast.success("Transaction created successfully!");
  } catch (error) {
    toast.error("Failed to create transaction.");
  }
};
</script>
