import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';

export default function ChatButton() {
  const { isOpen, toggleChat } = useAssistant();

  if (isOpen) return null; // Hide button when chat window is open

  return (
    <button
      type="button"
      className="chat-floating-button"
      onClick={toggleChat}
      aria-label="Open AuntyID Assistant"
      aria-expanded={isOpen}
      title="Open AuntyID Assistant"
    >
      <Sparkles size={16} className="chat-btn-sparkle" />
      <span>AuntyID</span>
      <span className="chat-btn-pulse-dot" aria-hidden="true"></span>
    </button>
  );
}
