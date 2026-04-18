<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <!-- Add Agent Form -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
      <h3 class="text-lg font-semibold mb-4 text-gray-900">Add New Agent</h3>

      <form @submit.prevent="submitAgent" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">First Name</label>
          <input v-model="form.firstName" required type="text" class="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Last Name</label>
          <input v-model="form.lastName" required type="text" class="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="form.email" required type="email" class="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" />
        </div>

        <button type="submit" :disabled="store.isLoading" class="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
          {{ store.isLoading ? "Adding..." : "Save Agent" }}
        </button>
      </form>
    </div>

    <!-- Agents List -->
    <div class="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Registered Agents</h3>
      </div>

      <ul class="divide-y divide-gray-200">
        <li v-for="agent in store.agents" :key="agent._id" class="py-4 flex items-center justify-between gap-4 group">
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ agent.firstName }} {{ agent.lastName }}</p>
            <p class="text-sm text-gray-500 truncate">{{ agent.email }}</p>
          </div>

          <div class="flex-shrink-0">
            <template v-if="agentToDelete !== agent._id">
              <button @click="agentToDelete = agent._id" class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2" aria-label="Delete agent">
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
              <div class="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 shadow-sm">
                <span class="text-xs font-semibold text-red-700 whitespace-nowrap"> Delete this agent? </span>

                <button @click="confirmDelete(agent._id)" class="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">Yes</button>

                <button @click="agentToDelete = null" class="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2">No</button>
              </div>
            </template>
          </div>
        </li>

        <li v-if="store.agents.length === 0" class="py-4 text-gray-500 text-sm">No agents found.</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAgentStore } from "../../../stores/useAgentStore";
import { toast } from "vue3-toastify";

const store = useAgentStore();
const form = ref({ firstName: "", lastName: "", email: "" });
const agentToDelete = ref<string | null>(null);

onMounted(() => {
  store.loadAgents();
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
