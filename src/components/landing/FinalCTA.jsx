import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

export default function FinalCTA() {
  const navigate = useNavigate();
  const { openAgent } = useAgent();

  return (
    <section className="final-cta-section">
      <div className="landing-container">
        <div className="final-cta-card">
          <div className="cta-glow-ambient"></div>

          <div className="final-cta-content">
            <div className="cta-subtitle-pill">
              <Sparkles size={14} />
              <span>Get Started Now</span>
            </div>

            <h2 className="final-cta-heading">Ready to get your ID sorted by Aunty?</h2>
            <p className="final-cta-subheading">
              Generate your professional college ID in just a few steps with AuntyID.
            </p>

            <div className="final-cta-btn-wrap" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="final-cta-primary-btn"
                onClick={() => navigate('/create')}
              >
                <span>Create Your ID</span>
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                className="final-cta-secondary-btn"
                onClick={openAgent}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.75rem',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Sparkles size={16} />
                <span>Let AuntyID Handle It</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
