import { TransactionStatus } from "../types";

export const useTransactionUtils = () => {
  const formatStage = (stage: TransactionStatus) => {
    return stage
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper to get dynamic Tailwind classes based on status
  const getStatusBadgeClass = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.AGREEMENT:
        return "bg-blue-100 text-blue-800";
      case TransactionStatus.EARNEST_MONEY:
      case TransactionStatus.TITLE_DEED:
        return "bg-yellow-100 text-yellow-800";
      case TransactionStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case TransactionStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return { getStatusBadgeClass, formatStage };
};
