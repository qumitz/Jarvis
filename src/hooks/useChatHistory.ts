import { useState, useEffect } from 'react';
import { Message } from '../types';

const STORAGE_KEY = 'jarvis_chat_history';

export function useChatHistory() {
  const [messages, setMessages] = useState<Message[]>([]);

  // Load on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
  }, []);

  // Save on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role,
      content,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const clearHistory = () => setMessages([]);

  return { messages, addMessage, clearHistory };
}
