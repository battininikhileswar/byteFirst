import React, { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import QuickActions from './QuickActions';
import ChatInput from './ChatInput';
import { useAssistant } from '../../context/AssistantContext';

export default function ChatWindow() {
  const { messages, isTyping } = useAssistant();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div
      className="chat-window-container"
      role="dialog"
      aria-modal="true"
      aria-label="DigitalID Assistant Conversation Window"
    >
      <ChatHeader />

      <div className="chat-messages-body">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <QuickActions />
      <ChatInput />
    </div>
  );
}
