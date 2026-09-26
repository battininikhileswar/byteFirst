import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sendChatMessage } from '../services/ai/chatService';

const AssistantContext = createContext(null);

const STORAGE_KEY = 'auntyid_chat_history';

const INITIAL_MESSAGE = {
  id: 'welcome-msg',
  sender: 'assistant',
  text: "Hi! I'm AuntyID 👋 Tell me what you need and I'll help you get it done.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  actions: [
    { label: "Create My ID", type: "navigate_to_create" },
    { label: "Fill My Details", type: "navigate_to_create" },
    { label: "How do I print both sides?", type: "show_print_help" }
  ]
};

export function AssistantProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Safe UI state (never contains sensitive student credentials)
  const [safeContext, setSafeContext] = useState({
    page: location.pathname,
    requiredFieldsCompleted: 0,
    totalRequiredFields: 6,
    photoUploaded: false,
    selectedTheme: 'Modern Sky',
    cardOrientation: 'vertical',
    hasValidationErrors: false,
    isGenerated: false
  });

  // Track active page route changes
  useEffect(() => {
    setSafeContext((prev) => ({
      ...prev,
      page: location.pathname
    }));
  }, [location.pathname]);

  // Load chat history from sessionStorage if available
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [INITIAL_MESSAGE];
  });

  // Persist messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (_) {}
  }, [messages]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const updateSafeContext = useCallback((newContext) => {
    setSafeContext((prev) => ({
      ...prev,
      ...newContext
    }));
  }, []);

  const clearChat = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }, []);

  // Safe structured agent action executor
  const executeAction = useCallback((actionType) => {
    if (!actionType) return;

    switch (actionType) {
      case 'navigate_to_create':
        navigate('/create');
        break;

      case 'scroll_to_features':
        if (location.pathname !== '/') {
          navigate('/#features');
        } else {
          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        }
        break;

      case 'scroll_to_how_it_works':
        if (location.pathname !== '/') {
          navigate('/#how-it-works');
        } else {
          document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
        }
        break;

      case 'scroll_to_security':
        if (location.pathname !== '/') {
          navigate('/#security');
        } else {
          document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' });
        }
        break;

      case 'scroll_to_form':
        if (location.pathname !== '/create') {
          navigate('/create');
        } else {
          const formEl = document.querySelector('.student-form-card') || document.querySelector('form');
          formEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        break;

      case 'ask_required_fields':
        sendMessage("What fields are required?");
        break;

      case 'show_download_help':
        sendMessage("How do I download my ID?");
        break;

      case 'show_print_help':
        sendMessage("How do I print both sides?");
        break;

      default:
        console.info('[AssistantAction] Unhandled action type:', actionType);
    }
  }, [navigate, location.pathname]);

  // Send user message and query AI service
  const sendMessage = useCallback(async (userText) => {
    if (!userText || !userText.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsTyping(true);

    try {
      const response = await sendChatMessage(nextMessages, safeContext);
      const assistantMsg = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: response.actions || []
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "DigitalID Assistant is temporarily unavailable.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: "How to Create an ID", type: "navigate_to_create" },
          { label: "Download Help", type: "show_download_help" },
          { label: "Print Help", type: "show_print_help" }
        ]
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, safeContext]);

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        toggleChat,
        openChat,
        closeChat,
        messages,
        isTyping,
        safeContext,
        updateSafeContext,
        sendMessage,
        executeAction,
        clearChat
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return ctx;
}
