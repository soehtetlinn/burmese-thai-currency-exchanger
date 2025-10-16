
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ExchangeRate, HistoryEntry } from '../types';

interface CurrencyRatesContextType {
  currentRate: ExchangeRate | null;
  history: HistoryEntry[];
  updateRates: (newRateData: Omit<ExchangeRate, 'id'>) => void;
  isLoading: boolean;
  error: string | null;
  setError: (message: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

const CurrencyRatesContext = createContext<CurrencyRatesContextType | undefined>(undefined);

const initialRate: ExchangeRate = {
    id: "2025-10-16T12:00:00.000Z",
    date: "16-Oct-2025",
    paymentMethod: "Bank Transfer",
    sellingRates: {
        below1M_MMK: 797,
        above1M_MMK: 800,
        special_100_500: "802/803 for 100-500k+"
    },
    buyingRates: {
        base: 820,
        above1M_MMK: 817
    },
    notes: [
        "ငွေဈေးအတက်ကျရှိပါသဖြင့် ငွေလွှဲခါနီးစျေးမေးပေးပါ (Please ask for the rate before transferring as prices fluctuate)",
        "အိမ်းလွှဲများအတွက်Kpay/Wave/Bank အကောင့်အစုံ/မှတ်ပုံတင်ထုတ်/Wave passwordထုတ်အကုန်ရပါတယ် (For home transfers, all accounts like Kpay/Wave/Bank, ID card issuance, Wave password issuance are available)"
    ]
};

export const CurrencyRatesProvider = ({ children }: { children: ReactNode }) => {
  const [currentRate, setCurrentRate] = useState<ExchangeRate | null>(() => {
    try {
      const savedRate = localStorage.getItem('currentRate');
      return savedRate ? JSON.parse(savedRate) : initialRate;
    } catch (error) {
      console.error("Failed to parse currentRate from localStorage", error);
      return initialRate;
    }
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const savedHistory = localStorage.getItem('rateHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Failed to parse rateHistory from localStorage", error);
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateRates = useCallback((newRateData: Omit<ExchangeRate, 'id'>) => {
    const newRateWithId: ExchangeRate = { ...newRateData, id: new Date().toISOString() };
    
    // Add the old currentRate to history if it exists and is different
    if (currentRate && currentRate.id !== newRateWithId.id) {
        const newHistory = [currentRate, ...history];
        setHistory(newHistory);
        localStorage.setItem('rateHistory', JSON.stringify(newHistory));
    }
    
    setCurrentRate(newRateWithId);
    localStorage.setItem('currentRate', JSON.stringify(newRateWithId));
  }, [currentRate, history]);

  const value = {
    currentRate,
    history,
    updateRates,
    isLoading,
    error,
    setError,
    setIsLoading
  };

  return (
    <CurrencyRatesContext.Provider value={value}>
      {children}
    </CurrencyRatesContext.Provider>
  );
};

export const useCurrencyRates = () => {
  const context = useContext(CurrencyRatesContext);
  if (context === undefined) {
    throw new Error('useCurrencyRates must be used within a CurrencyRatesProvider');
  }
  return context;
};
