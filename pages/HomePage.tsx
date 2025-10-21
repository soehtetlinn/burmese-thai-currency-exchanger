
import React, { useState } from 'react';
import { useCurrencyRates } from '../hooks/useCurrencyRates';
import { RateDisplay } from '../components/RateDisplay';
import { Calculator } from '../components/Calculator';

export const HomePage: React.FC = () => {
  const { currentRate, refreshFromBackend, isLoading } = useCurrencyRates();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFromBackend();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Small delay for visual feedback
    }
  };

  if (!currentRate) {
    return (
      <div className="text-center py-10">
        <p className="text-brand-text-secondary text-lg">Loading rates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-brand-text-secondary">
            Auto-updates every 30 seconds
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
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <RateDisplay rate={currentRate} />
      <Calculator rate={currentRate} />
    </div>
  );
};
