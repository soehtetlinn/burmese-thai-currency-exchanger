
import React from 'react';
import { useCurrencyRates } from '../hooks/useCurrencyRates';
import { RateDisplay } from '../components/RateDisplay';
import { Calculator } from '../components/Calculator';

export const HomePage: React.FC = () => {
  const { currentRate } = useCurrencyRates();

  if (!currentRate) {
    return (
      <div className="text-center py-10">
        <p className="text-brand-text-secondary text-lg">Loading rates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <RateDisplay rate={currentRate} />
      <Calculator rate={currentRate} />
    </div>
  );
};
