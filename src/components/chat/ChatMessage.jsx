import React from 'react';
import { ArrowRight, ChevronRight, Download, Printer, Edit3, Compass } from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';

export default function ChatMessage({ message }) {
  const { executeAction } = useAssistant();
  const isUser = message.sender === 'user';

  // Helper to format basic markdown-like bold and bullet lists
  const formatText = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      // Check for bullet list item
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      // Parse **bold** parts
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const renderedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={pIdx} style={{ background: 'rgba(0,0,0,0.06)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{part.slice(1, -1)}</code>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.4rem', margin: '0.2rem 0' }}>
            <span>•</span>
            <div>{renderedLine}</div>
          </div>
        );
      }

      return line.trim() === '' ? (
        <div key={idx} style={{ height: '0.35rem' }} />
      ) : (
        <p key={idx} style={{ margin: '0 0 0.35rem 0' }}>
          {renderedLine}
        </p>
      );
    });
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'navigate_to_create':
        return <ArrowRight size={12} />;
      case 'show_download_help':
        return <Download size={12} />;
      case 'show_print_help':
        return <Printer size={12} />;
      case 'scroll_to_form':
        return <Edit3 size={12} />;
      default:
        return <ChevronRight size={12} />;
    }
  };

  return (
    <div className={`chat-message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className="chat-message-bubble">
        {formatText(message.text)}
      </div>

      {/* Render Structured Action Buttons if provided */}
      {!isUser && message.actions && message.actions.length > 0 && (
        <div className="chat-message-actions">
          {message.actions.map((act, aIdx) => (
            <button
              key={aIdx}
              type="button"
              className="chat-action-btn"
              onClick={() => executeAction(act.type)}
            >
              <span>{act.label}</span>
              {getActionIcon(act.type)}
            </button>
          ))}
        </div>
      )}

      <span className="chat-message-time">{message.timestamp}</span>
    </div>
  );
}
