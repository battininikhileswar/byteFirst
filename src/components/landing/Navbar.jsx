import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="landing-nav-inner">
        {/* Brand */}
        <Link to="/" className="landing-brand">
          <div className="landing-logo-box">
            <CreditCard size={20} className="logo-svg" />
          </div>
          <span className="landing-brand-name">
            Aunty<span className="brand-dot">ID</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="landing-desktop-links" aria-label="Main navigation">
          <a href="#hero" onClick={(e) => scrollToSection(e, '#hero')} className="nav-item">
            Home
          </a>
          <a href="#features" onClick={(e) => scrollToSection(e, '#features')} className="nav-item">
            Features
          </a>
          <a href="#how-it-works" onClick={(e) => scrollToSection(e, '#how-it-works')} className="nav-item">
            How It Works
          </a>
          <a href="#security" onClick={(e) => scrollToSection(e, '#security')} className="nav-item">
            Security
          </a>
          <Link to="/editor" className="nav-item flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
            <span>Canvas Studio</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">New</span>
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="landing-nav-actions">
          {/* Dark / Light Mode Toggle Button beside Create Your ID */}
          <ThemeToggle />

          <button
            type="button"
            className="landing-btn-cta nav-cta-desktop"
            onClick={() => navigate('/create')}
          >
            <span>Create Your ID</span>
            <ArrowRight size={15} />
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="landing-mobile-drawer">
          <nav className="mobile-nav-items">
            <a href="#hero" onClick={(e) => scrollToSection(e, '#hero')} className="mobile-link">
              Home
            </a>
            <a href="#features" onClick={(e) => scrollToSection(e, '#features')} className="mobile-link">
              Features
            </a>
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, '#how-it-works')} className="mobile-link">
              How It Works
            </a>
            <a href="#security" onClick={(e) => scrollToSection(e, '#security')} className="mobile-link">
              Security
            </a>
            <Link to="/editor" className="mobile-link font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
              <span>Canvas Studio Designer</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">NEW</span>
            </Link>

            <div className="mobile-theme-row">
              <span className="mobile-theme-label">Theme Mode</span>
              <ThemeToggle />
            </div>

            <button
              type="button"
              className="landing-btn-cta mobile-cta"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/create');
              }}
            >
              <span>Create Your ID</span>
              <ArrowRight size={15} />
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
