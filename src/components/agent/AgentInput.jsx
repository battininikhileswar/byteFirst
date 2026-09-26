import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

export default function AgentInput() {
  const [inputText, setInputText] = useState('');
  const { sendAgentMessage, isProcessing } = useAgent();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    sendAgentMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="agent-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="agent-input-field"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask AuntyID to fill, theme, flip, download..."
        disabled={isProcessing}
        aria-label="Ask AuntyID"
      />
      <button
        type="submit"
        className="agent-send-btn"
        disabled={!inputText.trim() || isProcessing}
        title="Send command to AuntyID"
        aria-label="Send command to AuntyID"
      >
        <Send size={15} />
      </button>
    </form>
  );
}
