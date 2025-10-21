import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrencyRates } from '../hooks/useCurrencyRates';
import { parseExchangeText } from '../services/geminiService';
import { saveRateToBackend } from '../services/apiService';
import { Modal } from '../components/Modal';
import { sendAdminTelegram } from '../services/telegramService';

const sampleText = `16-Oct-2025

Bank Transfer

Selling (အရောင်း)
မြန်မာငွေ10သိန်းအထက် 800

မြန်မာငွေ10သိန်းအောက် 797

100-500အထက်-802/803

Buying (အဝယ်) 820

10သိန်းအထက်817

ငွေဈေးအတက်ကျရှိပါသဖြင့် ငွေလွှဲခါနီးစျေးမေးပေးပါ

အိမ်းလွှဲများအတွက်Kpay/Wave/Bank အကောင့်အစုံ/မှတ်ပုံတင်ထုတ်/Wave passwordထုတ်အကုန်ရပါတယ်`;

export const AdminPage: React.FC = () => {
  const [lastMessage, setLastMessage] = useState<string>(() => {
    try { return localStorage.getItem('lastExchangeMessage') || ''; } catch { return ''; }
  });
  const [text, setText] = useState<string>('');
  const [authorized, setAuthorized] = useState<boolean>(() => {
    try { return localStorage.getItem('currex_admin_ok') === '1'; } catch { return false; }
  });
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const { updateRates, isLoading, error, setError, setIsLoading } = useCurrencyRates();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Textarea cannot be empty.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const parsedData = await parseExchangeText(text);
      
      // Save to backend first - this is CRITICAL
      console.log('[Admin] Attempting to save to backend...');
      const backendSaved = await saveRateToBackend(parsedData);
      
      if (!backendSaved) {
        // Show clear error if backend save fails
        setError("⚠️ Failed to save to backend database. The rate was saved locally only and will disappear on refresh. Please try again!");
        setIsLoading(false);
        return; // Don't proceed if backend save fails
      }
      
      console.log('[Admin] Backend save successful!');
      
      // Update local state (this also saves to localStorage)
      updateRates(parsedData);
      
      try { localStorage.setItem('lastExchangeMessage', text); } catch {}
      setLastMessage(text);
      
      // Best-effort Telegram notification (skip silently if not configured)
      const date = parsedData.date || new Date().toISOString().slice(0,10);
      const pm = parsedData.paymentMethod || 'Unknown';
      const sellBelow = parsedData.sellingRates?.below1M_MMK ?? '-';
      const sellAbove = parsedData.sellingRates?.above1M_MMK ?? '-';
      const buyBase = parsedData.buyingRates?.base ?? '-';
      const buyAbove = parsedData.buyingRates?.above1M_MMK ?? '-';
      const special = parsedData.sellingRates?.special_100_500 ? `\nSpecial (100-500k+): ${parsedData.sellingRates.special_100_500}` : '';
      const msg = `CURR EX Rates Updated\nDate: ${date}\nMethod: ${pm}\nSell <1M: ${sellBelow}\nSell >1M: ${sellAbove}\nBuy base: ${buyBase}\nBuy >1M: ${buyAbove}${special}`;
      sendAdminTelegram(msg).catch(() => {});
      
      setShowSuccess(true);
      setText(''); // Clear the textarea after successful submission
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput === 'soehtetlinn1996$') {
      try { localStorage.setItem('currex_admin_ok', '1'); } catch {}
      setAuthorized(true);
      setKeyError(null);
    } else {
      setKeyError('Invalid key');
    }
  };

  if (!authorized) {
    return (
      <div className="max-w-md mx-auto bg-brand-surface backdrop-blur-sm border border-brand-border rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold mb-4 text-brand-accent">Admin Access</h1>
        <form onSubmit={handleKeySubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-brand-text-secondary">Enter access key</label>
            <input
              type="password"
              value={keyInput}
              onChange={(e)=>setKeyInput(e.target.value)}
              className="w-full p-3 bg-brand-primary border-2 border-brand-border rounded-xl text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
              placeholder="Access key"
            />
          </div>
          {keyError && <div className="text-sm text-red-300">{keyError}</div>}
          <button type="submit" className="w-full bg-brand-accent text-slate-900 font-semibold py-3 rounded-xl hover:bg-brand-accent-hover transition">Continue</button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface backdrop-blur-sm border border-brand-border rounded-2xl shadow-lg p-6 sm:p-8">
      <h1 className="text-3xl font-bold mb-2 text-brand-accent">Update Rates</h1>
      <p className="text-brand-text-secondary mb-8">Paste the daily exchange rate message below to parse and update the application.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={15}
            className="w-full p-4 bg-brand-primary border-2 border-brand-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent font-mono text-base transition"
            placeholder={lastMessage || "Paste exchange rate message here..."}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 text-base">
            <strong>Error:</strong> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-accent text-slate-900 font-bold text-lg py-4 px-4 rounded-xl hover:bg-brand-accent-hover transition-all duration-300 disabled:bg-brand-primary disabled:text-brand-text-secondary disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-cyan-500/50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Parsing & Updating...
            </>
          ) : (
            'Update Rates'
          )}
        </button>
      </form>
      <Modal
        title="Success"
        isOpen={showSuccess}
        onClose={() => { setShowSuccess(false); navigate('/'); }}
      >
        Rates updated successfully!
      </Modal>
    </div>
  );
};