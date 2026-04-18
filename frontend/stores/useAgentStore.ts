import { defineStore } from "pinia";
import { ref } from "vue";
import { useAgentApi } from "../composables/useAgentApi";
import type { Agent } from "../types";

export const useAgentStore = defineStore("agent", () => {
  const api = useAgentApi();
  const agents = ref<Agent[]>([]);
  const isLoading = ref(false);

  const loadAgents = async () => {
    isLoading.value = true;
    try {
      agents.value = await api.fetchAgents();
    } finally {
      isLoading.value = false;
    }
  };

  const addAgent = async (data: { firstName: string; lastName: string; email: string }) => {
    isLoading.value = true;
    try {
      const newAgent = await api.createAgent(data);
      agents.value.push(newAgent); // Add to the UI list immediately
    } finally {
      isLoading.value = false;
    }
  };

  const removeAgent = async (id: string) => {
    try {
      await api.deleteAgent(id);
      agents.value = agents.value.filter((a) => a._id !== id);
    } catch (error) {
      throw error;
    }
  };

  return { agents, isLoading, loadAgents, addAgent, removeAgent };
});
