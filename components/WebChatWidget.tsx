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
          className="btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-4 float-animation"
          style={{ 
            width: '60px', 
            height: '60px', 
            zIndex: 1050,
            boxShadow: '0 8px 25px rgba(34, 211, 238, 0.5)'
          }}
          aria-label="Open chat"
          title="Chat with us"
        >
          <i className="bi bi-chat-dots-fill fs-4"></i>
        </button>
      )}
      {open && (
        <div 
          className="card position-fixed bottom-0 end-0 m-4 shadow-lg" 
          style={{ 
            width: '350px', 
            maxWidth: '90vw', 
            height: '500px',
            zIndex: 1050 
          }}
        >
          <div className="card-header d-flex justify-content-between align-items-center bg-primary">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-chat-dots-fill"></i>
              <span className="fw-semibold">Chat with us</span>
            </div>
            <button 
              onClick={() => setOpen(false)} 
              className="btn-close btn-close-white"
              aria-label="Close"
            />
          </div>
          <div className="card-body overflow-auto" style={{ height: 'calc(100% - 130px)' }}>
            {messages.length === 0 && (
              <div className="alert alert-info small">
                <i className="bi bi-info-circle me-2"></i>
                Ask us anything about rates or transfers.
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={`mb-2 ${m.author === 'client' ? 'text-end' : 'text-start'}`}>
                <div 
                  className={`d-inline-block px-3 py-2 rounded-3 ${
                    m.author === 'client' 
                      ? 'bg-primary text-dark' 
                      : 'text-white'
                  }`}
                  style={{ 
                    maxWidth: '85%',
                    background: m.author === 'client' ? undefined : 'var(--brand-primary)'
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="card-footer">
            <div className="input-group">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                className="form-control"
                placeholder="Type a message..."
                style={{ borderRadius: '1rem 0 0 1rem' }}
              />
              <button 
                onClick={handleSend} 
                disabled={loading || !input.trim()} 
                className="btn btn-primary"
                style={{ borderRadius: '0 1rem 1rem 0' }}
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


