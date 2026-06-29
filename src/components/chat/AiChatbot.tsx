'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, ChefHat } from 'lucide-react';
import { usePathname } from 'next/navigation'; // 1. Import the pathname hook

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  recipes?: any[];
}

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'bot', text: "Hi! I'm your AI culinary assistant. What are you craving today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 2. Get the current URL path
  const pathname = usePathname();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const openChat = () => setIsOpen(true);
    
    window.addEventListener('open-ai-chat', openChat);
    
    return () => window.removeEventListener('open-ai-chat', openChat);
  }, []);

  // 3. Define the pages where the chatbot is allowed to show
  const isHomePage = pathname === '/';
  const isMarketplacePage = pathname === '/recipes' || pathname === '/marketplace';
  const isTrendingPage = pathname === '/trending'; 
  
  const shouldShowChatbot = isHomePage || isMarketplacePage || isTrendingPage;

  // 4. If we are not on an allowed page, render nothing
  if (!shouldShowChatbot) {
    return null;
  }

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:4000/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'bot', 
            text: result.data.reply,
            recipes: result.data.recipes 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: "Server connection failed." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{ zIndex: 999999, position: 'fixed' }}
        className={`bottom-6 right-6 p-4 bg-teal-600 text-white rounded-full shadow-2xl hover:bg-teal-700 transition-all ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div 
          style={{ zIndex: 999999, position: 'fixed' }}
          className="bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="bg-teal-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ChefHat size={20} />
              <h3 className="font-bold">Smart Discovery</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-teal-700 p-1 rounded-full">
              <X size={20}/>
            </button>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm ${msg.role === 'user' ? 'bg-teal-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'}`}>
                  {msg.text}
                </div>
                
                {/* Render Recipe Cards if AI returns them */}
                {msg.recipes && msg.recipes.length > 0 && (
                  <div className="mt-2 w-[90%] space-y-2">
                    {msg.recipes.map((recipe: any) => (
                      <div key={recipe.recipe_id} className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 flex gap-3 items-center">
                         <div className="flex-1 overflow-hidden">
                             <p className="text-sm font-bold truncate text-slate-800">{recipe.title}</p>
                             <div className="flex items-center justify-between mt-1">
                               <p className="text-xs text-teal-600 font-semibold">{recipe.price} XRP</p>
                             </div>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 p-2">
                <ChefHat className="animate-bounce" size={16} /> 
                <span className="text-sm">Finding recipes...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. A hearty breakfast..."
                className="flex-1 px-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:border-teal-500 text-sm text-black"
              />
              <button type="submit" disabled={!input.trim() || isLoading} className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50">
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}