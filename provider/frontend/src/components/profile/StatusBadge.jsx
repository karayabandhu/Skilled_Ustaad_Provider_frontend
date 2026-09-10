import React from "react";
import { useTranslation } from "react-i18next";

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();

  const getStatusStyles = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "paid":
      case "success":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "accepted":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "in_progress":
      case "in-progress":
      case "started":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getTranslatedStatus = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "completed":
        return t("jobs.status.completed", "Completed");
      case "cancelled":
        return t("jobs.status.cancelled", "Cancelled");
      case "pending":
        return t("jobs.status.pending", "Pending");
      case "paid":
      case "success":
        return t("jobs.status.paid", "Paid");
      case "accepted":
        return t("jobs.status.accepted", "Accepted");
      case "in_progress":
      case "in-progress":
      case "started":
        return t("jobs.status.in_progress", "In Progress");
      default:
        return status ? status.replace("_", " ") : "";
    }
  };

  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${getStatusStyles(status)} transition-colors`}
    >
      {getTranslatedStatus(status)}
    </span>
  );
};

export default StatusBadge;
