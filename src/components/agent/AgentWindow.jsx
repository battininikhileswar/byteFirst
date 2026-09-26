import React, { useEffect, useRef } from 'react';
import AgentHeader from './AgentHeader';
import AgentMessage from './AgentMessage';
import AgentActionStatus from './AgentActionStatus';
import QuickActions from './QuickActions';
import AgentInput from './AgentInput';
import { useAgent } from '../../context/AgentContext';

export default function AgentWindow() {
  const { messages, isProcessing } = useAgent();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages or execution states change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  return (
    <div
      className="agent-window-container"
      role="dialog"
      aria-modal="true"
      aria-label="AuntyID Conversation Window"
    >
      <AgentHeader />

      <div className="agent-messages-body">
        {messages.map((msg) => (
          <AgentMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <AgentActionStatus />
      <QuickActions />
      <AgentInput />
    </div>
  );
}
