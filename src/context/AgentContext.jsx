import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sendAgentQuery } from '../services/agent/agentClient';

const AgentContext = createContext(null);

const STORAGE_KEY = 'auntyid_agent_history';

const INITIAL_AGENT_MESSAGE = {
  id: 'welcome-aunty-msg',
  sender: 'agent',
  text: "Hi! I'm AuntyID 👋\nTell me what you need and I'll help you get it done.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  actionStatuses: [],
  actions: [],
  suggestedFollowups: [
    "Create My ID",
    "Fill My Details",
    "Customize My ID",
    "Download My ID",
    "Print My ID"
  ]
};

export function AgentProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentActionStatus, setCurrentActionStatus] = useState(null);

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

  // Registry of real application action handlers (Single Source of Truth)
  const actionHandlersRef = useRef({});

  const registerHandlers = useCallback((handlers) => {
    actionHandlersRef.current = {
      ...actionHandlersRef.current,
      ...handlers
    };
  }, []);

  const unregisterHandlers = useCallback(() => {
    actionHandlersRef.current = {};
  }, []);

  // Load chat history from sessionStorage
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [INITIAL_AGENT_MESSAGE];
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (_) {}
  }, [messages]);

  const toggleAgent = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const openAgent = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeAgent = useCallback(() => {
    setIsOpen(false);
  }, []);

  const updateSafeContext = useCallback((newContext) => {
    setSafeContext((prev) => ({
      ...prev,
      ...newContext
    }));
  }, []);

  const clearChat = useCallback(() => {
    setMessages([INITIAL_AGENT_MESSAGE]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }, []);

  // Execute a single safe application tool/action
  const executeAction = useCallback(async (action) => {
    if (!action || !action.type) return { success: false, error: 'Empty action' };

    const { type, data = {} } = action;
    const handlers = actionHandlersRef.current;

    switch (type) {
      case 'navigate_to_create': {
        if (location.pathname !== '/create') {
          navigate('/create');
          await new Promise((r) => setTimeout(r, 300));
        }
        return { success: true };
      }

      case 'navigate_home': {
        if (location.pathname !== '/') {
          navigate('/');
        }
        return { success: true };
      }

      case 'toggle_auto_rotate': {
        const enabled = data.enabled !== false;
        window.dispatchEvent(new CustomEvent('digitalid:toggle-auto-rotate', { detail: { enabled } }));
        return { success: true, enabled };
      }

      case 'fill_student_form': {
        if (location.pathname !== '/create') {
          navigate('/create');
          await new Promise((r) => setTimeout(r, 300));
        }
        if (actionHandlersRef.current.fillStudentForm) {
          return actionHandlersRef.current.fillStudentForm(data);
        }
        return { success: false, error: 'Form handler not ready' };
      }

      case 'update_student_field': {
        if (handlers.updateStudentField) {
          return handlers.updateStudentField(data.field, data.value);
        }
        return { success: false };
      }

      case 'validate_student_form': {
        if (handlers.validateStudentForm) {
          return handlers.validateStudentForm();
        }
        return { success: true };
      }

      case 'set_id_theme': {
        if (handlers.setIdTheme) {
          return handlers.setIdTheme(data.themeName);
        }
        return { success: false };
      }

      case 'flip_id_card': {
        if (handlers.flipIdCard) {
          return handlers.flipIdCard();
        }
        return { success: false };
      }

      case 'generate_id': {
        if (location.pathname !== '/create') {
          navigate('/create');
          await new Promise((r) => setTimeout(r, 300));
        }
        if (actionHandlersRef.current.generateId) {
          return actionHandlersRef.current.generateId();
        }
        return { success: false };
      }

      case 'download_id': {
        if (location.pathname !== '/create') {
          navigate('/create');
          await new Promise((r) => setTimeout(r, 300));
        }
        if (actionHandlersRef.current.downloadId) {
          return await actionHandlersRef.current.downloadId();
        }
        return { success: false, error: 'Download handler not mounted' };
      }

      case 'print_id': {
        if (location.pathname !== '/create') {
          navigate('/create');
          await new Promise((r) => setTimeout(r, 300));
        }
        if (actionHandlersRef.current.printId) {
          return actionHandlersRef.current.printId();
        }
        return { success: false };
      }

      case 'reset_form': {
        if (handlers.resetForm) {
          return handlers.resetForm();
        }
        return { success: false };
      }

      default:
        console.info('[AgentAction] Unrecognized action type:', type);
        return { success: false, error: 'Unknown action' };
    }
  }, [navigate, location.pathname]);

  // Main task execution pipeline
  const sendAgentMessage = useCallback(async (userText) => {
    if (!userText || !userText.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsProcessing(true);
    setCurrentActionStatus("AuntyID is thinking...");

    try {
      // 1. Query Gemini agent backend
      const response = await sendAgentQuery(nextMessages, safeContext);

      // 2. Sequential Tool / Action Execution
      const executedStatuses = [...(response.actionStatuses || [])];

      if (Array.isArray(response.actions) && response.actions.length > 0) {
        for (const action of response.actions) {
          if (action.type === 'fill_student_form') {
            setCurrentActionStatus("AuntyID is checking your details...");
          } else if (action.type === 'generate_id') {
            setCurrentActionStatus("Generating your ID...");
          } else if (action.type === 'download_id') {
            setCurrentActionStatus("AuntyID is preparing your ID...");
          } else if (action.type === 'print_id') {
            setCurrentActionStatus("Printing it now...");
          } else {
            setCurrentActionStatus("Almost there...");
          }

          try {
            await executeAction(action);
            await new Promise((r) => setTimeout(r, 200)); // Smooth micro-delay for visual feedback
          } catch (actErr) {
            console.warn(`Action ${action.type} failed:`, actErr);
            executedStatuses.push("Hmm, that didn't work. Let's try that again.");
          }
        }
      }

      setCurrentActionStatus(null);

      // 3. Append Agent Response with tool feedback
      const agentMsg = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionStatuses: executedStatuses,
        actions: response.actions || [],
        suggestedFollowups: response.suggestedFollowups || []
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error('[AuntyID Error]:', err);
      setCurrentActionStatus(null);

      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'agent',
        text: "AuntyID is taking a short break 😅\n\nYou can still create your ID manually using the form.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionStatuses: [],
        actions: [],
        suggestedFollowups: ["Create My ID", "Download ID", "Print ID"]
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
      setCurrentActionStatus(null);
    }
  }, [messages, safeContext, executeAction]);

  return (
    <AgentContext.Provider
      value={{
        isOpen,
        toggleAgent,
        openAgent,
        closeAgent,
        messages,
        isProcessing,
        currentActionStatus,
        safeContext,
        updateSafeContext,
        sendAgentMessage,
        executeAction,
        registerHandlers,
        unregisterHandlers,
        clearChat
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return ctx;
}
