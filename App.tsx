import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { HistoryPage } from './pages/HistoryPage';
import { CurrencyRatesProvider } from './hooks/useCurrencyRates';
import { WebChatWidget } from './components/WebChatWidget';

const App: React.FC = () => {
  return (
    <CurrencyRatesProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          <WebChatWidget />
        </div>
      </BrowserRouter>
    </CurrencyRatesProvider>
  );
}

export default App;