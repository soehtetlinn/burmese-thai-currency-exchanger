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
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6">
            <div className="card glass-card text-center">
              <div className="card-body">
                <div className="spinner-border text-accent mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Verifying admin access...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card glass-card">
              <div className="card-header border-0">
                <h1 className="text-accent fw-bold fs-3 mb-0">
                  <i className="bi bi-shield-lock-fill me-2"></i>
                  Admin Access
                </h1>
              </div>
              <div className="card-body">
                <form onSubmit={handleKeySubmit}>
                  <div className="mb-3">
                    <label className="form-label">Enter admin password</label>
                    <input
                      type="password"
                      value={keyInput}
                      onChange={(e)=>setKeyInput(e.target.value)}
                      className="form-control"
                      placeholder="Admin password"
                      disabled={isVerifying}
                    />
                  </div>
                  {keyError && (
                    <div className="alert alert-danger py-2" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {keyError}
                    </div>
                  )}
                  <button 
                    type="submit" 
                    disabled={isVerifying}
                    className="btn btn-primary w-100"
                  >
                    {isVerifying ? 'Verifying...' : 'Login'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card glass-card">
        <div className="card-header border-0">
          <h1 className="text-accent fw-bold fs-2 mb-2">
            <i className="bi bi-pencil-square me-2"></i>
            Update Exchange Rates
          </h1>
          <p className="text-muted mb-0">Enter the exchange rates manually using the form below.</p>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Date and Payment Method */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label">
                  <i className="bi bi-calendar3 me-2"></i>
                  Date *
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="form-control"
                  placeholder="e.g., 22-Oct-2025"
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">
                  <i className="bi bi-credit-card me-2"></i>
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Wallet">Mobile Wallet</option>
                </select>
              </div>
            </div>

            {/* Selling Rates */}
            <div className="card mb-4" style={{ background: 'rgba(34, 211, 238, 0.05)' }}>
              <div className="card-header border-0 bg-transparent">
                <h3 className="text-accent fw-bold fs-5 mb-0">
                  <i className="bi bi-basket2-fill me-2"></i>
                  Selling Rates (အရောင်း)
                </h3>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Below 1M MMK *</label>
                    <input
                      type="number"
                      value={formData.sellingBelow1M}
                      onChange={(e) => handleInputChange('sellingBelow1M', e.target.value)}
                      className="form-control"
                      placeholder="e.g., 807"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Above 1M MMK *</label>
                    <input
                      type="number"
                      value={formData.sellingAbove1M}
                      onChange={(e) => handleInputChange('sellingAbove1M', e.target.value)}
                      className="form-control"
                      placeholder="e.g., 810"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buying Rates */}
            <div className="card mb-4" style={{ background: 'rgba(34, 211, 238, 0.05)' }}>
              <div className="card-header border-0 bg-transparent">
                <h3 className="text-accent fw-bold fs-5 mb-0">
                  <i className="bi bi-wallet2 me-2"></i>
                  Buying Rates (အဝယ်)
                </h3>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Base Rate *</label>
                    <input
                      type="number"
                      value={formData.buyingBase}
                      onChange={(e) => handleInputChange('buyingBase', e.target.value)}
                      className="form-control"
                      placeholder="e.g., 830"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Above 1M MMK (Optional)</label>
                    <input
                      type="number"
                      value={formData.buyingAbove1M}
                      onChange={(e) => handleInputChange('buyingAbove1M', e.target.value)}
                      className="form-control"
                      placeholder="e.g., 827"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="form-label">
                <i className="bi bi-sticky me-2"></i>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="form-control"
                rows={3}
                placeholder="Additional notes or information..."
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-100 py-3"
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Updating Rates...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Update Exchange Rates
                </>
              )}
            </button>
          </form>
        </div>
      </div>

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