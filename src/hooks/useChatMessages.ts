/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';

const FALLBACK_REPLIES: Record<string, string> = {
  en: "I'm having trouble connecting to my central server right now, but standard operations are fully running. Restrooms are open at Sectors 104 and 122, and express shuttles depart every 3 minutes from Gate G.",
  es: "Tengo problemas para conectarme con el servidor, pero las operaciones continúan de forma normal. Los baños están abiertos en los sectores 104 y 122, y los autobuses exprés salen cada 3 minutos de la Puerta G.",
  fr: "Je rencontre des difficultés de connexion, mais le stade fonctionne normalement. Les toilettes sont ouvertes aux secteurs 104 et 122, et les navettes partent toutes les 3 minutes de la Porte G.",
  pt: "Estou com problemas para me conectar, mas o estádio está funcionando normalmente. Os banheiros estão abertos nos setores 104 e 122, e os ônibus expressos partem a cada 3 minutos do Portão G.",
  hi: 'सर्वर से कनेक्ट करने में समस्या हो रही है, लेकिन सामान्य संचालन जारी है। सेक्टर 104 और 122 में शौचालय खुले हैं, और गेट जी से हर 3 मिनट में शटल सेवाएं चल रही हैं।',
} as const;

export function useChatMessages(defaultLanguage: string = 'en') {
  const [language, setLanguage] = useState(defaultLanguage);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your FIFA 2026 AI Command Assistant. How can I help you navigate the stadium, view line queues, find transport hubs, or access support systems today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const userKey = localStorage.getItem('user_gemini_api_key');
      if (userKey) headers['x-gemini-api-key'] = userKey;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, language }),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: FALLBACK_REPLIES[language] || FALLBACK_REPLIES.en,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [language]);

  const addSystemMessage = useCallback((text: string) => {
    const systemMessage: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'ai',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, systemMessage]);
  }, []);

  return {
    language,
    setLanguage,
    messages,
    isTyping,
    messagesEndRef,
    sendMessage,
    addSystemMessage,
  };
}
