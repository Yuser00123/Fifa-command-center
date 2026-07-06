/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Sparkles, HelpCircle, User, Bot, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const LANGUAGES = [
  { code: 'en', name: 'English 🇺🇸' },
  { code: 'es', name: 'Español 🇪🇸' },
  { code: 'fr', name: 'Français 🇫🇷' },
  { code: 'pt', name: 'Português 🇵🇹' },
  { code: 'hi', name: 'हिन्दी 🇮🇳' },
];

const PRESET_QUESTIONS: Record<string, string[]> = {
  en: [
    'How do I find my seat in Sector 122?',
    'Where is the closest medical station?',
    'Are there wheelchair accessible exits?',
    'What is the next shuttle time to Lot B?',
  ],
  es: [
    '¿Cómo encuentro mi asiento en el Sector 122?',
    '¿Dónde está la estación médica más cercana?',
    '¿Hay salidas accesibles para sillas de ruedas?',
    '¿A qué hora pasa el próximo autobús al Lote B?',
  ],
  fr: [
    'Comment trouver mon siège au Secteur 122?',
    'Où se trouve le poste médical le plus proche?',
    'Y a-t-il des sorties accessibles aux fauteuils?',
    'Quelle est l\'heure de la navette pour le Lot B?',
  ],
  pt: [
    'Como encontro meu assento no Setor 122?',
    'Onde fica o posto médico mais próximo?',
    'Existem saídas acessíveis para cadeiras de rodas?',
    'Qual é o horário do próximo ônibus para o Lote B?',
  ],
  hi: [
    'सेक्टर 122 में मेरी सीट कैसे मिलेगी?',
    'निकटतम चिकित्सा केंद्र कहाँ है?',
    'क्या यहाँ व्हीलचेयर सुलभ निकास हैं?',
    'लॉट बी के लिए अगली शटल का समय क्या है?',
  ],
};

export default function AIAssistant() {
  const [lang, setLang] = useState('en');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your FIFA 2026 AI Command Assistant. How can I help you navigate the stadium, view line queues, find transport hubs, or access support systems today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: lang,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language: lang }),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('API request failed or returned non-JSON format');
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error communicating with AI Assistant:', err);
      // Fallback response handled locally
      const fallbackReplies: Record<string, string> = {
        en: "I'm having trouble connecting to my central server right now, but standard operations are fully running. Restrooms are open at Sectors 104 and 122, and express shuttles depart every 3 minutes from Gate G.",
        es: "Tengo problemas para conectarme con el servidor, pero las operaciones continúan de forma normal. Los baños están abiertos en los sectores 104 y 122, y los autobuses exprés salen cada 3 minutos de la Puerta G.",
        fr: "Je rencontre des difficultés de connexion, mais le stade fonctionne normalement. Les toilettes sont ouvertes aux secteurs 104 et 122, et les navettes partent toutes les 3 minutes de la Porte G.",
        pt: "Estou com problemas para me conectar, mas o estádio está funcionando normalmente. Os banheiros estão abertos nos setores 104 e 122, e os ônibus expressos partem a cada 3 minutos do Portão G.",
        hi: "सर्वर से कनेक्ट करने में समस्या हो रही है, लेकिन सामान्य संचालन जारी है। सेक्टर 104 और 122 में शौचालय खुले हैं, और गेट जी से हर 3 मिनट में शटल सेवाएं चल रही हैं।",
      };
      
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: fallbackReplies[lang] || fallbackReplies['en'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value;
    setLang(selectedLang);
    
    // Add dynamic language update system greeting
    const updateGreetings: Record<string, string> = {
      en: 'System Language switched to English. How can I assist you?',
      es: 'Idioma del sistema cambiado a Español. ¿En qué puedo ayudarte?',
      fr: 'Langue du système changée en Français. Comment puis-je vous aider?',
      pt: 'Idioma do sistema alterado para Português. Como posso ajudar você?',
      hi: 'भाषा हिन्दी में बदल दी गई है। मैं आपकी क्या सहायता कर सकता हूँ?',
    };

    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: 'ai',
        text: updateGreetings[selectedLang],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  return (
    <div id="ai-assistant-card" className="flex flex-col h-[520px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Assistant Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-[#0F3D2E] to-[#071A12]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#66BB6A]/20 text-[#66BB6A] animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white tracking-wide">Stadium GenAI Co-Pilot</h3>
            <span className="text-xs text-[#66BB6A] flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#66BB6A]"></span> Gemini-2.5 Resilient Stack
            </span>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
          <Globe className="w-3.5 h-3.5 text-white/60" />
          <select
            aria-label="Select Assistant Language"
            value={lang}
            onChange={handleLanguageChange}
            className="text-xs bg-transparent text-white focus:outline-none cursor-pointer pr-1"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-[#071A12] text-white">
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-2.5 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`p-2 rounded-lg h-fit flex items-center justify-center ${
                m.sender === 'user' ? 'bg-[#2E7D32] text-white' : 'bg-white/10 text-white/90'
              }`}>
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3.5 rounded-2xl ${
                m.sender === 'user'
                  ? 'bg-gradient-to-br from-[#2E7D32] to-[#0F3D2E] text-white rounded-tr-none'
                  : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed">{m.text}</p>
                <span className="block mt-1 text-[10px] text-white/40 text-right">{m.timestamp}</span>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2.5"
            >
              <div className="p-2 rounded-lg bg-white/10 text-white/60">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex gap-1.5 bg-white/5 border border-white/10 p-3.5 px-4 rounded-2xl rounded-tl-none">
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Questions Slider */}
      <div className="px-4 py-2 bg-black/20 border-t border-white/10 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        <HelpCircle className="w-4 h-4 text-[#66BB6A] flex-shrink-0" />
        <span className="text-xs text-white/50 mr-1 flex-shrink-0">Quick Ask:</span>
        {PRESET_QUESTIONS[lang]?.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#66BB6A] hover:text-white transition duration-200"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="flex items-center gap-2 p-3 bg-[#071A12] border-t border-white/10"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Ask anything in ${LANGUAGES.find((l) => l.code === lang)?.name || 'English'}...`}
          className="flex-1 bg-white/5 border border-white/10 focus:border-[#66BB6A] rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-all duration-200"
          aria-label="Type your message to the FIFA Assistant"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="p-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#66BB6A] text-white disabled:opacity-40 disabled:cursor-not-allowed transition duration-200"
          aria-label="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
