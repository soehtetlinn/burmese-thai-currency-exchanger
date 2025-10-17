import React, { useEffect, useRef, useState } from 'react';
import { ensureSession, listMessages, sendMessage, WebChatMessage } from '../services/webchatService';

export const WebChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState<string>(() => {
    try { return localStorage.getItem('webchat_session_key') || ''; } catch { return ''; }
  });
  const [messages, setMessages] = useState<WebChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const lastTsRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const key = await ensureSession(sessionKey || undefined);
      if (!mounted) return;
      setSessionKey(key);
      try { localStorage.setItem('webchat_session_key', key); } catch {}
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sessionKey) return;
    let stop = false;
    async function poll() {
      if (stop) return;
      try {
        const list = await listMessages(sessionKey, lastTsRef.current || undefined);
        if (list.length > 0) {
          setMessages(prev => {
            const combined = [...prev, ...list];
            const last = combined[combined.length - 1];
            lastTsRef.current = last?.timestamp || lastTsRef.current;
            return combined;
          });
        }
      } catch {}
      setTimeout(poll, 2500);
    }
    poll();
    return () => { stop = true; };
  }, [sessionKey]);

  const handleSend = async () => {
    const txt = input.trim();
    if (!txt || !sessionKey) return;
    setLoading(true);
    try {
      const ok = await sendMessage(sessionKey, txt);
      if (ok) {
        setMessages(prev => [...prev, { id: Math.random().toString(36).slice(2), author: 'client', text: txt, timestamp: new Date().toISOString() }]);
        setInput('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-brand-accent text-slate-900 w-14 h-14 flex items-center justify-center hover:bg-brand-accent-hover"
          aria-label="Open chat"
          title="Chat with us"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M2 5a3 3 0 013-3h14a3 3 0 013 3v9a3 3 0 01-3 3H8l-5 5V5z"/></svg>
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[90vw] bg-brand-surface border border-brand-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-brand-primary flex items-center justify-between">
            <div className="font-semibold">Chat with us</div>
            <button onClick={() => setOpen(false)} className="text-brand-text-secondary hover:text-brand-text">✕</button>
          </div>
          <div className="p-3 h-80 overflow-y-auto space-y-2">
            {messages.length === 0 && (
              <div className="text-sm text-brand-text-secondary">Ask us anything about rates or transfers.</div>
            )}
            {messages.map(m => (
              <div key={m.id} className={m.author === 'client' ? 'text-right' : 'text-left'}>
                <div className={(m.author === 'client' ? 'bg-brand-accent text-slate-900' : 'bg-brand-primary text-brand-text') + ' inline-block px-3 py-2 rounded-xl max-w-[85%]'}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-brand-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              className="flex-1 bg-brand-primary border-2 border-brand-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent"
              placeholder="Type a message..."
            />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="px-4 py-2 rounded-xl bg-brand-accent text-slate-900 font-semibold disabled:opacity-60">Send</button>
          </div>
        </div>
      )}
    </>
  );
};


