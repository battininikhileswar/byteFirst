import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

export default function AgentButton() {
  const { isOpen, toggleAgent } = useAgent();

  if (isOpen) return null; // Hidden while window is active

  return (
    <button
      type="button"
      className="agent-floating-button"
      onClick={toggleAgent}
      aria-label="Open AuntyID Assistant"
      aria-expanded={isOpen}
      title="Open AuntyID Assistant"
    >
      <Sparkles size={16} className="agent-btn-sparkle" />
      <span>AuntyID</span>
      <span className="agent-btn-pulse-dot" aria-hidden="true"></span>
    </button>
  );
}
