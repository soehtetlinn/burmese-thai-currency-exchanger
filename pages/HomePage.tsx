
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
      <div className="container">
        <div className="card glass-card text-center">
          <div className="card-body py-5">
            <div className="spinner-border text-accent mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted fs-5">Loading rates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row g-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div className="alert alert-info mb-0 py-2 px-3" style={{ background: 'rgba(34, 211, 238, 0.1)', border: '1px solid var(--brand-accent)' }}>
              <i className="bi bi-lightning-charge-fill me-2 text-accent"></i>
              <small className="text-muted fw-medium">Auto-updates every 30 seconds</small>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="btn btn-secondary"
            >
              <i className={`bi bi-arrow-clockwise me-2 ${isRefreshing ? 'spinner-border spinner-border-sm' : ''}`}></i>
              {isRefreshing ? 'Refreshing...' : 'Refresh Rates'}
            </button>
          </div>
        </div>
        
        <div className="col-12">
          <RateDisplay rate={currentRate} />
        </div>
        
        <div className="col-12">
          <Calculator rate={currentRate} />
        </div>
      </div>
    </div>
  );
};
