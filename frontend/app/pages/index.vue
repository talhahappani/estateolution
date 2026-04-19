<template>
  <div>
    <!-- Header & Actions -->
    <div class="flex justify-between md:items-center mb-6 md:flex-row flex-col gap-4">
      <h2 class="text-xl font-semibold transition-colors text-slate-900 dark:text-slate-100">Transactions Dashboard</h2>
      <div class="space-x-4">
        <button @click="isCreating = !isCreating" class="transition-colors px-4 py-2 rounded-md text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600">
          {{ isCreating ? "Cancel Creation" : "+ New Transaction" }}
        </button>
        <button @click="store.loadTransactions()" class="transition-colors border px-4 py-2 rounded-md bg-white border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Refresh</button>
      </div>
    </div>

    <!-- Create Transaction Form -->
    <div v-if="isCreating" class="mb-8 p-6 rounded-lg shadow-sm border transition-colors bg-white border-teal-100 dark:bg-slate-900 dark:border-teal-900/30">
      <h3 class="text-lg font-semibold mb-4 transition-colors text-teal-800 dark:text-teal-400">Create New Transaction</h3>
      <form @submit.prevent="submitTransaction" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="col-span-1 md:col-span-2 lg:col-span-3">
          <label class="block text-sm font-medium transition-colors text-slate-700 dark:text-slate-300">Property Title</label>
          <input v-model="form.propertyTitle" required type="text" placeholder="e.g., Luxury Villa in Miami" class="mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 transition-colors bg-white border border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500" />
        </div>

        <div>
          <label class="block text-sm font-medium transition-colors text-slate-700 dark:text-slate-300">Transaction Type</label>
          <select v-model="form.transactionType" required class="mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 transition-colors bg-white border border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100">
            <option value="sale">Sale</option>
            <option value="rental">Rental</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium transition-colors text-slate-700 dark:text-slate-300">Total Service Fee (£)</label>
          <input v-model.number="form.totalServiceFee" required type="number" min="0" class="mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 transition-colors bg-white border border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100" />
        </div>

        <div>
          <label class="block text-sm font-medium transition-colors text-slate-700 dark:text-slate-300">Listing Agent</label>
          <select v-model="form.listingAgentId" required class="mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 transition-colors bg-white border border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100">
            <option value="" disabled>Select an agent</option>
            <option v-for="agent in agentStore.agents" :key="agent._id" :value="agent._id">{{ agent.firstName }} {{ agent.lastName }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium transition-colors text-slate-700 dark:text-slate-300">Selling Agent</label>
          <select v-model="form.sellingAgentId" required class="mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 transition-colors bg-white border border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100">
            <option value="" disabled>Select an agent</option>
            <option v-for="agent in agentStore.agents" :key="agent._id" :value="agent._id">{{ agent.firstName }} {{ agent.lastName }}</option>
          </select>
        </div>

        <div class="flex items-end lg:col-span-2">
          <button type="submit" :disabled="store.isLoading" class="w-full py-2 px-4 rounded-md transition-colors text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-600">
            {{ store.isLoading ? "Saving..." : "Save Transaction" }}
          </button>
        </div>
      </form>
    </div>

    <!-- Stats Cards Section -->
    <div v-if="store.stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total -->
      <div class="rounded-lg shadow-sm p-6 border flex items-center transition-colors bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div class="p-3 rounded-full mr-4 transition-colors bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </div>
        <div>
          <p class="text-sm font-medium transition-colors text-slate-500 dark:text-slate-400">Total Transactions</p>
          <p class="text-2xl font-bold transition-colors text-slate-900 dark:text-slate-100">{{ store.stats.totalTransactions }}</p>
        </div>
      </div>
      <!-- Completed -->
      <div class="rounded-lg shadow-sm p-6 border flex items-center transition-colors bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div class="p-3 rounded-full mr-4 transition-colors bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <div>
          <p class="text-sm font-medium transition-colors text-slate-500 dark:text-slate-400">Completed</p>
          <p class="text-2xl font-bold transition-colors text-slate-900 dark:text-slate-100">{{ store.stats.completedTransactions }}</p>
        </div>
      </div>
      <!-- Cancelled -->
      <div class="rounded-lg shadow-sm p-6 border flex items-center transition-colors bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div class="p-3 rounded-full mr-4 transition-colors bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <div>
          <p class="text-sm font-medium transition-colors text-slate-500 dark:text-slate-400">Cancelled</p>
          <p class="text-2xl font-bold transition-colors text-slate-900 dark:text-slate-100">{{ store.stats.cancelledTransactions }}</p>
        </div>
      </div>
      <!-- Earnings -->
      <div class="rounded-lg shadow-sm p-6 border flex items-center transition-colors bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div class="p-3 rounded-full mr-4 transition-colors bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <p class="text-sm font-medium transition-colors text-slate-500 dark:text-slate-400">Agency Earnings</p>
          <p class="text-2xl font-bold transition-colors text-slate-900 dark:text-slate-100">{{ store.stats.totalAgencyEarnings.toLocaleString("en-GB", { style: "currency", currency: "GBP" }) }}</p>
        </div>
      </div>
    </div>

    <!-- Mobile cards -->
    <div class="md:hidden space-y-3">
      <div v-for="transaction in store.transactions" :key="transaction._id" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="font-medium text-slate-900 dark:text-slate-100">
              {{ transaction.propertyTitle }}
            </div>
            <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {{ new Date(transaction.updatedAt).toLocaleDateString("en-GB") }}
            </div>
          </div>

          <span class="px-2 py-1 text-xs font-semibold rounded-full capitalize" :class="transaction.transactionType === 'sale' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'">
            {{ transaction.transactionType }}
          </span>
        </div>

        <div class="mt-3 flex items-center justify-between text-sm">
          <span class="text-slate-500 dark:text-slate-400">Fee</span>
          <span class="font-medium text-slate-900 dark:text-slate-100">
            {{ transaction.totalServiceFee.toLocaleString("en-GB", { style: "currency", currency: "GBP" }) }}
          </span>
        </div>

        <div class="mt-3 flex items-center justify-between text-sm">
          <span class="text-slate-500 dark:text-slate-400">Stage</span>
          <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusBadgeClass(transaction.status)">
            {{ formatStage(transaction.status) }}
          </span>
        </div>

        <div class="mt-4 text-right">
          <NuxtLink :to="`/transactions/${transaction._id}`" class="text-teal-600 hover:underline dark:text-teal-400"> Manage → </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Desktop table -->
    <div class="hidden md:block shadow-sm overflow-x-auto sm:rounded-lg border transition-colors bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <table class="min-w-full divide-y transition-colors divide-slate-200 dark:divide-slate-800">
        <thead class="transition-colors bg-slate-50 dark:bg-slate-950/50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors text-slate-500 dark:text-slate-400">Property</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors text-slate-500 dark:text-slate-400">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors text-slate-500 dark:text-slate-400">Last Updated</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors text-slate-500 dark:text-slate-400">Fee</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors text-slate-500 dark:text-slate-400">Stage</th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors text-slate-500 dark:text-slate-400">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y transition-colors divide-slate-200 dark:divide-slate-800">
          <tr v-if="store.transactions.length === 0">
            <td colspan="6" class="px-6 py-8 text-center transition-colors text-slate-500 dark:text-slate-400">No transactions found.</td>
          </tr>
          <tr v-for="transaction in store.transactions" :key="transaction._id" class="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="font-medium transition-colors text-slate-900 dark:text-slate-100">{{ transaction.propertyTitle }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize" :class="transaction.transactionType === 'sale' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'">
                {{ transaction.transactionType }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm transition-colors text-slate-500 dark:text-slate-400">
              {{ new Date(transaction.updatedAt).toLocaleDateString("en-GB") }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm transition-colors text-slate-500 dark:text-slate-400">{{ transaction.totalServiceFee.toLocaleString("en-GB", { style: "currency", currency: "GBP" }) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getStatusBadgeClass(transaction.status)">
                {{ formatStage(transaction.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <NuxtLink :to="`/transactions/${transaction._id}`" class="transition-colors hover:underline text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"> Manage &rarr; </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Pagination Controls -->
    <div v-if="store.paginationMeta.totalPages > 1" class="px-6 py-4 flex items-center justify-between border-t transition-colors border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      <div class="text-sm transition-colors text-slate-500 dark:text-slate-400">
        Showing page <span class="font-medium text-slate-900 dark:text-slate-100">{{ store.paginationMeta.page }}</span> of
        <span class="font-medium text-slate-900 dark:text-slate-100">{{ store.paginationMeta.totalPages }}</span>
        ({{ store.paginationMeta.total }} total deals)
      </div>
      <div class="flex space-x-2">
        <button @click="store.loadTransactions(store.paginationMeta.page - 1)" :disabled="store.paginationMeta.page === 1" class="px-3 py-1 border rounded transition-colors text-sm font-medium bg-white border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">Previous</button>
        <button @click="store.loadTransactions(store.paginationMeta.page + 1)" :disabled="store.paginationMeta.page === store.paginationMeta.totalPages" class="px-3 py-1 border rounded transition-colors text-sm font-medium bg-white border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">Next</button>
      </div>
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
