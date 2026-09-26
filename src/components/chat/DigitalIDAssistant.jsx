import React from 'react';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';
import { useAssistant } from '../../context/AssistantContext';
import './Chat.css';

export default function DigitalIDAssistant() {
  const { isOpen, closeChat } = useAssistant();

  return (
    <>
      <ChatButton />

      {isOpen && (
        <>
          <div
            className="chat-mobile-backdrop"
            onClick={closeChat}
            aria-hidden="true"
          />
          <ChatWindow />
        </>
      )}
    </>
  );
}
