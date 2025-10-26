export interface AdminLoginResponse {
  success: boolean;
  token: string;
  expiresAt: string;
}

export interface AdminVerifyResponse {
  valid: boolean;
}

const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://www.shltechent.com/api';

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

  return await response.json();
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/currex/admin/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
  try {
    localStorage.removeItem('currex_admin_token');
    localStorage.removeItem('currex_admin_ok');
  } catch {
    // Ignore localStorage errors
  }
}
