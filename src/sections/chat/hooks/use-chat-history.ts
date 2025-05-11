import { useState, useEffect } from 'react';

import { IChatMessage } from 'src/types/chat';

const STORAGE_KEY = 'chat_history';

interface ChatHistory {
  [chatId: string]: IChatMessage[];
}

export function useChatHistory(chatId: string) {
  const [messages, setMessages] = useState<IChatMessage[]>([]);

  // Load messages from localStorage when chatId changes
  useEffect(() => {
    if (!chatId) return;

    const storedHistory = localStorage.getItem(STORAGE_KEY);
    if (storedHistory) {
      const history: ChatHistory = JSON.parse(storedHistory);
      setMessages(history[chatId] || []);
    }
  }, [chatId]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (!chatId || messages.length === 0) return;

    const storedHistory = localStorage.getItem(STORAGE_KEY);
    const history: ChatHistory = storedHistory ? JSON.parse(storedHistory) : {};

    history[chatId] = messages;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [chatId, messages]);

  const addMessage = (message: IChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const addMessages = (newMessages: IChatMessage[]) => {
    setMessages((prev) => [...prev, ...newMessages]);
  };

  const clearHistory = () => {
    setMessages([]);
    const storedHistory = localStorage.getItem(STORAGE_KEY);
    if (storedHistory) {
      const history: ChatHistory = JSON.parse(storedHistory);
      delete history[chatId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  };

  return {
    messages,
    addMessage,
    addMessages,
    clearHistory,
  };
}
