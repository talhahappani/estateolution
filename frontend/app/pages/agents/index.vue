<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <!-- Add Agent Form -->
    <div class="p-6 rounded-lg shadow-sm border h-fit transition-colors bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <h3 class="text-lg font-semibold mb-4 transition-colors text-slate-900 dark:text-slate-100">Add New Agent</h3>
      <form @submit.prevent="submitAgent" class="space-y-4">
        <div>
          <label class="block text-sm font-medium transition-colors text-slate-700 dark:text-slate-300">First Name</label>
          <input v-model="form.firstName" required type="text" class="mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 border transition-colors bg-white border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500" />
        </div>
        <div>
          <label class="block text-sm font-medium transition-colors text-slate-700 dark:text-slate-300">Last Name</label>
          <input v-model="form.lastName" required type="text" class="mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 border transition-colors bg-white border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500" />
        </div>
        <div>
          <label class="block text-sm font-medium transition-colors text-slate-700 dark:text-slate-300">Email</label>
          <input v-model="form.email" required type="email" class="mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 border transition-colors bg-white border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500" />
        </div>
        <button type="submit" :disabled="store.isLoading" class="w-full py-2 px-4 rounded-md transition-colors text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-600">
          {{ store.isLoading ? "Adding..." : "Save Agent" }}
        </button>
      </form>
    </div>

    <!-- Agents List -->
    <div class="md:col-span-2 p-6 rounded-lg shadow-sm border transition-colors bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <h3 class="text-lg font-semibold mb-4 transition-colors text-slate-900 dark:text-slate-100">Registered Agents</h3>
      <ul class="divide-y transition-colors divide-slate-200 dark:divide-slate-800">
        <li v-for="agent in store.agents" :key="agent._id" class="py-4 flex justify-between items-center group">
          <div>
            <p class="text-sm font-medium transition-colors text-slate-900 dark:text-slate-100">{{ agent.firstName }} {{ agent.lastName }}</p>
            <p class="text-sm transition-colors text-slate-500 dark:text-slate-400">{{ agent.email }}</p>
          </div>

          <div class="flex-shrink-0">
            <template v-if="agentToDelete !== agent._id">
              <button @click="agentToDelete = agent._id" class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/30 dark:hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900" aria-label="Delete agent">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
                Delete
              </button>
            </template>

            <template v-else>
              <div class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 shadow-sm transition-colors border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
                <span class="text-xs font-semibold whitespace-nowrap text-red-700 dark:text-red-400"> Delete this agent? </span>

                <button @click="confirmDelete(agent._id)" class="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900">Yes</button>

                <button @click="agentToDelete = null" class="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900">No</button>
              </div>
            </template>
          </div>
        </li>
        <li v-if="store.agents.length === 0" class="py-4 text-sm transition-colors text-slate-500 dark:text-slate-400">No agents found.</li>
      </ul>
    </div>

    <!-- Mobile cards -->
    <div class="md:hidden space-y-3">
      <div v-for="(perf, index) in txStore.agentPerformance" :key="index" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="font-medium text-slate-900 dark:text-slate-100">
          {{ perf.agentName }}
        </div>

        <div class="mt-3 flex items-center justify-between text-sm">
          <span class="text-slate-500 dark:text-slate-400">Completed Deals</span>
          <span class="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-teal-900/30 dark:text-teal-400">
            {{ perf.completedDeals }}
          </span>
        </div>

        <div class="mt-2 flex items-center justify-between text-sm">
          <span class="text-slate-500 dark:text-slate-400">Total Earnings</span>
          <span class="font-bold text-teal-600 dark:text-teal-400">
            {{ perf.totalEarnings.toLocaleString("en-GB", { style: "currency", currency: "GBP" }) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Desktop table -->
    <div class="hidden md:block overflow-x-auto md:col-span-3 mt-8 p-6 rounded-lg shadow-sm border transition-colors bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <h3 class="text-lg font-semibold mb-4 flex items-center transition-colors text-slate-900 dark:text-slate-100">Top Performing Agents</h3>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y transition-colors divide-slate-200 dark:divide-slate-800">
          <thead class="transition-colors bg-slate-50 dark:bg-slate-950/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors text-slate-500 dark:text-slate-400">Agent Name</th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider transition-colors text-slate-500 dark:text-slate-400">Completed Deals</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors text-slate-500 dark:text-slate-400">Total Earnings</th>
            </tr>
          </thead>
          <tbody class="divide-y transition-colors divide-slate-200 dark:divide-slate-800">
            <tr v-if="txStore.agentPerformance.length === 0">
              <td colspan="3" class="px-6 py-8 text-center transition-colors text-slate-500 dark:text-slate-400">No completed deals yet.</td>
            </tr>
            <tr v-for="(perf, index) in txStore.agentPerformance" :key="index" class="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-6 py-4 whitespace-nowrap font-medium transition-colors text-slate-900 dark:text-slate-100">
                {{ perf.agentName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center transition-colors text-slate-600 dark:text-slate-300">
                <span class="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 py-1 px-3 rounded-full text-xs font-bold">
                  {{ perf.completedDeals }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right font-bold transition-colors text-teal-600 dark:text-teal-400">{{ perf.totalEarnings.toLocaleString("en-GB", { style: "currency", currency: "GBP" }) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAgentStore } from "../../../stores/useAgentStore";
import { toast } from "vue3-toastify";
import { useTransactionStore } from "../../../stores/useTransactionStore";

const store = useAgentStore();
const txStore = useTransactionStore();
const form = ref({ firstName: "", lastName: "", email: "" });
const agentToDelete = ref<string | null>(null);

onMounted(() => {
  store.loadAgents();
  txStore.loadAgentPerformance();
});

const submitAgent = async () => {
  try {
    await store.addAgent({ ...form.value });
    form.value = { firstName: "", lastName: "", email: "" };
    toast.success("Agent added successfully!");
  } catch {
    toast.error("Failed to add agent.");
  }
};

const confirmDelete = async (id: string) => {
  try {
    await store.removeAgent(id);
    agentToDelete.value = null;
    toast.success("Agent permanently deleted.");
  } catch {
    toast.error("Failed to delete agent. It might be tied to a transaction.");
    agentToDelete.value = null;
  }
};
</script>
