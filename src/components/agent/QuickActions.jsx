import React from 'react';
import { useAgent } from '../../context/AgentContext';

export default function QuickActions() {
  const { sendAgentMessage, isProcessing, safeContext } = useAgent();
  const isCreate = safeContext.page === '/create';

  const defaultChips = isCreate
    ? [
        "Fill My Details",
        "Customize My ID",
        "Flip ID Card",
        "Download My ID",
        "Print My ID"
      ]
    : [
        "Create My ID",
        "Fill My Details",
        "Customize My ID",
        "Download My ID",
        "Print My ID"
      ];

  return (
    <div className="agent-quick-actions-bar" aria-label="Quick Agent Actions">
      {defaultChips.map((chip, idx) => (
        <button
          key={idx}
          type="button"
          className="agent-quick-chip"
          onClick={() => sendAgentMessage(chip)}
          disabled={isProcessing}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
