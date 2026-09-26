import React from 'react';
import { Sparkles, X, RotateCcw, Compass, Edit3 } from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';

export default function ChatHeader() {
  const { closeChat, clearChat, safeContext } = useAssistant();
  const isCreatePage = safeContext.page === '/create';

  return (
    <>
      <div className="chat-header">
        <div className="chat-header-brand">
          <div className="chat-header-avatar">
            <Sparkles size={16} />
          </div>
          <div className="chat-header-title-box">
            <span className="chat-header-title">AuntyID</span>
            <span className="chat-header-status">
              <span className="chat-header-status-dot"></span>
              Online • Your digital ID helper
            </span>
          </div>
        </div>

        <div className="chat-header-actions">
          <button
            type="button"
            className="chat-header-icon-btn"
            onClick={clearChat}
            title="Clear chat history"
            aria-label="Clear chat history"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            className="chat-header-icon-btn"
            onClick={closeChat}
            title="Close Assistant"
            aria-label="Close Assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Context Awareness Banner */}
      <div className="chat-context-banner">
        <span>
          {isCreatePage ? "Active Context: ID Creator Studio" : "Active Context: Platform Overview"}
        </span>
        <span className="chat-context-badge">
          {isCreatePage ? <Edit3 size={11} /> : <Compass size={11} />}
          {isCreatePage ? "Form Helper" : "Overview"}
        </span>
      </div>
    </>
  );
}
