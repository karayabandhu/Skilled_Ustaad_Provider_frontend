import React from 'react';

const PreferenceToggle = ({ label, isEnabled, onToggle, loading }) => {
  return (
    <div className="flex justify-between items-center p-3.5 sm:p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:border-blue-100 dark:hover:border-blue-900/30">
      <p className="font-bold text-gray-700 dark:text-white uppercase tracking-tight text-[10px] sm:text-xs pr-4">{label}</p>
      <button
        disabled={loading}
        onClick={onToggle}
        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isEnabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        role="switch"
        aria-checked={isEnabled}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 rounded-full shadow bg-white transform ring-0 transition ease-in-out duration-200 ${
            isEnabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export default PreferenceToggle;
