import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

interface LiveChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[];
  onMessageSent: (newMessages: any[]) => void;
  userName: string;
}

export const LiveChatDrawer: React.FC<LiveChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onMessageSent,
  userName,
}) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const text = input.trim();
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'default-session',
          senderName: userName || 'Vinay Kumar',
          message: text,
        }),
      });
      const data = await res.json();
      if (data.userMessage && data.agentMessage) {
        onMessageSent([...messages, data.userMessage, data.agentMessage]);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Live Career Specialist Chat"
      className="no-print fixed bottom-5 right-5 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-slate-200 shadow-xl flex flex-col overflow-hidden"
    >
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-400" />
          <div>
            <div className="text-xs font-bold">Live Career & ATS Support Chat</div>
            <div className="text-[10px] text-slate-300">
              atsfriendlyresumes.admin@gmail.com
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close Live Chat"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 h-72 overflow-y-auto flex flex-col gap-3 bg-slate-50 text-xs">
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id || idx}
              className={`flex flex-col max-w-[85%] ${
                isUser ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <span className="text-[10px] text-slate-400 mb-0.5">{m.senderName}</span>
              <div
                className={`p-2.5 rounded-lg leading-relaxed ${
                  isUser
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                {m.message}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          aria-label="Chat message input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about ATS keywords, DOCX export, or pricing..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
        <button
          type="submit"
          aria-label="Send chat message"
          disabled={isSending}
          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>
    </div>
  );
};
