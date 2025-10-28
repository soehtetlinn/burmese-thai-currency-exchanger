export interface AdminLoginResponse {
  success: boolean;
  token: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AdminVerifyResponse {
  valid: boolean;
}

const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://api.shltechent.com';

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Initialize tokens from localStorage
const initializeTokens = () => {
  accessToken = localStorage.getItem('currex_admin_token');
  refreshToken = localStorage.getItem('currex_admin_refresh_token');
};

// Save tokens to localStorage
const saveTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('currex_admin_token', access);
  localStorage.setItem('currex_admin_refresh_token', refresh);
};

// Clear tokens
const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('currex_admin_token');
  localStorage.removeItem('currex_admin_refresh_token');
  localStorage.removeItem('currex_admin_ok');
};

// Refresh access token
const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshToken) return null;
  
  try {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      const newAccessToken = data.accessToken || data.token;
      if (newAccessToken) {
        accessToken = newAccessToken;
        localStorage.setItem('currex_admin_token', newAccessToken);
        return newAccessToken;
      }
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
  
  // If refresh fails, clear all tokens
  clearTokens();
  return null;
};

// Initialize tokens on module load
initializeTokens();

export async function adminLogin(password: string): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/currex/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  
  // Save both tokens
  const accessToken = data.accessToken || data.token;
  saveTokens(accessToken, data.refreshToken);
  
  return {
    success: data.success,
    token: accessToken,
    accessToken: accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt
  };
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/currex/admin/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return false;
    }

    const result: AdminVerifyResponse = await response.json();
    return result.valid;
  } catch {
    return false;
  }
}

// Make authenticated request with automatic token refresh
export async function authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  let response = await fetch(url, { ...options, headers });
  
  // If unauthorized and we have a refresh token, try to refresh
  if (response.status === 401 && refreshToken && !url.includes('/refresh')) {
    console.log('Access token expired, attempting refresh...');
    const newAccessToken = await refreshAccessToken();
    
    if (newAccessToken) {
      // Retry the request with new token
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(url, { ...options, headers });
    }
  }
  
  return response;
}

export function saveAdminToken(token: string): void {
  try {
    localStorage.setItem('currex_admin_token', token);
  } catch {
    // Ignore localStorage errors
  }
}

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem('currex_admin_token');
  } catch {
    return null;
  }
}

export function clearAdminToken(): void {
  clearTokens();
}

export function logout(): void {
  clearTokens();
}
