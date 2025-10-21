import React, { useState } from 'react';
import { useCurrencyRates } from '../hooks/useCurrencyRates';
import { HistoryChart } from '../components/HistoryChart';
import { HistoryEntry } from '../types';

export const HistoryPage: React.FC = () => {
  const { history, currentRate, refreshFromBackend, isLoading } = useCurrencyRates();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Combine current rate with history for a complete view
  const allEntries = currentRate ? [currentRate, ...history] : history;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFromBackend();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-brand-text-secondary">
            Showing {allEntries.length} rate entries (auto-updates every 30 seconds)
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-accent hover:text-slate-900 text-brand-text rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-brand-border"
        >
          <svg
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRefreshing ? 'Refreshing...' : 'Refresh History'}
        </button>
      </div>

      <HistoryChart history={allEntries} />

      <div className="bg-brand-surface backdrop-blur-sm border border-brand-border rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-3xl font-bold mb-6">Data Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-base text-left text-brand-text-secondary">
            <thead className="text-sm text-brand-text uppercase bg-brand-primary/50">
              <tr>
                <th scope="col" className="px-6 py-4 rounded-tl-lg">Date</th>
                <th scope="col" className="px-6 py-4">Sell Rate (&lt;1M)</th>
                <th scope="col" className="px-6 py-4">Sell Rate (&gt;1M)</th>
                <th scope="col" className="px-6 py-4">Buy Rate (Base)</th>
                <th scope="col" className="px-6 py-4 rounded-tr-lg">Buy Rate (&gt;1M)</th>
              </tr>
            </thead>
            <tbody>
              {allEntries.length > 0 ? allEntries.map((entry: HistoryEntry, index: number) => (
                <tr key={entry.id} className={`border-b border-brand-border ${index % 2 === 0 ? 'bg-transparent' : 'bg-brand-primary/20'} hover:bg-brand-primary/70`}>
                  <td className="px-6 py-4 font-medium text-brand-text whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{entry.date}</span>
                      <span className="text-xs text-brand-text-secondary">
                        {new Date(entry.id).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono">{entry.sellingRates.below1M_MMK}</td>
                  <td className="px-6 py-4 font-mono">{entry.sellingRates.above1M_MMK}</td>
                  <td className="px-6 py-4 font-mono">{entry.buyingRates.base}</td>
                  <td className="px-6 py-4 font-mono">{entry.buyingRates.above1M_MMK}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-12">No history records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};