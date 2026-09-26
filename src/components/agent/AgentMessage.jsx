import React from 'react';
import { CheckCircle2, ChevronRight, Download, Printer, RotateCw, Sparkles, Compass, Edit3 } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

export default function AgentMessage({ message }) {
  const { executeAction, sendAgentMessage } = useAgent();
  const isUser = message.sender === 'user';

  // Helper to format basic markdown-like bold and bullet lists
  const formatText = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      // Parse **bold** parts
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const renderedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={pIdx}
              style={{
                background: 'rgba(0, 0, 0, 0.06)',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                fontSize: '0.9em'
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.4rem', margin: '0.2rem 0' }}>
            <span style={{ color: '#0284c7' }}>•</span>
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
      case 'download_id':
        return <Download size={12} />;
      case 'print_id':
        return <Printer size={12} />;
      case 'flip_id_card':
      case 'toggle_auto_rotate':
        return <RotateCw size={12} />;
      case 'navigate_to_create':
        return <Edit3 size={12} />;
      default:
        return <ChevronRight size={12} />;
    }
  };

  return (
    <div className={`agent-message-row ${isUser ? 'user' : 'agent'}`}>
      <div className="agent-message-bubble">
        {formatText(message.text)}

        {/* Real-time Tool Execution Logs */}
        {!isUser && Array.isArray(message.actionStatuses) && message.actionStatuses.length > 0 && (
          <div className="agent-action-statuses-box">
            {message.actionStatuses.map((status, sIdx) => (
              <div key={sIdx} className="agent-action-status-item">
                <CheckCircle2 size={13} style={{ flexShrink: 0 }} />
                <span>{status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Structured Follow-Up Action Buttons */}
      {!isUser && Array.isArray(message.suggestedFollowups) && message.suggestedFollowups.length > 0 && (
        <div className="agent-followups-row">
          {message.suggestedFollowups.map((followup, fIdx) => (
            <button
              key={fIdx}
              type="button"
              className="agent-action-btn"
              onClick={() => sendAgentMessage(followup)}
            >
              <span>{followup}</span>
              <ChevronRight size={11} />
            </button>
          ))}
        </div>
      )}

      <span className="agent-message-time">{message.timestamp}</span>
    </div>
  );
}
