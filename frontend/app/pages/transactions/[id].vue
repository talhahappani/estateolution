<template>
  <div v-if="store.isLoading && !transaction" class="text-center py-20">
    <p class="text-gray-500 animate-pulse">Loading transaction details...</p>
  </div>

  <div v-else-if="transaction" class="max-w-5xl mx-auto space-y-6">
    <!-- Header Section -->
    <div class="flex items-center justify-between bg-white p-6 rounded-lg shadow border border-gray-200">
      <div>
        <NuxtLink to="/" class="text-sm text-indigo-600 hover:underline mb-2 inline-block">&larr; Back to Dashboard</NuxtLink>
        <h2 class="text-2xl font-bold text-gray-900">{{ transaction.propertyTitle }}</h2>
        <p class="text-gray-500 text-sm mt-1">Total Fee: ${{ transaction.totalServiceFee.toLocaleString() }}</p>
      </div>
      <div class="text-right">
        <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full uppercase tracking-wide" :class="getStatusBadgeClass(transaction.status)">
          {{ formatStage(transaction.status) }}
        </span>
      </div>
    </div>

    <!-- State Machine & Cancellation Controls -->
    <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Transaction Stage</h3>

        <!-- Cancel Button (Only show if not completed and not cancelled) -->
        <button v-if="transaction.status !== TransactionStatus.COMPLETED && transaction.status !== TransactionStatus.CANCELLED && !isCancelling" @click="isCancelling = true" class="text-sm text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1 rounded transition">Cancel Transaction</button>
      </div>

      <!-- Cancellation Form -->
      <div v-if="isCancelling" class="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
        <label class="block text-sm font-medium text-red-800 mb-2">Reason for cancellation:</label>
        <div class="flex space-x-2">
          <input v-model="cancelReason" type="text" placeholder="e.g., Client withdrew offer" class="flex-1 rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border" />
          <button @click="handleCancel" :disabled="!cancelReason || store.isLoading" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50">Confirm</button>
          <button @click="isCancelling = false" class="bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50">Abort</button>
        </div>
      </div>

      <!-- State Messages -->
      <div v-if="transaction.status === TransactionStatus.COMPLETED" class="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">This transaction has been successfully completed. No further stage changes are allowed.</div>

      <div v-else-if="transaction.status === TransactionStatus.CANCELLED" class="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
        <p class="font-semibold">This transaction was cancelled.</p>
        <p class="text-sm mt-1">Reason: {{ transaction.cancellationReason }}</p>
      </div>

      <!-- Next Stage Button -->
      <div v-else-if="!isCancelling" class="flex items-center space-x-4">
        <p class="text-gray-600">Next allowed stage:</p>
        <button v-if="nextAllowedStage" @click="handleStageChange(nextAllowedStage)" :disabled="store.isLoading" class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50">
          {{ store.isLoading ? "Processing..." : `Move to ${formatStage(nextAllowedStage)}` }}
        </button>
      </div>
    </div>

    <!-- Traceability Timeline Section -->
    <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Stage History</h3>
      <div class="flow-root">
        <ul role="list" class="-mb-8">
          <li v-for="(history, index) in transaction.stageHistory" :key="index">
            <div class="relative pb-8">
              <!-- Connector Line -->
              <span v-if="index !== transaction.stageHistory.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              <div class="relative flex space-x-3">
                <div>
                  <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white" :class="history.stage === TransactionStatus.CANCELLED ? 'bg-red-500' : 'bg-indigo-500'">
                    <!-- Icon based on status -->
                    <svg v-if="history.stage === TransactionStatus.COMPLETED" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    <svg v-else-if="history.stage === TransactionStatus.CANCELLED" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    <span v-else class="h-2.5 w-2.5 bg-white rounded-full"></span>
                  </span>
                </div>
                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p class="text-sm text-gray-500">
                      Transitioned to <span class="font-medium text-gray-900">{{ formatStage(history.stage) }}</span>
                    </p>
                  </div>
                  <div class="text-right text-sm whitespace-nowrap text-gray-500">
                    <time :datetime="history.enteredAt">{{ new Date(history.enteredAt).toLocaleString() }}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Financial Breakdown (Only visible if COMPLETED) -->
    <div v-if="transaction.status === TransactionStatus.COMPLETED && transaction.financialBreakdown" class="bg-white p-6 rounded-lg shadow border border-green-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center"><span class="text-green-600 mr-2">💰</span> Financial Breakdown</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
          <p class="text-sm text-gray-500 uppercase tracking-wider">Agency Earning</p>
          <p class="text-3xl font-bold text-gray-900 mt-1">${{ transaction.financialBreakdown.agencyEarning.toLocaleString() }}</p>
        </div>
        <div class="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-4">
          <p class="text-sm text-gray-500 uppercase tracking-wider">Agent Earnings</p>
          <div v-for="(agent, index) in transaction.financialBreakdown.agents" :key="index" class="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0 last:pb-0">
            <div>
              <p class="font-medium text-gray-900 capitalize">{{ agent.role }} Agent</p>
            </div>
            <p class="text-xl font-bold text-indigo-600">${{ agent.earning.toLocaleString() }}</p>
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
