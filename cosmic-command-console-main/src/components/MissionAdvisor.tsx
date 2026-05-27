import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Send, Rocket, Star, BarChart2, Sparkles, X, Bot, MessageSquare } from 'lucide-react';
// ייבוא ה-instance של ה-axios והפונקציות מה-api.ts שלך
import api, { fetchAllPlanets } from '@/lib/api'; 

interface Message {
  role: 'user' | 'bot';
  text: string;
}

export function MissionAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "שלום מפקד, יועץ הבינה המלאכותית פעיל. איך אוכל לעזור?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (forcedText?: string) => {
    const textToSend = forcedText || input;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { role: "user", text: textToSend }]);
    setInput("");
    setIsTyping(true);

    // אנימציית שיגור מיוחדת
    if (textToSend.includes("שגר") || textToSend.includes("🚀")) {
      setIsLaunching(true);
      setTimeout(() => setIsLaunching(false), 3500);
    }

    try {
      let responseText = "";
      const query = textToSend.toLowerCase();

      if (query.includes("מועדף") || query.includes("הכי טוב")) {
        const res = await api.get(`/api/prediction/best`);
        responseText = res.data;
      } 
      else if (query.includes("כל הציונים") || query.includes("כל הכוכבים")) {
        const res = await api.get(`/api/prediction/all-scores`);
        responseText = res.data;
      }
      else {
        const planets = await fetchAllPlanets();
        const foundPlanet = planets.find(p => query.includes(p.name.toLowerCase()));
        if (foundPlanet) {
          const res = await api.get(`/api/prediction/${foundPlanet.name}`);
          responseText = res.data;
        } else {
          responseText = "לא זיהיתי פקודה. נסה לשאול על כוכב ספציפי, לבקש המלצה, או לכתוב 'שגר'!";
        }
      }
      setMessages(prev => [...prev, { role: "bot", text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "bot", text: "מצטער מפקד, שגיאת תקשורת עם המודל." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    // השורה המתוקנת עם ה-z-index הגבוה ביותר למניעת הסתרה
    <div className="fixed bottom-6 right-6 z-[9999] font-sans" dir="rtl">
      
      {/* אנימציית חללית לשיגור */}
      <AnimatePresence>
        {isLaunching && (
          <motion.div 
            initial={{ bottom: -100, opacity: 0, x: 0 }}
            animate={{ bottom: 1000, opacity: 1, x: -200 }}
            transition={{ duration: 3, ease: "easeIn" }}
            className="fixed right-20 pointer-events-none z-[10000]"
          >
            <Rocket size={120} className="text-primary -rotate-45 filter drop-shadow-[0_0_20px_rgba(0,255,242,0.5)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-strong mb-4 w-80 overflow-hidden rounded-2xl border border-primary/20 shadow-2xl bg-black/95"
          >
            {/* Header של הצ'אט */}
            <div className="bg-primary/10 p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={14} /> Mission Advisor
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
            </div>

            {/* איזור ההודעות */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-black/20 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                    m.role === "user" ? "bg-primary text-black font-bold shadow-lg shadow-primary/20" : "bg-white/5 text-white/90 border border-white/10"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[9px] text-primary animate-pulse font-mono uppercase tracking-tighter">Analyzing telemetry...</div>}
              <div ref={messagesEndRef} />
            </div>

            {/* כפתורי גישה מהירה */}
            <div className="px-2 py-2 flex gap-1.5 border-t border-white/5 bg-white/5 overflow-x-auto no-scrollbar">
              <button onClick={() => handleSend("מה הכוכב המועדף כרגע?")} className="flex-shrink-0 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1 font-bold">
                <Star size={10} /> המלצה
              </button>
              <button onClick={() => handleSend("תן לי את כל ציוני הכוכבים")} className="flex-shrink-0 text-[9px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded-md border border-purple-500/30 hover:bg-purple-500/20 transition-all flex items-center gap-1 font-bold">
                <BarChart2 size={10} /> כל המגזרים
              </button>
            </div>

            <div className="p-3 border-t border-white/10 flex gap-2 bg-black/40">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="הקלד פקודה או 'שגר'..." 
                className="flex-1 bg-transparent text-[11px] outline-none text-white placeholder:text-white/20 text-right font-medium" 
              />
              <button onClick={() => handleSend()} className="text-primary hover:scale-110 transition-all active:scale-90">
                <Send size={18} className="rotate-180" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* כפתור פתיחה צף */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="h-14 w-14 rounded-full bg-primary text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,255,242,0.3)] hover:scale-110 transition-all active:scale-95 group relative overflow-hidden"
      >
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          {isOpen ? <Bot size={28} /> : <MessageSquare size={28} />}
        </motion.div>
      </button>
    </div>
  );
}