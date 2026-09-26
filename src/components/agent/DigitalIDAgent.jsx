import React from 'react';
import AgentButton from './AgentButton';
import AgentWindow from './AgentWindow';
import { useAgent } from '../../context/AgentContext';
import './Agent.css';

export default function DigitalIDAgent() {
  const { isOpen, closeAgent } = useAgent();

  return (
    <>
      <AgentButton />

      {isOpen && (
        <>
          <div
            className="agent-mobile-backdrop"
            onClick={closeAgent}
            aria-hidden="true"
          />
          <AgentWindow />
        </>
      )}
    </>
  );
}
