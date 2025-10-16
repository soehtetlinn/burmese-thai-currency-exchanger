import React, { useState, useMemo, useCallback } from 'react';
import { ExchangeRate } from '../types';

enum ConversionDirection {
  MMK_TO_THB = 'MMK_TO_THB',
  THB_TO_MMK = 'THB_TO_MMK'
}

// Fix: Define CalculatorProps interface for component props.
interface CalculatorProps {
  rate: ExchangeRate;
}

export const Calculator: React.FC<CalculatorProps> = ({ rate }) => {
  const [direction, setDirection] = useState<ConversionDirection>(ConversionDirection.MMK_TO_THB);
  const [amount, setAmount] = useState<string>('100000');
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setAmount(value);
    }
  };

  const parsedAmount = useMemo(() => parseFloat(amount) || 0, [amount]);

  const conversionResult = useMemo(() => {
    if (!parsedAmount) {
      return { from: '0', to: '0', rateUsed: 0 };
    }

    if (direction === ConversionDirection.MMK_TO_THB) {
      const applicableRate = parsedAmount >= 1000000 
        ? rate.sellingRates.above1M_MMK 
        : rate.sellingRates.below1M_MMK;
      
      const result = (parsedAmount / 100000) * applicableRate;
      return {
        from: parsedAmount.toLocaleString(),
        to: result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        rateUsed: applicableRate
      };
    } else { // THB_TO_MMK
      const estimatedMMK = (parsedAmount / rate.buyingRates.base) * 100000;
      const applicableRate = estimatedMMK >= 1000000
        ? rate.buyingRates.above1M_MMK
        : rate.buyingRates.base;

      const result = (parsedAmount / applicableRate) * 100000;
      return {
        from: parsedAmount.toLocaleString(),
        to: result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        rateUsed: applicableRate
      };
    }
  }, [parsedAmount, direction, rate]);

  const toggleDirection = useCallback(() => {
    setDirection(prev => prev === ConversionDirection.MMK_TO_THB 
      ? ConversionDirection.THB_TO_MMK 
      : ConversionDirection.MMK_TO_THB);
    setAmount(prev => {
        const num = parseFloat(prev);
        if (!num) return '1000';
        return prev === '100000' ? '1000' : '100000';
    });
  }, []);

  const { fromCurrency, toCurrency, fromValue, toValue } = useMemo(() => {
    const formattedAmount = parsedAmount.toLocaleString(undefined, {maximumFractionDigits: 2});
    if (direction === ConversionDirection.MMK_TO_THB) {
      return { fromCurrency: 'MMK', toCurrency: 'THB', fromValue: amount === '' ? '' : formattedAmount, toValue: conversionResult.to };
    } else {
      return { fromCurrency: 'THB', toCurrency: 'MMK', fromValue: amount === '' ? '' : formattedAmount, toValue: conversionResult.to };
    }
  }, [direction, amount, conversionResult, parsedAmount]);
  
  return (
    <div className="w-full bg-brand-surface backdrop-blur-sm border border-brand-border rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="text-3xl font-bold mb-6">Currency Converter</h2>
      <div className="relative flex flex-col items-center gap-2">
        {/* From Amount */}
        <div className="w-full">
          <label htmlFor="fromAmount" className="block text-lg font-medium text-brand-text-secondary mb-2">You Send</label>
          <div className="relative">
            <input
              id="fromAmount"
              type="text"
              value={fromValue}
              onChange={handleAmountChange}
              className="w-full bg-brand-primary border-2 border-brand-border rounded-xl shadow-sm py-4 px-6 text-4xl font-mono focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition"
              placeholder="0"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-semibold text-brand-text-secondary">{fromCurrency}</span>
          </div>
        </div>
        
        {/* Swap Button */}
        <div className="w-full flex justify-center py-2">
            <button onClick={toggleDirection} className="p-4 bg-brand-surface border-2 border-brand-border rounded-full hover:bg-brand-accent hover:text-slate-900 transition-all duration-300 transform hover:rotate-180 hover:scale-110 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 12l-4-4m4 4l4-4m6 8v-12m0 12l-4-4m4 4l4-4" />
                </svg>
            </button>
        </div>

        {/* To Amount */}
        <div className="w-full">
          <label htmlFor="toAmount" className="block text-lg font-medium text-brand-text-secondary mb-2">They Receive</label>
          <div className="relative">
            <div
              id="toAmount"
              className="w-full bg-brand-bg-start border-2 border-brand-primary rounded-xl shadow-inner py-4 px-6 text-4xl font-mono text-brand-accent"
            >
              {toValue}
            </div>
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-semibold text-brand-text-secondary">{toCurrency}</span>
          </div>
        </div>
      </div>
      <div className="text-center mt-6 text-base text-brand-text-secondary">
        <p>Applicable Rate: <span className="font-bold text-brand-text">{conversionResult.rateUsed}</span> THB / 100k MMK</p>
      </div>
    </div>
  );
};