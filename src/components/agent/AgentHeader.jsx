import React from 'react';
import { Sparkles, X, RotateCcw, Compass, Edit3 } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

export default function AgentHeader() {
  const { closeAgent, clearChat, safeContext } = useAgent();
  const isCreatePage = safeContext.page === '/create';

  return (
    <>
      <div className="agent-header">
        <div className="agent-header-brand">
          <div className="agent-header-avatar">
            <Sparkles size={16} />
          </div>
          <div className="agent-header-title-box">
            <span className="agent-header-title">AuntyID</span>
            <span className="agent-header-status">
              <span className="agent-header-status-dot"></span>
              Online • Your digital ID helper
            </span>
          </div>
        </div>

        <div className="agent-header-actions">
          <button
            type="button"
            className="agent-header-icon-btn"
            onClick={clearChat}
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            className="agent-header-icon-btn"
            onClick={closeAgent}
            title="Close AuntyID"
            aria-label="Close AuntyID"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Real-time Context Awareness Banner */}
      <div className="agent-context-banner">
        <span>
          {isCreatePage ? "Active Context: ID Creator Studio" : "Active Context: Platform Overview"}
        </span>
        <span className="agent-context-badge">
          {isCreatePage ? <Edit3 size={11} /> : <Compass size={11} />}
          {isCreatePage ? "Card Studio" : "Hero Showcase"}
        </span>
      </div>
    </>
  );
}
