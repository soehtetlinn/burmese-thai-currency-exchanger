export type WebChatMessage = {
  id: string;
  author: 'client' | 'admin' | string;
  text: string;
  timestamp: string;
};

const base = (import.meta as any)?.env?.VITE_API_BASE_URL || '';
const API_BASE = base || (typeof window !== 'undefined' ? window.location.origin : '');

export async function ensureSession(existing?: string): Promise<string> {
  const resp = await fetch(`${API_BASE.replace(/\/$/, '')}/api/webchat/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionKey: existing })
  });
  const data = await resp.json();
  return data.sessionKey || existing || '';
}

export async function listMessages(sessionKey: string, since?: string): Promise<WebChatMessage[]> {
  const url = new URL(`${API_BASE.replace(/\/$/, '')}/api/webchat/messages`);
  url.searchParams.set('sessionKey', sessionKey);
  if (since) url.searchParams.set('since', since);
  const resp = await fetch(url.toString());
  if (!resp.ok) return [];
  return await resp.json();
}

export async function sendMessage(sessionKey: string, text: string): Promise<boolean> {
  const resp = await fetch(`${API_BASE.replace(/\/$/, '')}/api/webchat/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionKey, text })
  });
  return resp.ok;
}


