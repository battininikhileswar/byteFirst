import React from 'react';
import { ShieldCheck, QrCode, Lock, CheckCircle2, ScanLine } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function SecuritySection() {
  const securityPoints = [
    {
      title: 'Scannable Standard Format',
      description: 'Encodes student credentials into high-density 2D barcodes readable by any standard optical scanner or smartphone camera.'
    },
    {
      title: 'Instant Offline Validation',
      description: 'Embedded identity payloads enable verification officers to check authenticity without requiring server calls or internet access.'
    },
    {
      title: 'Tamper-Evident Layout',
      description: 'Accredited university headers, security watermark ribbons, and authorized registrar signatory fields make unauthorized alteration easily detectable.'
    }
  ];

  return (
    <section id="security" className="security-section">
      <div className="landing-container">
        <div className="security-inner-grid">
          
          {/* Left Column: Security Narrative */}
          <div className="security-narrative">
            <span className="section-eyebrow">VERIFICATION & TRUST</span>
            <h2 className="security-headline">Identity that can be verified.</h2>
            <p className="security-main-paragraph">
              Every AuntyID can contain a unique verification code, making identity information easier to validate.
            </p>

            <div className="security-points-stack">
              {securityPoints.map((point, index) => (
                <div key={index} className="security-point-item">
                  <div className="point-icon-wrapper">
                    <CheckCircle2 size={18} className="point-icon" />
                  </div>
                  <div>
                    <h3 className="point-title">{point.title}</h3>
                    <p className="point-desc">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Stylized Verification & QR Visualization */}
          <div className="security-visual-block">
            <div className="stylized-scanner-card">
              
              {/* Corner Targets */}
              <div className="scanner-corner corner-tl"></div>
              <div className="scanner-corner corner-tr"></div>
              <div className="scanner-corner corner-bl"></div>
              <div className="scanner-corner corner-br"></div>

              {/* Scanning Ray Line */}
              <div className="scanner-laser-beam"></div>

              {/* Central Stylized QR Frame */}
              <div className="scanner-qr-plate">
                <QRCodeSVG
                  value="https://auntyid.app/verify/AID-2026-AUTHENTIC"
                  size={180}
                  level="Q"
                  bgColor="#ffffff"
                  fgColor="#0284c7"
                  includeMargin={true}
                />
              </div>

              {/* Realistic Verification Overlay Badge */}
              <div className="scanner-verification-pill">
                <ShieldCheck size={16} className="pill-check-icon" />
                <div className="pill-text-col">
                  <span className="pill-title">STUDENT CREDENTIAL VALIDATED</span>
                  <span className="pill-sub">ENROLLMENT STATUS: ACTIVE</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
