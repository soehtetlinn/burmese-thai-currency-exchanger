import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrencyRates } from '../hooks/useCurrencyRates';
import { saveRateToBackend } from '../services/apiService';
import { Modal } from '../components/Modal';
import { sendAdminTelegram } from '../services/telegramService';
import { adminLogin, verifyAdminToken, getAdminToken, saveAdminToken, clearAdminToken } from '../services/adminAuthService';

// Form data interface
interface RateFormData {
  date: string;
  paymentMethod: string;
  sellingBelow1M: string;
  sellingAbove1M: string;
  buyingBase: string;
  buyingAbove1M: string;
  notes: string;
}

export const AdminPage: React.FC = () => {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { updateRates, isLoading, error, setError, setIsLoading } = useCurrencyRates();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<RateFormData>({
    date: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/\s/g, '-'),
    paymentMethod: 'Bank Transfer',
    sellingBelow1M: '',
    sellingAbove1M: '',
    buyingBase: '',
    buyingAbove1M: '',
    notes: 'ငွေဈေးအတက်ကျရှိပါသဖြင့် ငွေလွှဲခါနီးစျေးမေးပေးပါ'
  });

  // Check for existing admin token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAdminToken();
      if (token) {
        setIsVerifying(true);
        try {
          const isValid = await verifyAdminToken(token);
          if (isValid) {
            setAuthorized(true);
          } else {
            clearAdminToken();
          }
        } catch {
          clearAdminToken();
        } finally {
          setIsVerifying(false);
        }
      }
    };
    checkAuth();
  }, []);

  const handleInputChange = (field: keyof RateFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.sellingBelow1M || !formData.sellingAbove1M || !formData.buyingBase) {
      setError("Please fill in all required rate fields (Selling <1M, Selling >1M, Buying Base)");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Convert form data to the expected format
      const rateData = {
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        sellingRates: {
          below1M_MMK: parseInt(formData.sellingBelow1M),
          above1M_MMK: parseInt(formData.sellingAbove1M)
        },
        buyingRates: {
          base: parseInt(formData.buyingBase),
          above1M_MMK: formData.buyingAbove1M ? parseInt(formData.buyingAbove1M) : undefined
        },
        notes: formData.notes ? [formData.notes] : []
      };

      // Save to backend
      console.log('[Admin] Attempting to save structured rate data...');
      const backendSaved = await saveRateToBackend(rateData);
      
      if (!backendSaved) {
        setError("⚠️ Failed to save to backend database. Please try again!");
        setIsLoading(false);
        return;
      }
      
      console.log('[Admin] Backend save successful!');
      
      // Update local state
      updateRates(rateData);
      
      // Send Telegram notification
      const msg = `CURR EX Rates Updated\nDate: ${formData.date}\nMethod: ${formData.paymentMethod}\nSell <1M: ${formData.sellingBelow1M}\nSell >1M: ${formData.sellingAbove1M}\nBuy base: ${formData.buyingBase}${formData.buyingAbove1M ? `\nBuy >1M: ${formData.buyingAbove1M}` : ''}`;
      sendAdminTelegram(msg).catch(() => {});
      
      setShowSuccess(true);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        sellingBelow1M: '',
        sellingAbove1M: '',
        buyingBase: '',
        buyingAbove1M: '',
        notes: 'ငွေဈေးအတက်ကျရှိပါသဖြင့် ငွေလွှဲခါနီးစျေးမေးပေးပါ'
      }));
      
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setKeyError('Password is required');
      return;
    }

    setIsVerifying(true);
    setKeyError(null);

    try {
      const response = await adminLogin(keyInput);
      saveAdminToken(response.token);
      setAuthorized(true);
      setKeyInput('');
    } catch (error: any) {
      setKeyError(error.message || 'Invalid password');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="max-w-md mx-auto bg-brand-surface backdrop-blur-sm border border-brand-border rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-brand-text-secondary">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-md mx-auto bg-brand-surface backdrop-blur-sm border border-brand-border rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold mb-4 text-brand-accent">Admin Access</h1>
        <form onSubmit={handleKeySubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-brand-text-secondary">Enter admin password</label>
            <input
              type="password"
              value={keyInput}
              onChange={(e)=>setKeyInput(e.target.value)}
              className="w-full p-3 bg-brand-primary border-2 border-brand-border rounded-xl text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
              placeholder="Admin password"
              disabled={isVerifying}
            />
          </div>
          {keyError && <div className="text-sm text-red-300">{keyError}</div>}
          <button 
            type="submit" 
            disabled={isVerifying}
            className="w-full bg-brand-accent text-slate-900 font-semibold py-3 rounded-xl hover:bg-brand-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface backdrop-blur-sm border border-brand-border rounded-2xl shadow-lg p-6 sm:p-8">
      <h1 className="text-3xl font-bold mb-2 text-brand-accent">Update Exchange Rates</h1>
      <p className="text-brand-text-secondary mb-8">Enter the exchange rates manually using the form below.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date and Payment Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-brand-text-secondary">Date *</label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full p-3 bg-brand-primary border-2 border-brand-border rounded-xl text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
              placeholder="e.g., 22-Oct-2025"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-brand-text-secondary">Payment Method *</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className="w-full p-3 bg-brand-primary border-2 border-brand-border rounded-xl text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
              required
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Mobile Wallet">Mobile Wallet</option>
            </select>
          </div>
        </div>

        {/* Selling Rates */}
        <div className="bg-brand-primary/30 p-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-brand-accent">Selling Rates (အရောင်း)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-brand-text-secondary">Below 1M MMK *</label>
              <input
                type="number"
                value={formData.sellingBelow1M}
                onChange={(e) => handleInputChange('sellingBelow1M', e.target.value)}
                className="w-full p-3 bg-brand-primary border-2 border-brand-border rounded-xl text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
                placeholder="e.g., 807"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-brand-text-secondary">Above 1M MMK *</label>
              <input
                type="number"
                value={formData.sellingAbove1M}
                onChange={(e) => handleInputChange('sellingAbove1M', e.target.value)}
                className="w-full p-3 bg-brand-primary border-2 border-brand-border rounded-xl text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
                placeholder="e.g., 810"
                required
              />
            </div>
          </div>
        </div>

        {/* Buying Rates */}
        <div className="bg-brand-primary/30 p-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-brand-accent">Buying Rates (အဝယ်)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-brand-text-secondary">Base Rate *</label>
              <input
                type="number"
                value={formData.buyingBase}
                onChange={(e) => handleInputChange('buyingBase', e.target.value)}
                className="w-full p-3 bg-brand-primary border-2 border-brand-border rounded-xl text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
                placeholder="e.g., 830"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-brand-text-secondary">Above 1M MMK (Optional)</label>
              <input
                type="number"
                value={formData.buyingAbove1M}
                onChange={(e) => handleInputChange('buyingAbove1M', e.target.value)}
                className="w-full p-3 bg-brand-primary border-2 border-brand-border rounded-xl text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
                placeholder="e.g., 827"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2 text-brand-text-secondary">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full p-3 bg-brand-primary border-2 border-brand-border rounded-xl text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
            rows={3}
            placeholder="Additional notes or information..."
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-accent text-slate-900 font-semibold py-4 rounded-xl hover:bg-brand-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Updating Rates...' : 'Update Exchange Rates'}
        </button>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Success!"
      >
        <p>Exchange rates have been updated successfully!</p>
      </Modal>
    </div>
  );
};