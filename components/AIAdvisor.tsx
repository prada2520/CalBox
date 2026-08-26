import React, { useState, useRef, useEffect } from 'react';
import { getPackagingAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';

interface AIAdvisorProps {
  contextSummary: string;
}

const QUICK_PROMPTS = [
  '💡 แนะนำวิธีลดต้นทุนกล่องนี้ลง 15%',
  '📦 สเปกและขนาดนี้แข็งแรงพอสำหรับส่งพัสดุไหม?',
  '✨ เคลือบลามิเนตด้าน vs สปอตยูวี ต่างกันอย่างไร?',
  '📊 ถ้าเพิ่มยอดสั่งเป็น 5,000 ใบ ราคาจะลดลงเท่าไหร่?',
];

const AIAdvisor: React.FC<AIAdvisorProps> = ({ contextSummary }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'สวัสดีครับ ผมคือ AI วิศวกรบรรจุภัณฑ์และผู้เชี่ยวชาญด้านต้นทุนสิ่งพิมพ์ (PackCalc AI) มีข้อสงสัยเรื่องสเปกกระดาษ งานเคลือบ หรือต้องการคำแนะนำลดต้นทุน สอบถามได้เลยครับ!',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendText = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getPackagingAdvice(userMsg.text, contextSummary);
      setMessages((prev) => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง', timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[560px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-xs text-amber-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                AI Packaging Consultant
                <span className="text-[10px] bg-indigo-500/40 text-indigo-200 px-1.5 py-0.2 rounded font-normal">
                  Smart BOM
                </span>
              </h3>
              <p className="text-indigo-200 text-[11px]">ที่ปรึกษาด้านสเปกกล่อง & วิศวกรรมต้นทุน</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div key={idx} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs whitespace-pre-line'
                }`}
              >
                {msg.text}
              </div>
              {isUser && (
                <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2 justify-start items-center">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 rounded-tl-none shadow-xs flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>AI กำลังวิเคราะห์ข้อมูลต้นทุน Master BOM...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 pt-2 pb-1.5 bg-white border-t border-slate-100 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
          <span>คำถามแนะนำ:</span>
        </div>
        <div className="flex gap-1.5 pb-1 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((promptText, i) => (
            <button
              key={i}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendText(promptText)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors border border-slate-200 shrink-0 disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendText(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์คำถามเรื่องสเปกกล่อง หรือวิธีลดต้นทุน..."
            disabled={isLoading}
            className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAdvisor;
