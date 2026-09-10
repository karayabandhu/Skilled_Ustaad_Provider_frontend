import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * LoadingSkeleton - Standardized skeleton loader for pages
 */
export const LoadingSkeleton = () => (
  <div className="flex flex-col space-y-4 w-full p-6 animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4 mb-4"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl mt-8"></div>
  </div>
);

/**
 * ErrorView - Unified error state with retry
 */
export const ErrorView = ({ message, onRetry }) => {
  let displayMessage = "We couldn't load the data. Please check your connection and try again.";
  
  if (typeof message === "string") {
    displayMessage = message;
  } else if (message instanceof Error) {
    displayMessage = message.message;
  } else if (message && typeof message === "object" && message.message) {
    displayMessage = message.message;
  } else if (message && typeof message.toString === "function") {
    displayMessage = message.toString();
  }

  if (typeof displayMessage === "string" && (displayMessage.toLowerCase().includes("timeout") || displayMessage.toLowerCase().includes("network error"))) {
    displayMessage = "Your connection seems a bit slow right now. Please check your network and try again.";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">{displayMessage}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
          <Loader2 className="h-4 w-4" />
          Retry Connection
        </Button>
      )}
    </div>
  );
};

/**
 * EmptyState - Standardized empty list view
 */
export const EmptyState = ({ title, description, icon: Icon, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-full mb-4">
      {Icon ? <Icon className="h-10 w-10 text-gray-400" /> : <AlertCircle className="h-10 w-10 text-gray-400" />}
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-6 text-sm">{description}</p>
    {onAction && (
      <Button onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);
