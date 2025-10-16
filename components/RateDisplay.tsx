import React from 'react';
import { ExchangeRate } from '../types';

interface RateDisplayProps {
  rate: ExchangeRate;
}

const RateCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-brand-primary/50 rounded-xl p-6 flex-1 min-w-[280px]">
        <h3 className="text-xl font-semibold text-brand-accent mb-4 border-b border-brand-border pb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const RateItem: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
    <div className="flex justify-between items-baseline">
        <span className="text-brand-text-secondary text-base">{label}</span>
        <div className="text-right">
          <span className="font-mono font-bold text-2xl text-brand-text">{value}</span>
          <span className="text-xs text-brand-text-secondary ml-1">THB</span>
        </div>
    </div>
);


export const RateDisplay: React.FC<RateDisplayProps> = ({ rate }) => {
  return (
    <div className="w-full bg-brand-surface backdrop-blur-sm border border-brand-border rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="mb-6">
          <h2 className="text-3xl font-bold">Today's Rates</h2>
          <p className="text-brand-text-secondary text-base mt-1">
            <span className="font-medium">Date:</span> {rate.date} | <span className="font-medium">Method:</span> {rate.paymentMethod}
          </p>
      </div>
      
      <div className="flex flex-col md:flex-row flex-wrap gap-6">
        <RateCard title="You Buy THB (Exchanger Sells)">
          <RateItem label="< 10 Lakh MMK" value={rate.sellingRates.below1M_MMK} />
          <RateItem label="> 10 Lakh MMK" value={rate.sellingRates.above1M_MMK} />
          {rate.sellingRates.special_100_500 && (
            <RateItem label="Special (100-500k+)" value={rate.sellingRates.special_100_500} />
          )}
        </RateCard>

        <RateCard title="You Sell THB (Exchanger Buys)">
          <RateItem label="Base Rate" value={rate.buyingRates.base} />
          <RateItem label="> 10 Lakh MMK" value={rate.buyingRates.above1M_MMK} />
        </RateCard>
      </div>
      <p className="text-center text-sm text-brand-text-secondary mt-6">All rates are quoted in THB per 100,000 MMK.</p>
    </div>
  );
};