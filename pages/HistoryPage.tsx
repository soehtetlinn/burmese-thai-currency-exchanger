import React from 'react';
import { useCurrencyRates } from '../hooks/useCurrencyRates';
import { HistoryChart } from '../components/HistoryChart';
import { HistoryEntry } from '../types';

export const HistoryPage: React.FC = () => {
  const { history, currentRate } = useCurrencyRates();

  // Combine current rate with history for a complete view
  const allEntries = currentRate ? [currentRate, ...history] : history;

  return (
    <div className="space-y-8">
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
                    {new Date(entry.id).toLocaleString()}
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