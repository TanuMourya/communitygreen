import React, { useState, useRef, useEffect } from 'react';
import API from '../api';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const SUGGESTIONS = [
  'How many open issues are there?',
  'How do I report an issue?',
  'What issues are reported near me?',
  'Which issues are resolved?',
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '👋 Hi! I\'m your CommunityGreen assistant. Ask me about environmental issues in your area!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('question', text);
      const res = await API.post('/issues/chat', formData);
      setMessages(prev => [...prev, { role: 'bot', text: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: '❌ Sorry, I couldn\'t connect. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat bubble button */}
      <button onClick={() => setOpen(!open)} style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
        width: 52, height: 52, borderRadius: '50%',
        background: '#16a34a', color: 'white', border: 'none',
        fontSize: 22, cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s'
      }}>
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 1000,
          width: 360, height: 480, background: 'white',
          borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '0.5px solid #e2e8f0', display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ background: '#16a34a', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>CommunityGreen Assistant</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>Ask me anything about local issues</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
                  background: msg.role === 'user' ? '#16a34a' : '#f1f5f9',
                  color: msg.role === 'user' ? 'white' : '#1e293b',
                  fontSize: 13, lineHeight: 1.5,
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: msg.role === 'bot' ? 4 : 12,
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: 12, fontSize: 13, color: '#94a3b8' }}>
                  🤔 Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div style={{ padding: '0 12px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)} style={{
                  background: '#f0fdf4', color: '#16a34a', border: '0.5px solid #bbf7d0',
                  padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer'
                }}>{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '0.5px solid #e2e8f0', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask a question..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '0.5px solid #e2e8f0', fontSize: 13, outline: 'none', marginTop: 0 }}
            />
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{
              background: '#16a34a', color: 'white', border: 'none',
              borderRadius: 10, padding: '8px 14px', fontSize: 13,
              fontWeight: 600, cursor: 'pointer'
            }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}