import { ExchangeRate } from '../types';

const API_BASE_URL = 'https://www.shltechent.com/api';
const ADMIN_KEY = 'currex-admin-123'; // This matches CURREX_ADMIN_KEY in backend .env

// Backend exchange rate response format
interface BackendExchangeRate {
  id: string;
  base: string;
  quote: string;
  buyRate: number | null;
  sellRate: number | null;
  buyBelow1mPer100k: number | null;
  buyAbove1mPer100k: number | null;
  sellBelow1mPer100k: number | null;
  sellAbove1mPer100k: number | null;
  sellSpecial100to500: string | null;
  paymentMethod: string | null;
  dateText: string | null;
  sourceText: string;
  createdAt: string;
  parsedAt: string;
}

// Convert backend format to frontend format
function backendToFrontend(backend: BackendExchangeRate): ExchangeRate {
  // Extract notes from sourceText
  const lines = backend.sourceText.split('\n').map(s => s.trim()).filter(Boolean);
  const notes = lines.slice(-2).filter(line => 
    line.length > 20 && !line.match(/\d{3,4}/) && !line.match(/selling|buying/i)
  );

  return {
    id: backend.createdAt || backend.id,
    date: backend.dateText || new Date(backend.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    paymentMethod: backend.paymentMethod || 'Bank Transfer',
    sellingRates: {
      below1M_MMK: backend.sellBelow1mPer100k || backend.sellRate || 0,
      above1M_MMK: backend.sellAbove1mPer100k || backend.sellRate || 0,
      special_100_500: backend.sellSpecial100to500 || undefined,
    },
    buyingRates: {
      base: backend.buyBelow1mPer100k || backend.buyRate || 0,
      above1M_MMK: backend.buyAbove1mPer100k || backend.buyRate || 0,
    },
    notes: notes.length > 0 ? notes : [
      'ငွေဈေးအတက်ကျရှိပါသဖြင့် ငွေလွှဲခါနီးစျေးမေးပေးပါ',
    ],
  };
}

// Convert frontend format to backend format for submission
function frontendToBackend(data: Omit<ExchangeRate, 'id'>): string {
  const lines = [
    data.date,
    '',
    data.paymentMethod,
    '',
    'Selling (အရောင်း)',
    `မြန်မာငွေ10သိန်းအထက် ${data.sellingRates.above1M_MMK}`,
    '',
    `မြန်မာငွေ10သိန်းအောက် ${data.sellingRates.below1M_MMK}`,
  ];

  if (data.sellingRates.special_100_500) {
    lines.push('', `100-500အထက်-${data.sellingRates.special_100_500}`);
  }

  lines.push(
    '',
    `Buying (အဝယ်) ${data.buyingRates.base}`,
    '',
    `10သိန်းအထက်${data.buyingRates.above1M_MMK}`,
  );

  if (data.notes && data.notes.length > 0) {
    lines.push('', ...data.notes);
  }

  return lines.join('\n');
}

export async function fetchLatestRate(): Promise<ExchangeRate | null> {
  try {
    console.log('[API] Fetching latest rate from:', `${API_BASE_URL}/fx/latest`);
    const response = await fetch(`${API_BASE_URL}/fx/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[API] Response status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('[API] No rates found (404)');
        return null; // No rates found
      }
      const errorText = await response.text();
      console.error('[API] Error response:', errorText);
      throw new Error(`Failed to fetch rates: ${response.status}`);
    }

    const backend = await response.json() as BackendExchangeRate;
    console.log('[API] Backend data received:', backend);
    const converted = backendToFrontend(backend);
    console.log('[API] Converted to frontend format:', converted);
    return converted;
  } catch (error) {
    console.error('[API] Error fetching latest rate:', error);
    return null;
  }
}

export async function fetchRateHistory(): Promise<ExchangeRate[]> {
  try {
    console.log('[API] Fetching rate history from:', `${API_BASE_URL}/admin/fx`);
    const response = await fetch(`${API_BASE_URL}/admin/fx`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-currex-admin-key': ADMIN_KEY,
      },
    });

    console.log('[API] History response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] History error response:', errorText);
      throw new Error(`Failed to fetch history: ${response.status}`);
    }

    const backendList = await response.json() as BackendExchangeRate[];
    console.log('[API] History data received:', backendList.length, 'rates');
    const converted = backendList.map(backendToFrontend);
    console.log('[API] Converted history:', converted);
    return converted;
  } catch (error) {
    console.error('[API] Error fetching rate history:', error);
    return [];
  }
}

export async function saveRateToBackend(data: Omit<ExchangeRate, 'id'>): Promise<boolean> {
  try {
    const text = frontendToBackend(data);
    console.log('[API] Saving rate to backend:', text);
    
    const response = await fetch(`${API_BASE_URL}/admin/fx/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-currex-admin-key': ADMIN_KEY,
      },
      body: JSON.stringify({
        text,
        base: 'THB',
        quote: 'MMK',
      }),
    });

    console.log('[API] Save response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'unknown' }));
      console.error('[API] Backend save failed:', error);
      return false;
    }

    const result = await response.json();
    console.log('[API] Save successful:', result);
    return true;
  } catch (error) {
    console.error('[API] Error saving rate to backend:', error);
    return false;
  }
}

