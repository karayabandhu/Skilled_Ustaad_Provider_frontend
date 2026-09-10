import React from "react";
import { X } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

const DailyChartInfoModal = ({ data = [] }) => {
    // chartData is just the data prop now. We handle empty state in the JSX.
    const chartData = Array.isArray(data) ? data : [];

    return (
        <div className="bg-white dark:bg-gray-800 w-full rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Daily Earnings Analytics
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    This chart shows your daily earnings over time. The line represents your cumulative earnings for each day.
                </p>
            </div>

            {/* Chart */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {chartData && chartData.length > 0 ? (
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#666" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#666" label={{ value: 'Amount (Rs)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip formatter={(value) => `Rs ${value}`} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }} />
                                <Line type="monotone" dataKey="money" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 5 }} activeDot={{ r: 7 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                        <p>No earnings data available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyChartInfoModal;