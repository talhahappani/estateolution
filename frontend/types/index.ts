// Shared Enums
export enum TransactionStatus {
  AGREEMENT = "agreement",
  EARNEST_MONEY = "earnest_money",
  TITLE_DEED = "title_deed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TransactionType {
  SALE = "sale",
  RENTAL = "rental",
}

// Shared Interfaces
export interface Agent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface StageHistory {
  stage: TransactionStatus;
  enteredAt: string;
}

export interface AgentEarning {
  agentId: string | Agent;
  role: "listing" | "selling" | "both";
  earning: number;
}

export interface FinancialBreakdown {
  agencyEarning: number;
  agents: AgentEarning[];
}

export interface Transaction {
  _id: string;
  propertyTitle: string;
  transactionType: TransactionType;
  totalServiceFee: number;
  listingAgentId: Agent; // Populated from backend
  sellingAgentId: Agent; // Populated from backend
  status: TransactionStatus;
  stageHistory: StageHistory[];
  cancellationReason?: string;
  cancelledAt?: string;
  financialBreakdown?: FinancialBreakdown;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionStats {
  totalTransactions: number;
  completedTransactions: number;
  cancelledTransactions: number;
  totalAgencyEarnings: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
