<template>
  <div v-if="store.isLoading && !transaction" class="text-center py-20">
    <p class="animate-pulse transition-colors text-slate-500 dark:text-slate-400">Loading transaction details...</p>
  </div>

  <div v-else-if="transaction" class="max-w-5xl mx-auto space-y-6">
    <!-- Header Section -->
    <div class="p-6 rounded-lg shadow-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <div>
        <NuxtLink to="/" class="text-sm hover:underline mb-2 inline-block transition-colors text-teal-600 dark:text-teal-400"> &larr; Back to Dashboard </NuxtLink>
        <h2 class="text-2xl font-bold transition-colors text-slate-900 dark:text-slate-100">{{ transaction.propertyTitle }}</h2>
        <p class="text-sm mt-1 transition-colors text-slate-500 dark:text-slate-400">Total Fee: {{ transaction.totalServiceFee.toLocaleString("en-GB", { style: "currency", currency: "GBP" }) }}</p>
      </div>
      <div class="text-right">
        <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full uppercase tracking-wide" :class="getStatusBadgeClass(transaction.status)"> {{ formatStage(transaction.status) }} </span>
      </div>
    </div>

    <!-- State Machine & Cancellation Controls -->
    <div class="p-6 rounded-lg shadow-sm border transition-colors bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-lg font-semibold transition-colors text-slate-900 dark:text-slate-100">Transaction Stage</h3>

        <button v-if="transaction.status !== TransactionStatus.COMPLETED && transaction.status !== TransactionStatus.CANCELLED && !isCancelling" @click="isCancelling = true" class="text-sm px-3 py-1 rounded border transition-colors text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20">Cancel Transaction</button>
      </div>

      <!-- Cancellation Form -->
      <div v-if="isCancelling" class="p-4 rounded-md border mb-4 transition-colors bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30">
        <label class="block text-sm font-medium mb-2 transition-colors text-red-800 dark:text-red-400">Reason for cancellation:</label>
        <div class="flex space-x-2">
          <input v-model="cancelReason" type="text" placeholder="e.g., Client withdrew offer" class="flex-1 rounded-md shadow-sm sm:text-sm p-2 border transition-colors border-red-300 focus:border-red-500 focus:ring-red-500 dark:bg-slate-950 dark:border-red-900/50 dark:text-slate-100 dark:placeholder-slate-500" />
          <button @click="handleCancel" :disabled="!cancelReason || store.isLoading" class="px-4 py-2 rounded-md transition-colors text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600">Confirm</button>
          <button @click="isCancelling = false" class="px-4 py-2 rounded-md border transition-colors bg-white text-slate-600 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700">Abort</button>
        </div>
      </div>

      <!-- State Messages -->
      <div v-if="transaction.status === TransactionStatus.COMPLETED" class="p-4 rounded-md border transition-colors bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/10 dark:text-teal-400 dark:border-teal-900/30">This transaction has been successfully completed. No further stage changes are allowed.</div>

      <div v-else-if="transaction.status === TransactionStatus.CANCELLED" class="p-4 rounded-md border transition-colors bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30">
        <p class="font-semibold">This transaction was cancelled.</p>
        <p class="text-sm mt-1">Reason: {{ transaction.cancellationReason }}</p>
      </div>

      <!-- Next Stage Button -->
      <div v-else-if="!isCancelling" class="flex items-center space-x-4">
        <p class="transition-colors text-slate-600 dark:text-slate-400">Next allowed stage:</p>
        <button v-if="nextAllowedStage" @click="handleStageChange(nextAllowedStage)" :disabled="store.isLoading" class="px-6 py-2 rounded-md transition-colors text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-600">
          {{ store.isLoading ? "Processing..." : `Move to ${formatStage(nextAllowedStage)}` }}
        </button>
      </div>
    </div>

    <!-- Traceability Timeline Section -->
    <div class="p-6 rounded-lg shadow-sm border transition-colors bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <h3 class="text-lg font-semibold mb-4 transition-colors text-slate-900 dark:text-slate-100">Stage History</h3>
      <div class="flow-root">
        <ul role="list" class="-mb-8">
          <li v-for="(history, index) in transaction.stageHistory" :key="index">
            <div class="relative pb-8">
              <span v-if="index !== transaction.stageHistory.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 transition-colors bg-slate-200 dark:bg-slate-700" aria-hidden="true"></span>
              <div class="relative flex space-x-3">
                <div>
                  <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 transition-colors ring-white dark:ring-slate-900" :class="history.stage === TransactionStatus.CANCELLED ? 'bg-red-500' : 'bg-teal-500'">
                    <svg v-if="history.stage === TransactionStatus.COMPLETED" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    <svg v-else-if="history.stage === TransactionStatus.CANCELLED" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    <span v-else class="h-2.5 w-2.5 bg-white rounded-full"></span>
                  </span>
                </div>
                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p class="text-sm transition-colors text-slate-500 dark:text-slate-400">
                      Transitioned to <span class="font-medium transition-colors text-slate-900 dark:text-slate-100">{{ formatStage(history.stage) }}</span>
                    </p>
                  </div>
                  <div class="text-right text-sm whitespace-nowrap transition-colors text-slate-500 dark:text-slate-500">
                    <time :datetime="history.enteredAt">{{ new Date(history.enteredAt).toLocaleString() }}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Financial Breakdown -->
    <div v-if="transaction.status === TransactionStatus.COMPLETED && transaction.financialBreakdown" class="p-6 rounded-lg shadow-sm border transition-colors bg-white border-teal-200 dark:bg-slate-900 dark:border-teal-900/50">
      <h3 class="text-lg font-semibold mb-4 flex items-center transition-colors text-slate-900 dark:text-slate-100"><span class="mr-2">💰</span> Financial Breakdown</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-4 rounded-md border transition-colors bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
          <p class="text-sm uppercase tracking-wider transition-colors text-slate-500 dark:text-slate-400">Agency Earning</p>
          <p class="text-3xl font-bold mt-1 transition-colors text-slate-900 dark:text-slate-100">{{ transaction.financialBreakdown.agencyEarning.toLocaleString("en-GB", { style: "currency", currency: "GBP" }) }}</p>
        </div>
        <div class="p-4 rounded-md border space-y-4 transition-colors bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
          <p class="text-sm uppercase tracking-wider transition-colors text-slate-500 dark:text-slate-400">Agent Earnings</p>
          <div v-for="(agent, index) in transaction.financialBreakdown.agents" :key="index" class="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0 transition-colors border-slate-200 dark:border-slate-700">
            <div>
              <p class="font-medium transition-colors text-slate-900 dark:text-slate-100">
                {{ agent.agentId === transaction.listingAgentId._id ? `${transaction.listingAgentId.firstName} ${transaction.listingAgentId.lastName}` : `${transaction.sellingAgentId.firstName} ${transaction.sellingAgentId.lastName}` }}
              </p>
              <p class="text-xs capitalize transition-colors text-slate-500 dark:text-slate-400">{{ agent.role }} Agent</p>
            </div>
            <p class="text-xl font-bold transition-colors text-teal-600 dark:text-teal-400">{{ agent.earning.toLocaleString("en-GB", { style: "currency", currency: "GBP" }) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useTransactionStore } from "../../../stores/useTransactionStore";
import { TransactionStatus } from "../../../types";
import { useTransactionUtils } from "../../../utils/useTransactionUtils";
import { toast } from "vue3-toastify";

const route = useRoute();
const store = useTransactionStore();
const { getStatusBadgeClass, formatStage } = useTransactionUtils();

const isCancelling = ref(false);
const cancelReason = ref("");

onMounted(() => {
  const id = route.params.id as string;
  store.loadTransactionById(id);
});

const transaction = computed(() => store.selectedTransaction);

const nextAllowedStage = computed(() => {
  if (!transaction.value) return null;
  switch (transaction.value.status) {
    case TransactionStatus.AGREEMENT:
      return TransactionStatus.EARNEST_MONEY;
    case TransactionStatus.EARNEST_MONEY:
      return TransactionStatus.TITLE_DEED;
    case TransactionStatus.TITLE_DEED:
      return TransactionStatus.COMPLETED;
    default:
      return null;
  }
});

const handleStageChange = async (newStage: TransactionStatus) => {
  const id = route.params.id as string;
  try {
    await store.changeStage(id, newStage);
    toast.success(`Successfully moved to ${formatStage(newStage)}!`);
  } catch (error) {
    toast.error("Failed to change stage.");
  }
};

// Handle Cancellation action
const handleCancel = async () => {
  const id = route.params.id as string;
  try {
    await store.cancelTx(id, cancelReason.value);
    isCancelling.value = false;
    cancelReason.value = "";
    toast.info("Transaction cancelled.");
  } catch (error) {
    toast.error("Failed to cancel transaction.");
  }
};
</script>
