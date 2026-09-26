import React from 'react';
import { useAgent } from '../../context/AgentContext';

export default function AgentActionStatus() {
  const { isProcessing, currentActionStatus } = useAgent();

  if (!isProcessing && !currentActionStatus) return null;

  return (
    <div className="agent-executing-banner" role="status" aria-live="polite">
      <div className="agent-spinner" aria-hidden="true" />
      <span>{currentActionStatus || "AuntyID is thinking..."}</span>
    </div>
  );
}
