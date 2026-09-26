import React from 'react';
import { useAssistant } from '../../context/AssistantContext';

const QUICK_PROMPTS = [
  "How do I create an ID?",
  "What information do I need?",
  "How does the QR code work?",
  "How do I download my ID?",
  "How do I print both sides?",
  "Something isn't working"
];

export default function QuickActions() {
  const { sendMessage, isTyping } = useAssistant();

  return (
    <div className="chat-quick-actions-bar" aria-label="Suggested questions">
      {QUICK_PROMPTS.map((prompt, idx) => (
        <button
          key={idx}
          type="button"
          className="chat-quick-chip"
          onClick={() => sendMessage(prompt)}
          disabled={isTyping}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
