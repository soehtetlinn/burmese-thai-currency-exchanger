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
    <div className="card glass-card">
      <div className="card-header border-0 d-flex align-items-center gap-3">
        <i className="bi bi-calculator-fill text-accent fs-3"></i>
        <h2 className="mb-0 fw-bold fs-2">Currency Converter</h2>
      </div>
      <div className="card-body">
        <div className="row g-4">
          {/* From Amount */}
          <div className="col-12">
            <label htmlFor="fromAmount" className="form-label">
              <i className="bi bi-send-fill me-2"></i>
              You Send
            </label>
            <div className="position-relative">
              <input
                id="fromAmount"
                type="text"
                value={fromValue}
                onChange={handleAmountChange}
                className="form-control form-control-lg"
                style={{ 
                  fontSize: '2.5rem', 
                  fontFamily: 'monospace', 
                  paddingRight: '5rem',
                  height: '80px'
                }}
                placeholder="0"
              />
              <span 
                className="position-absolute top-50 end-0 translate-middle-y me-4 fs-3 fw-bold badge bg-secondary"
                style={{ fontSize: '1.5rem !important' }}
              >
                {fromCurrency}
              </span>
            </div>
          </div>
          
          {/* Swap Button */}
          <div className="col-12 text-center py-2">
            <button 
              onClick={toggleDirection} 
              className="btn btn-lg rounded-circle p-3 float-animation"
              style={{ 
                width: '70px', 
                height: '70px',
                background: 'var(--brand-surface)',
                border: '2px solid var(--brand-border)'
              }}
              title="Swap currencies"
            >
              <i className="bi bi-arrow-down-up fs-2 text-accent"></i>
            </button>
          </div>

          {/* To Amount */}
          <div className="col-12">
            <label htmlFor="toAmount" className="form-label">
              <i className="bi bi-cash-coin me-2"></i>
              They Receive
            </label>
            <div className="position-relative">
              <div
                id="toAmount"
                className="form-control form-control-lg text-accent fw-bold"
                style={{ 
                  fontSize: '2.5rem', 
                  fontFamily: 'monospace',
                  paddingRight: '5rem',
                  height: '80px',
                  background: 'var(--brand-bg-start)',
                  border: '2px solid var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {toValue}
              </div>
              <span 
                className="position-absolute top-50 end-0 translate-middle-y me-4 fs-3 fw-bold badge bg-secondary"
                style={{ fontSize: '1.5rem !important' }}
              >
                {toCurrency}
              </span>
            </div>
          </div>
        </div>
        
        <div className="alert alert-info mt-4 mb-0 text-center" role="alert">
          <i className="bi bi-info-circle-fill me-2"></i>
          <strong>Applicable Rate:</strong> 
          <span className="fs-5 fw-bold text-accent mx-2">{conversionResult.rateUsed}</span> 
          THB / 100k MMK
        </div>
      </div>
    </div>
  );
};