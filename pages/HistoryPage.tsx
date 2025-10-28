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
    <div className="container">
      <div className="row g-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="alert alert-info mb-0 py-2 px-3" style={{ background: 'rgba(34, 211, 238, 0.1)', border: '1px solid var(--brand-accent)' }}>
              <i className="bi bi-database-fill-check me-2 text-accent"></i>
              <small className="text-muted fw-medium">
                Showing {allEntries.length} rate entries (auto-updates every 30 seconds)
              </small>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="btn btn-secondary"
            >
              <i className={`bi bi-arrow-clockwise me-2 ${isRefreshing ? 'spinner-border spinner-border-sm' : ''}`}></i>
              {isRefreshing ? 'Refreshing...' : 'Refresh History'}
            </button>
          </div>
        </div>

        <div className="col-12">
          <HistoryChart history={allEntries} />
        </div>

        <div className="col-12">
          <div className="card glass-card">
            <div className="card-header border-0">
              <h2 className="fw-bold fs-2 mb-0">
                <i className="bi bi-clock-history text-accent me-2"></i>
                Data Log
              </h2>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th scope="col">
                        <i className="bi bi-calendar3 me-2"></i>
                        Date
                      </th>
                      <th scope="col">
                        <i className="bi bi-arrow-up-circle me-2"></i>
                        Sell Rate (&lt;1M)
                      </th>
                      <th scope="col">
                        <i className="bi bi-arrow-up-circle-fill me-2"></i>
                        Sell Rate (&gt;1M)
                      </th>
                      <th scope="col">
                        <i className="bi bi-arrow-down-circle me-2"></i>
                        Buy Rate (Base)
                      </th>
                      <th scope="col">
                        <i className="bi bi-arrow-down-circle-fill me-2"></i>
                        Buy Rate (&gt;1M)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allEntries.length > 0 ? allEntries.map((entry: HistoryEntry, index: number) => (
                      <tr key={entry.id} className={index === 0 ? 'table-active' : ''}>
                        <td className="fw-medium">
                          <div className="d-flex flex-column">
                            <span className="text-white">{entry.date}</span>
                            <span className="text-muted small">
                              <i className="bi bi-clock me-1"></i>
                              {new Date(entry.id).toLocaleTimeString()}
                            </span>
                          </div>
                        </td>
                        <td className="font-monospace text-white">{entry.sellingRates.below1M_MMK}</td>
                        <td className="font-monospace text-white">{entry.sellingRates.above1M_MMK}</td>
                        <td className="font-monospace text-white">{entry.buyingRates.base}</td>
                        <td className="font-monospace text-white">{entry.buyingRates.above1M_MMK}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center py-5">
                          <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                          <span className="text-muted">No history records found.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};