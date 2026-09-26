import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, ArrowUpRight } from 'lucide-react';

export default function LandingFooter() {
  const navigate = useNavigate();

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="landing-footer">
      <div className="landing-container footer-layout">
        
        {/* Brand & Tagline */}
        <div className="footer-brand-segment">
          <Link to="/" className="landing-brand">
            <div className="landing-logo-box">
              <CreditCard size={20} className="logo-svg" />
            </div>
            <span className="landing-brand-name">
              Aunty<span className="brand-dot">ID</span>
            </span>
          </Link>
          <p className="footer-lead-tagline">
            AuntyID — Smart digital identity for students.
          </p>
          <p className="footer-sub-description">
            Empowering modern students and institutions with beautiful, verifiable digital credentials.
          </p>
        </div>

        {/* Footer Navigation Links */}
        <div className="footer-nav-segment">
          <h4 className="footer-heading">Platform</h4>
          <ul className="footer-links-list">
            <li>
              <a href="#hero" onClick={(e) => scrollToSection(e, '#hero')}>Home</a>
            </li>
            <li>
              <a href="#features" onClick={(e) => scrollToSection(e, '#features')}>Features</a>
            </li>
            <li>
              <a href="#how-it-works" onClick={(e) => scrollToSection(e, '#how-it-works')}>How It Works</a>
            </li>
            <li>
              <a href="#security" onClick={(e) => scrollToSection(e, '#security')}>Security</a>
            </li>
            <li>
              <button
                type="button"
                className="footer-nav-btn"
                onClick={() => navigate('/create')}
              >
                <span>Create ID</span>
                <ArrowUpRight size={13} />
              </button>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="landing-container footer-bottom-row">
        <div className="footer-copyright-text">
          <span>© {new Date().getFullYear()} AuntyID. All rights reserved.</span>
        </div>
        <div className="footer-bottom-badge">
          <span>Designed for modern academic identity</span>
        </div>
      </div>
    </footer>
  );
}
