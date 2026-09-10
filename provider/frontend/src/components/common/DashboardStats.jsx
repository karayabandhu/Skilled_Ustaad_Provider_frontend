import React from 'react';
import { formatCurrency } from '../../utils/formatters';

/**
 * StatCard - Single statistic display (Optimized for mobile grid)
 */
export const StatCard = ({ title, value, icon: Icon, isCurrency, trend, colorClass = "text-blue-600" }) => (
  <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2 sm:mb-4">
      <div className={`p-2 sm:p-3 rounded-xl bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
        {Icon && <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${colorClass}`} />}
      </div>
      {trend && (
        <span className={`text-[8px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] sm:text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-tight truncate">{title}</p>
      <h3 className="text-lg sm:text-2xl font-black mt-0.5 text-gray-900 dark:text-white truncate">
        {isCurrency ? formatCurrency(value) : (value || 0).toLocaleString()}
      </h3>
    </div>
  </div>
);

/**
 * StatsGrid - Responsive grid for stat cards (2 columns on mobile)
 */
export const StatsGrid = ({ children }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
    {children}
  </div>
);
