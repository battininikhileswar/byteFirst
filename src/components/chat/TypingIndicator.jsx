import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="chat-typing-container" role="status" aria-label="AuntyID is thinking">
      <span>AuntyID</span>
      <span className="chat-typing-dot"></span>
      <span className="chat-typing-dot"></span>
      <span className="chat-typing-dot"></span>
    </div>
  );
}
