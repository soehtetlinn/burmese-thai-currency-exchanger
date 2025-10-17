export async function sendAdminTelegram(text: string): Promise<boolean> {
  try {
    const adminKey = (import.meta as any)?.env?.VITE_CURREX_ADMIN_KEY
      || (typeof window !== 'undefined' ? (window.localStorage.getItem('currex_admin_key') || '') : '')
      || 'currex-admin-123';
    const chatId = (import.meta as any)?.env?.VITE_TELEGRAM_CHAT_ID
      || (typeof window !== 'undefined' ? (window.localStorage.getItem('currex_telegram_chat_id') || '') : '');
    if (!adminKey) return false; // require only admin key; chatId optional (server default)

    const configuredBase = (import.meta as any)?.env?.VITE_API_BASE_URL
      || (typeof window !== 'undefined' ? (window.localStorage.getItem('currex_api_base') || '') : '');
    let baseUrl = configuredBase || '';
    if (!baseUrl) {
      if (typeof window !== 'undefined') {
        const origin = window.location.origin || '';
        // Prefer the API subdomain when running on www or other hosts
        baseUrl = /(^|\.)api\.shltechent\.com$/i.test(window.location.hostname) ? origin : 'https://api.shltechent.com';
      } else {
        baseUrl = 'https://api.shltechent.com';
      }
    }

    const resp = await fetch(`${baseUrl.replace(/\/$/, '')}/api/admin/telegram/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CURREX-ADMIN-KEY': adminKey,
      },
      body: JSON.stringify(chatId ? { text, chatId } : { text }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}


