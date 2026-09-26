import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import DigitalIDShowcase from './DigitalIDShowcase';
import { HangingIdCard } from '../lightswind/hanging-id-card';
import { useAgent } from '../../context/AgentContext';

export default function LandingHero() {
  const navigate = useNavigate();
  const { openAgent } = useAgent();
  const [glowOffset, setGlowOffset] = useState({ x: 0, y: 0 });
  const [showcaseMode, setShowcaseMode] = useState('hanging'); // 'hanging' | '3d'

  const handlePointerMove = (e) => {
    if (window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    setGlowOffset({ x: nx, y: ny });
  };

  const scrollToFeatures = (e) => {
    e.preventDefault();
    const el = document.querySelector('#features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="landing-hero-section" onPointerMove={handlePointerMove}>
      {/* Background Ambience: Faint Grid, Subtle Blue/Indigo Glow with Soft Parallax */}
      <div className="hero-grid-pattern"></div>
      <div
        className="hero-radial-glow-primary"
        style={{ transform: `translate3d(${glowOffset.x * 12}px, ${glowOffset.y * 12}px, 0)` }}
      ></div>
      <div
        className="hero-radial-glow-secondary"
        style={{ transform: `translate3d(${-glowOffset.x * 8}px, ${-glowOffset.y * 8}px, 0)` }}
      ></div>

      <div className="landing-container hero-inner-grid">
        {/* Left Column: Hero Text & CTAs */}
        <div className="hero-text-block">
          <div className="hero-announcement-pill">
            <span className="pill-dot"></span>
            <span className="pill-text">Smart Student Identity • Powered by AuntyID</span>
          </div>

          <h1 className="hero-headline">
            Your ID. <br />
            <span className="headline-gradient">Sorted by Aunty.</span>
          </h1>

          <p className="hero-lead-text">
            Create, customize, download and manage your digital college ID with the help of AuntyID — your friendly AI identity assistant.
          </p>

          <div className="hero-action-buttons">
            <button
              type="button"
              className="hero-primary-btn"
              onClick={() => navigate('/create')}
            >
              <span>Create Your ID</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="hero-secondary-btn"
              onClick={openAgent}
              title="Open AuntyID AI Assistant"
            >
              <Sparkles size={17} style={{ color: '#0284c7' }} />
              <span>Ask AuntyID</span>
            </button>
          </div>

          {/* Quick value signals */}
          <div className="hero-signals-row">
            <div className="signal-item">
              <CheckCircle2 size={16} className="signal-icon" />
              <span>Instant Generation</span>
            </div>
            <div className="signal-item">
              <CheckCircle2 size={16} className="signal-icon" />
              <span>Scannable Verification</span>
            </div>
            <div className="signal-item">
              <CheckCircle2 size={16} className="signal-icon" />
              <span>Zero Account Required</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive ID Showcase */}
        <div className="hero-showcase-block">
          <div className="hero-showcase-container">
            {/* Mode Switcher Tabs */}
            <div className="hero-showcase-switcher" role="tablist" aria-label="ID Showcase Modes">
              <button
                type="button"
                role="tab"
                aria-selected={showcaseMode === 'hanging'}
                className={`showcase-toggle-pill ${showcaseMode === 'hanging' ? 'active' : ''}`}
                onClick={() => setShowcaseMode('hanging')}
              >
                <span>🪢 Hanging Lanyard</span>
                <span className="pill-badge">Physics</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={showcaseMode === '3d'}
                className={`showcase-toggle-pill ${showcaseMode === '3d' ? 'active' : ''}`}
                onClick={() => setShowcaseMode('3d')}
              >
                <span>🔄 3D Hologram</span>
                <span className="pill-badge">360°</span>
              </button>
            </div>

            {/* Showcase Stage */}
            <div className="showcase-content-area">
              {showcaseMode === 'hanging' ? (
                <div className="hanging-card-hero-stage">
                  <HangingIdCard
                    name="Harshavardhan"
                    role="CSE • 4th Year"
                    badgeId="21B91A0582"
                    accentColor="#0284c7"
                    ropeLength={115}
                    ropeColor="#0f172a"
                  />
                </div>
              ) : (
                <DigitalIDShowcase />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
