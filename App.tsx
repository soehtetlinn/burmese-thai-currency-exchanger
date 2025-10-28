import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { HistoryPage } from './pages/HistoryPage';
import { CurrencyRatesProvider } from './hooks/useCurrencyRates';
import { WebChatWidget } from './components/WebChatWidget';
import { ThemeProvider } from './hooks/useTheme';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CurrencyRatesProvider>
        <BrowserRouter>
          <div className="min-vh-100 d-flex flex-column">
            <Header />
            <main className="flex-grow-1 py-4 py-md-5">
              <div className="container" style={{ maxWidth: '1200px' }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Routes>
              </div>
            </main>
            <WebChatWidget />
          </div>
        </BrowserRouter>
      </CurrencyRatesProvider>
    </ThemeProvider>
  );
}

export default App;