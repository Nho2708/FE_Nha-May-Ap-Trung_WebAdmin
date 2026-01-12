import React, { useState } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

const mockMessages: Message[] = [
  {
    id: 1,
    type: 'ai',
    content: 'Xin chào! Tôi là AI Assistant. Tôi có thể giúp gì cho bạn?',
    timestamp: '10:30'
  }
];

const quickQuestions = [
  'Tổng doanh thu tháng này?',
  'Template nào hiệu quả nhất?',
  'Thiết bị có lỗi bất thường?',
  'Số lượng đơn hàng mới?'
];

export function AIChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: getAIResponse(input),
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('doanh thu')) {
      return '📊 Tổng doanh thu tháng này là 328 triệu VNĐ, tăng 18% so với tháng trước. Dòng máy bán chạy nhất là máy 100 trứng với 85 máy đã xuất kho.';
    } else if (lowerQuestion.includes('template') || lowerQuestion.includes('hiệu quả')) {
      return '🎯 Template "Trứng Gà" hiệu quả nhất với tỉ lệ thành công 92%, được 156 người dùng sử dụng trong 324 vụ ấp. Template này có nhiệt độ 37.5-38°C và độ ẩm 55-65%.';
    } else if (lowerQuestion.includes('lỗi') || lowerQuestion.includes('thiết bị')) {
      return '⚠️ Hiện có 12 thiết bị đang gặp sự cố, trong đó 3 máy có vấn đề về hệ thống gia nhiệt và 2 máy cần kiểm tra motor đảo trứng. Đã có 5 ticket bảo trì đang được xử lý.';
    } else if (lowerQuestion.includes('đơn hàng')) {
      return '📦 Hiện có 8 đơn hàng mới chờ xử lý, 12 đơn đang trong quá trình giao hàng và 247 đơn đã hoàn thành trong tháng này.';
    } else {
      return '🤖 Tôi có thể cung cấp thông tin về doanh thu, hiệu quả template, tình trạng thiết bị và đơn hàng. Bạn muốn biết thông tin gì cụ thể?';
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
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
        <button
          onClick={onClose}
          className="hover:bg-white/20 rounded-lg p-2 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Quick Questions */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <p className="text-xs text-slate-600 mb-2">Câu hỏi nhanh:</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {question}
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
              message.type === 'ai' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              {message.type === 'ai' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 ${
                message.type === 'ai'
                  ? 'bg-slate-100 text-slate-800'
                  : 'bg-blue-600 text-white'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1">{message.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
