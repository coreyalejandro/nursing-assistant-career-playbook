import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Search, Zap, Bot, X, Trash2 } from 'lucide-react';

export function GeminiChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>(() => {
    const saved = localStorage.getItem('gemini_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse chat history:", e);
      }
    }
    return [
      { role: 'model', text: 'Hi! I am your AI career assistant. Ask me questions or use the buttons to search the web or get mapping information!' }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('gemini_chat_history', JSON.stringify(messages));
  }, [messages]);

  const clearHistory = () => {
    const defaultMessages = [
      { role: 'model', text: 'Hi! I am your AI career assistant. Ask me questions or use the buttons to search the web or get mapping information!' }
    ];
    setMessages(defaultMessages);
    localStorage.removeItem('gemini_chat_history');
  };

  const sendMessage = async (type: 'chat' | 'search' | 'maps' | 'lite') => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages, type })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: 'Error: ' + data.error }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Connection error' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-slate-900 border-2 border-slate-700 shadow-[8px_8px_0px_0px_rgba(245,158,11,1)] z-50 flex flex-col h-[500px] max-h-[80vh]">
      <div className="flex bg-slate-950 p-3 border-b-2 border-slate-800 items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-amber-400" />
          <h3 className="font-mono font-bold text-slate-200">Gemini Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearHistory} 
            className="text-slate-400 hover:text-rose-450 p-1 rounded-sm hover:bg-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-sm hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 text-sm font-sans">
        
        {/* PHI Security Warning Banner */}
        <div className="bg-rose-950/40 border border-rose-800 p-3 rounded text-rose-200 text-xs">
          <strong className="text-rose-400 block mb-1 uppercase tracking-wider text-[10px] font-black">⚠️ HIPAA / Privacy Security Notice</strong>
          Do not enter patient names, resident details, or specific Protected Health Information (PHI) in this chat workspace.
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="p-3 bg-slate-800 text-slate-400 max-w-[80%] border border-slate-700 italic">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-slate-950 border-t-2 border-slate-800 space-y-2">
         {/* Diagnostic Quick Action Pill Menu */}
         <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar scroll-smooth">
           <button 
             onClick={() => { setInput("I am feeling completely burned out and exhausted."); sendMessage('lite'); }}
             className="whitespace-nowrap px-3 py-1 bg-slate-800 text-rose-400 border border-slate-700 hover:bg-slate-700 text-xs font-bold rounded-full transition-colors cursor-pointer"
           >
             🚨 Feeling Burned Out
           </button>
           <button 
             onClick={() => { setInput("Can you simulate a short CNA behavioral mock interview for me?"); sendMessage('chat'); }}
             className="whitespace-nowrap px-3 py-1 bg-slate-800 text-emerald-400 border border-slate-700 hover:bg-slate-700 text-xs font-bold rounded-full transition-colors cursor-pointer"
           >
             🎤 Mock Interview
           </button>
           <button 
             onClick={() => { setInput("What do I need to know about CNA license reciprocity if I move to a new state?"); sendMessage('search'); }}
             className="whitespace-nowrap px-3 py-1 bg-slate-800 text-blue-400 border border-slate-700 hover:bg-slate-700 text-xs font-bold rounded-full transition-colors cursor-pointer"
           >
             🗺️ State Reciprocity
           </button>
         </div>

         <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 bg-slate-800 text-white p-2 border border-slate-700 font-sans focus:outline-none focus:border-amber-400"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage('chat')}
            />
            <button onClick={() => sendMessage('chat')} className="bg-amber-500 text-slate-950 p-2 font-bold hover:bg-amber-400 transition-colors">
              <Send className="w-5 h-5" />
            </button>
         </div>
         <div className="flex gap-2 text-xs font-mono w-full items-stretch">
            <button onClick={() => sendMessage('search')} className="flex-1 bg-slate-800 text-blue-400 hover:bg-slate-700 p-1.5 flex justify-center items-center gap-1 border border-slate-700 cursor-pointer" title="Use Google Search Grounding">
              <Search className="w-3.5 h-3.5" /> Search
            </button>
            <button onClick={() => sendMessage('maps')} className="flex-1 bg-slate-800 text-emerald-400 hover:bg-slate-700 p-1.5 flex justify-center items-center gap-1 border border-slate-700 cursor-pointer" title="Use Google Maps Grounding">
              <MapPin className="w-3.5 h-3.5" /> Maps
            </button>
            <button onClick={() => sendMessage('lite')} className="flex-1 bg-slate-800 text-yellow-400 hover:bg-slate-700 p-1.5 flex justify-center items-center gap-1 border border-slate-700 cursor-pointer" title="Use Flash Lite for fast responses">
              <Zap className="w-3.5 h-3.5" /> Fast
            </button>
         </div>
      </div>
    </div>
  );
}
