import type { Agent } from "../types";

export const useAgentApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  const fetchAgents = async (): Promise<Agent[]> => {
    return await $fetch<Agent[]>("/agents", { baseURL });
  };

  const createAgent = async (data: { firstName: string; lastName: string; email: string }): Promise<Agent> => {
    return await $fetch<Agent>("/agents", {
      method: "POST",
      baseURL,
      body: data,
    });
  };

  const deleteAgent = async (id: string): Promise<void> => {
    await $fetch(`/agents/${id}`, { method: "DELETE", baseURL });
  };

  return { fetchAgents, createAgent, deleteAgent };
};
