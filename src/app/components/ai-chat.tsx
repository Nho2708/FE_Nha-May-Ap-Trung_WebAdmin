import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { env } from '@/config/env';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGE: Message = {
  id: 1,
  type: 'ai',
  content: 'Xin chào! Tôi là AI Assistant. Tôi có thể giúp gì cho bạn?',
  timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
};

const quickQuestions = [
  'Tổng quan hệ thống?',
  'Thiết bị có lỗi không?',
  'Tình trạng đơn hàng?',
  'Hỗ trợ kỹ thuật gần đây?',
];

export function AIChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (msg: Omit<Message, 'id'>) => {
    setMessages((prev) => [...prev, { ...msg, id: prev.length + 1 }]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    addMessage({ type: 'user', content: text, timestamp });
    setInput('');
    setSending(true);

    try {
      const res = await fetch(env.aiApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json() as { reply?: string; content?: string; message?: string };
      const reply = data.reply ?? data.content ?? data.message ?? 'Không có phản hồi.';

      addMessage({
        type: 'ai',
        content: reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch {
      addMessage({
        type: 'ai',
        content: 'Không thể kết nối đến AI. Vui lòng thử lại sau.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-blue-100">Luôn sẵn sàng hỗ trợ</p>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-2 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Quick Questions */}
      <div className="p-3 bg-slate-50 border-b border-slate-200">
        <p className="text-xs text-slate-600 mb-2">Câu hỏi nhanh:</p>
        <div className="flex flex-wrap gap-1.5">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => setInput(q)}
              className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.type === 'ai' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {message.type === 'ai' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 ${
                message.type === 'ai' ? 'bg-slate-100 text-slate-800' : 'bg-blue-600 text-white'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1">{message.timestamp}</p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-slate-100 rounded-2xl px-4 py-2.5">
              <Loader2 size={16} className="animate-spin text-slate-500" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && void handleSend()}
            placeholder="Nhập câu hỏi của bạn..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          />
          <button
            onClick={() => void handleSend()}
            disabled={sending || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
