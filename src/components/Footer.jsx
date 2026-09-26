import React from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function Footer() {
  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer-container">
      <div className="section-container footer-content">
        
        {/* Top brand & enterprise overview */}
        <div className="footer-top-grid">
          
          <div className="footer-brand-col">
            <div className="footer-brand-title">
              <div className="logo-icon-wrap">
                <CreditCard size={20} />
              </div>
              <span className="brand-text">
                Aunty<span className="brand-accent">ID</span>
              </span>
            </div>
            <p className="footer-tagline">
              Enterprise-grade digital identity and campus credential platform empowering universities, technical institutes, and academic institutions worldwide.
            </p>
            <div className="footer-badge-pill">
              <ShieldCheck size={13} />
              <span>Institutional Identity Engine</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-link-list">
              <li><button type="button" onClick={() => scrollTo('#home')}>Home</button></li>
              <li><button type="button" onClick={() => scrollTo('#features')}>Features</button></li>
              <li><button type="button" onClick={() => scrollTo('#how-it-works')}>How It Works</button></li>
              <li><button type="button" onClick={() => scrollTo('#generator')}>ID Studio</button></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Security & Standards</h4>
            <ul className="footer-concepts-list">
              <li>
                <span className="concept-tag">ISO/IEC 7810 Compliance</span>
                <span className="concept-desc">Standard CR80 identity specifications & proportions</span>
              </li>
              <li>
                <span className="concept-tag">Cryptographic QR Verification</span>
                <span className="concept-desc">Instant offline and online student credential validation</span>
              </li>
              <li>
                <span className="concept-tag">High-Resolution Vector Export</span>
                <span className="concept-desc">300 DPI print-ready production outputs</span>
              </li>
              <li>
                <span className="concept-tag">Privacy by Design</span>
                <span className="concept-desc">Client-side generation with zero unencrypted data storage</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom-bar">
          <div className="footer-copy">
            <span>© {new Date().getFullYear()} AuntyID Systems Inc. All rights reserved. • Trusted by Academic Institutions</span>
          </div>

          <div className="footer-stack-info">
            <Lock size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            <span>ISO 27001 & SOC-2 Aligned Security Standards</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
