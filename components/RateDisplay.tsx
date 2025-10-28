import React from 'react';
import { ExchangeRate } from '../types';

interface RateDisplayProps {
  rate: ExchangeRate;
}

const RateCard: React.FC<{ title: string; children: React.ReactNode; icon: string }> = ({ title, children, icon }) => (
    <div className="col-12 col-md-6">
        <div className="card h-100" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
            <div className="card-header border-0 pb-0">
                <h3 className="text-accent fw-bold fs-5 mb-0">
                    <i className={`bi ${icon} me-2`}></i>
                    {title}
                </h3>
            </div>
            <div className="card-body pt-3">
                <div className="d-flex flex-column gap-3">
                    {children}
                </div>
            </div>
        </div>
    </div>
);

const RateItem: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
    <div className="d-flex justify-content-between align-items-baseline p-3 rounded" 
         style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--brand-border)' }}>
        <span className="text-muted fw-medium">{label}</span>
        <div className="text-end">
          <span className="fw-bold fs-3 text-white" style={{ fontFamily: 'monospace' }}>{value}</span>
          <span className="text-muted ms-2 small">THB</span>
        </div>
    </div>
);


export const RateDisplay: React.FC<RateDisplayProps> = ({ rate }) => {
  return (
    <div className="card glass-card">
      <div className="card-header border-0">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-graph-up-arrow text-accent fs-2"></i>
            <div>
              <h2 className="mb-0 fw-bold fs-2">Today's Rates</h2>
              <p className="text-muted mb-0 small mt-1">
                <i className="bi bi-calendar-check me-1"></i>
                <strong>Date:</strong> {rate.date}
                <span className="mx-2">|</span>
                <i className="bi bi-credit-card me-1"></i>
                <strong>Method:</strong> {rate.paymentMethod}
              </p>
            </div>
          </div>
          <span className="badge bg-success fs-6 px-3 py-2">
            <i className="bi bi-clock-history me-2"></i>
            Live Rates
          </span>
        </div>
      </div>
      
      <div className="card-body">
        <div className="row g-4">
          <RateCard title="You Buy THB (Exchanger Sells)" icon="bi-basket2-fill">
            <RateItem label="< 10 Lakh MMK" value={rate.sellingRates.below1M_MMK} />
            <RateItem label="> 10 Lakh MMK" value={rate.sellingRates.above1M_MMK} />
            {/* {rate.sellingRates.special_100_500 && (
              <RateItem label="Special (100-500k+)" value={rate.sellingRates.special_100_500} />
            )} */}
          </RateCard>

          <RateCard title="You Sell THB (Exchanger Buys)" icon="bi-wallet2">
            <RateItem label="Base Rate" value={rate.buyingRates.base} />
            <RateItem label="> 10 Lakh MMK" value={rate.buyingRates.above1M_MMK} />
          </RateCard>
        </div>
        
        <div className="alert alert-secondary mt-4 mb-0 text-center" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          All rates are quoted in <strong>THB per 100,000 MMK</strong>
        </div>
      </div>
    </div>
  );
};