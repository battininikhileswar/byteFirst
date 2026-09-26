import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';

export default function ChatInput() {
  const [inputText, setInputText] = useState('');
  const { sendMessage, isTyping } = useAssistant();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chat-input-field"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask AuntyID to help create your ID..."
        disabled={isTyping}
        aria-label="Ask AuntyID"
      />
      <button
        type="submit"
        className="chat-send-btn"
        disabled={!inputText.trim() || isTyping}
        title="Send message"
        aria-label="Send message"
      >
        <Send size={15} />
      </button>
    </form>
  );
}
