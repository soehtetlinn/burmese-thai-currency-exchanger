
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { ExchangeRate, HistoryEntry } from '../types';
import { fetchLatestRate, fetchRateHistory } from '../services/apiService';

interface CurrencyRatesContextType {
  currentRate: ExchangeRate | null;
  history: HistoryEntry[];
  updateRates: (newRateData: Omit<ExchangeRate, 'id'>) => void;
  isLoading: boolean;
  error: string | null;
  setError: (message: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  refreshFromBackend: () => Promise<void>;
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
        "ငွေဈေးအတက်ကျရှိပါသဖြင့် ငွေလွှဲခါနီးစျေးမေးပေးပါ (Please ask for the rate before transferring as prices fluctuate)",
        "အိမ်းလွှဲများအတွက်Kpay/Wave/Bank အကောင့်အစုံ/မှတ်ပုံတင်ထုတ်/Wave passwordထုတ်အကုန်ရပါတယ် (For home transfers, all accounts like Kpay/Wave/Bank, ID card issuance, Wave password issuance are available)"
    ]
};

const POLL_INTERVAL = 30000; // Poll every 30 seconds for updates

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
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchedIdRef = useRef<string | null>(null);

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
    lastFetchedIdRef.current = newRateWithId.id;
  }, [currentRate, history]);

  const refreshFromBackend = useCallback(async () => {
    console.log('[Hook] refreshFromBackend called');
    try {
      // Fetch latest rate and history in parallel
      const [latestRate, backendHistory] = await Promise.all([
        fetchLatestRate(),
        fetchRateHistory()
      ]);
      
      console.log('[Hook] Latest rate from backend:', latestRate);
      console.log('[Hook] History from backend:', backendHistory?.length, 'items');
      console.log('[Hook] Last fetched ID:', lastFetchedIdRef.current);
      
      // Update current rate if we have one
      if (latestRate) {
        if (latestRate.id !== lastFetchedIdRef.current) {
          console.log('[Hook] New rate detected! Updating...');
          
          setCurrentRate(prevRate => {
            // Add previous rate to history before updating (only if it's different)
            if (prevRate && prevRate.id !== latestRate.id) {
              console.log('[Hook] Moving old rate to history:', prevRate.id);
            }
            
            localStorage.setItem('currentRate', JSON.stringify(latestRate));
            lastFetchedIdRef.current = latestRate.id;
            console.log('[Hook] Updated current rate to:', latestRate.id);
            return latestRate;
          });
        } else {
          console.log('[Hook] Rate unchanged (same ID)');
        }
      } else {
        console.log('[Hook] No current rate data returned from backend');
      }

      // Always update history from backend (independent of current rate)
      if (backendHistory && backendHistory.length > 0) {
        console.log('[Hook] Processing', backendHistory.length, 'history items from backend');
        
        // Remove the current rate from history if it exists
        const currentRateId = latestRate ? latestRate.id : lastFetchedIdRef.current;
        const filteredHistory = backendHistory.filter(
          item => item.id !== currentRateId
        );
        
        console.log('[Hook] Filtered history to', filteredHistory.length, 'items (excluding current rate)');
        setHistory(filteredHistory);
        localStorage.setItem('rateHistory', JSON.stringify(filteredHistory));
        console.log('[Hook] History updated successfully');
      } else {
        console.log('[Hook] No history data from backend, keeping local history');
      }
    } catch (error) {
      console.error('[Hook] Error refreshing from backend:', error);
      // Don't show error to user for background polling failures
    }
  }, []); // Empty dependencies - use refs and functional setState

  // Initial fetch on mount
  useEffect(() => {
    console.log('[Hook] useEffect running - setting up polling');
    const initialFetch = async () => {
      console.log('[Hook] Initial fetch starting...');
      setIsLoading(true);
      try {
        await refreshFromBackend();
        console.log('[Hook] Initial fetch complete');
      } catch (error) {
        console.error('[Hook] Initial fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialFetch();

    // Set up polling for updates
    console.log('[Hook] Setting up polling interval:', POLL_INTERVAL, 'ms');
    pollIntervalRef.current = setInterval(() => {
      console.log('[Hook] Polling interval triggered');
      refreshFromBackend();
    }, POLL_INTERVAL);

    // Cleanup on unmount
    return () => {
      console.log('[Hook] Cleaning up polling interval');
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [refreshFromBackend]);

  const value = {
    currentRate,
    history,
    updateRates,
    isLoading,
    error,
    setError,
    setIsLoading,
    refreshFromBackend,
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
