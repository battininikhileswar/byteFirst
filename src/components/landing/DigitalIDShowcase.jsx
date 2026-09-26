import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CreditCard, ShieldCheck, QrCode, RotateCw, Pause, Play, MapPin, Phone, Calendar, Heart } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function DigitalIDShowcase() {
  const [rotY, setRotY] = useState(0);
  const [rotX, setRotX] = useState(0);
  const [osc, setOsc] = useState({ x: 0, y: 0 });
  const [hoverTilt, setHoverTilt] = useState({ x: 0, y: 0 });
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 30 });

  const stageRef = useRef(null);
  const autoTimeRef = useRef(0);
  const pointerDownRef = useRef(null);
  const settleTimeoutRef = useRef(null);

  // Determine which side is facing the user (for controls and cues)
  const normalizedY = ((Math.round(rotY) % 360) + 360) % 360;
  const isBackSide = (normalizedY > 90 && normalizedY < 270) || (Math.abs(Math.round(rotY / 180)) % 2 !== 0);

  // 1. Continuous smooth 360-degree auto-rotation (~10s per full 360 deg cycle)
  useEffect(() => {
    if (!isAutoRotating || isDragging || isSettling) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let animId;
    let lastTime = performance.now();

    const loop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // 36 deg/s = 360 deg every 10 seconds (slow, elegant, readable)
      setRotY((prev) => (prev + delta * 36) % 360);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isAutoRotating, isDragging, isSettling]);

  // Global / Agent listener for auto-rotation control
  useEffect(() => {
    const handleToggle = (e) => {
      if (typeof e.detail?.enabled === 'boolean') {
        setIsAutoRotating(e.detail.enabled);
      } else {
        setIsAutoRotating((prev) => !prev);
      }
    };
    window.addEventListener('digitalid:toggle-auto-rotate', handleToggle);
    return () => window.removeEventListener('digitalid:toggle-auto-rotate', handleToggle);
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    };
  }, []);

  // 2. Flip 180 degrees between front and back
  const flipToOppositeSide = useCallback(() => {
    if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);

    const norm = ((Math.round(rotY) % 360) + 360) % 360;
    const currentlyBack = (norm > 90 && norm < 270) || (Math.abs(Math.round(rotY / 180)) % 2 !== 0);

    // Calculate target angle to reach opposite side
    const target = currentlyBack
      ? Math.round(rotY / 360) * 360
      : Math.floor(rotY / 360) * 360 + 180;

    setIsSettling(true);
    setRotY(target);
    setRotX(0);
    setHoverTilt({ x: 0, y: 0 });
    setOsc({ x: 0, y: 0 });
    autoTimeRef.current = 0;

    settleTimeoutRef.current = setTimeout(() => {
      setIsSettling(false);
    }, 550);
  }, [rotY]);

  // 3. Pointer Drag and Click Detection
  const handlePointerDown = (e) => {
    if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    pointerDownRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRotY: rotY,
      startRotX: rotX,
      startTime: Date.now(),
      hasMoved: false
    };

    setIsSettling(false);
  };

  const handlePointerMove = (e) => {
    if (pointerDownRef.current) {
      // User is holding pointer down
      const dx = e.clientX - pointerDownRef.current.startX;
      const dy = e.clientY - pointerDownRef.current.startY;
      const dist = Math.hypot(dx, dy);

      if (dist > 6) {
        if (!pointerDownRef.current.hasMoved) {
          pointerDownRef.current.hasMoved = true;
          setIsDragging(true);
        }

        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
        const factorY = isMobile ? 0.55 : 0.7;
        const factorX = isMobile ? 0.25 : 0.35;

        const nextRotY = pointerDownRef.current.startRotY + dx * factorY;
        const nextRotX = Math.max(-22, Math.min(22, pointerDownRef.current.startRotX - dy * factorX));

        setRotY(nextRotY);
        setRotX(nextRotX);

        setGlarePos({
          x: Math.min(100, Math.max(0, 50 + (dx * 0.15))),
          y: Math.min(100, Math.max(0, 30 + (dy * 0.15)))
        });
      }
    } else {
      // User is hovering with pointer (Desktop mouse)
      if (typeof window !== 'undefined' && (window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
      if (!stageRef.current) return;

      const rect = stageRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

      // Subtle hover tilt (approx -7 to +7 deg)
      setHoverTilt({
        y: isBackSide ? -nx * 14 : nx * 14,
        x: -ny * 8
      });

      setGlarePos({
        x: Math.min(100, Math.max(0, 50 + nx * 50)),
        y: Math.min(100, Math.max(0, 30 + ny * 50))
      });
    }
  };

  const handlePointerUp = (e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    if (pointerDownRef.current) {
      const { hasMoved } = pointerDownRef.current;
      pointerDownRef.current = null;

      if (!hasMoved) {
        // Treat as direct CLICK / TAP on card -> FLIP front <-> back
        flipToOppositeSide();
      } else {
        // User dragged card -> Settle smoothly to nearest natural orientation (0 or 180 deg)
        setIsDragging(false);
        setIsSettling(true);

        const nearest180 = Math.round(rotY / 180) * 180;
        setRotY(nearest180);
        setRotX(0);
        setHoverTilt({ x: 0, y: 0 });
        setOsc({ x: 0, y: 0 });
        autoTimeRef.current = 0;

        settleTimeoutRef.current = setTimeout(() => {
          setIsSettling(false);
        }, 550);
      }
    }
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setHoverTilt({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 30 });
    if (pointerDownRef.current) {
      handlePointerUp({ currentTarget: stageRef.current });
    }
  };

  const toggleAutoRotate = () => {
    setIsAutoRotating((prev) => !prev);
  };

  // Combine rot + dynamic hover
  const effectiveRotY = rotY + (isDragging || isSettling ? 0 : isHovered ? hoverTilt.y : 0);
  const effectiveRotX = rotX + (isDragging || isSettling ? 0 : isHovered ? hoverTilt.x : 0);

  // Multi-layered depth parallax for floating peripheral elements
  const currentTiltY = isHovered ? hoverTilt.y : 0;
  const currentTiltX = isHovered ? hoverTilt.x : 0;
  const badge1Parallax = `translate3d(${currentTiltY * 1.2}px, ${-currentTiltX * 1.2}px, 0)`;
  const badge2Parallax = `translate3d(${-currentTiltY * 0.9}px, ${currentTiltX * 0.9}px, 0)`;
  const badge3Parallax = `translate3d(${currentTiltY * 0.7}px, ${currentTiltX * 0.7}px, 0)`;

  return (
    <div className="showcase-3d-stage-wrapper">
      <div
        ref={stageRef}
        className={`showcase-3d-stage ${isDragging ? 'is-dragging' : ''} ${isHovered ? 'is-hovered' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        role="region"
        aria-label="Interactive 3D AuntyID Card Preview. Drag to rotate in 3D, click to flip front and back."
      >
        {/* Subtle Ambient Sky Lighting with organic breath */}
        <div className="showcase-stage-ambient"></div>

        {/* Floating Peripheral Element 1: Realistic Student Credential Badge */}
        <div
          className="floating-badge-element badge-verification"
          style={{ transform: badge1Parallax }}
        >
          <div className="badge-icon-wrap">
            <ShieldCheck size={16} className="badge-check-icon" />
          </div>
          <div className="badge-info">
            <span className="badge-primary-text">Official Student Credential</span>
            <span className="badge-secondary-text">Status: Active Enrollment</span>
          </div>
        </div>

        {/* Floating Peripheral Element 2: Small Campus Meta Panel */}
        <div
          className="floating-badge-element badge-metadata"
          style={{ transform: badge2Parallax }}
        >
          <div className="meta-dot"></div>
          <div className="meta-text-col">
            <span className="meta-title">CAMPUS PRIVILEGES</span>
            <span className="meta-value">FULL LAB & LIBRARY ACCESS</span>
          </div>
        </div>

        {/* Floating Peripheral Element 3: Scannable Validation Box */}
        <div
          className="floating-badge-element badge-qr-quick"
          style={{ transform: badge3Parallax }}
        >
          <div className="qr-mini-frame">
            <QRCodeSVG
              value="https://digitalid.app/verify/DID-2026-001"
              size={40}
              level="L"
              bgColor="#ffffff"
              fgColor="#0369a1"
            />
          </div>
          <span className="qr-mini-tag">QUICK SCAN</span>
        </div>

        {/* Responsive Scale Wrapper ensuring flawless mobile fit */}
        <div className="showcase-card-scale-wrapper">
          {/* Floating Rig providing subtle, continuous up-down floating over 5 seconds */}
          <div className="showcase-floating-rig">
            {/* Soft Dynamic Drop Shadow */}
            <div className="showcase-card-shadow" aria-hidden="true"></div>

          {/* ========================================================
              3D CARD FLIPPER (Front and Back Faces with Smooth Tilt)
              ======================================================== */}
          <div
            className={`showcase-card-3d-flipper ${isDragging ? 'is-dragging' : ''} ${isSettling ? 'is-settling' : ''}`}
            style={{
              transform: `perspective(1200px) rotateY(${effectiveRotY}deg) rotateX(${effectiveRotX}deg)`,
              transition: (isDragging || isAutoRotating)
                ? 'none'
                : isSettling
                ? 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)'
                : isHovered
                ? 'transform 0.15s ease-out'
                : 'transform 0.2s ease-out'
            }}
          >
            {/* Dynamic Light Sheen Overlay */}
            <div
              className="card-glare-overlay"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)`
              }}
            ></div>

          {/* ====================================================
              1. CARD FRONT FACE
              ==================================================== */}
          <div className="showcase-card-face showcase-face-front">
            {/* Top Lanyard Slot */}
            <div className="card-top-slot">
              <span className="slot-pill"></span>
            </div>

            {/* Header */}
            <div className="showcase-card-header">
              <div className="header-brand-group">
                <div className="header-icon-box">
                  <CreditCard size={16} />
                </div>
                <div>
                  <div className="card-brand-title">DIGITAL UNIVERSITY</div>
                  <div className="card-brand-sub">INSTITUTE OF TECHNOLOGY</div>
                </div>
              </div>

              <div className="card-smart-chip">
                <div className="chip-micro-lines"></div>
              </div>
            </div>

            {/* Ribbon */}
            <div className="showcase-card-ribbon">
              <span className="ribbon-student-lbl">STUDENT IDENTITY CARD</span>
              <span className="ribbon-session">2026–2030</span>
            </div>

            {/* Body */}
            <div className="showcase-card-body">
              {/* Photo Box */}
              <div className="showcase-photo-col">
                <div className="showcase-photo-box">
                  <div className="photo-placeholder-graphic">
                    <span className="photo-initials">AM</span>
                    <div className="photo-corner-accent"></div>
                  </div>
                  <div className="photo-auth-badge">
                    <ShieldCheck size={11} />
                    <span>VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Information Column */}
              <div className="showcase-info-col">
                <div className="student-name-box">
                  <h3 className="student-name-text">ALEX MORGAN</h3>
                  <div className="student-id-pill">
                    <span className="id-label">ID:</span>
                    <span className="id-val">DID-2026-001</span>
                  </div>
                </div>

                <div className="student-details-matrix">
                  <div className="matrix-row">
                    <span className="matrix-lbl">MAJOR</span>
                    <span className="matrix-val">Computer Science</span>
                  </div>
                  <div className="matrix-row">
                    <span className="matrix-lbl">LEVEL</span>
                    <span className="matrix-val">3rd Year • Semester 6</span>
                  </div>
                  <div className="matrix-row">
                    <span className="matrix-lbl">ISSUER</span>
                    <span className="matrix-val">Academic Registrar Office</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="showcase-card-footer">
              <div className="footer-qr-container">
                <div className="footer-qr-box">
                  <QRCodeSVG
                    value="https://digitalid.app/verify/DID-2026-001"
                    size={46}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#0369a1"
                  />
                </div>
                <span className="qr-validate-lbl">SCAN TO VALIDATE</span>
              </div>

              <div className="footer-auth-container">
                <div className="auth-signature">Alex Morgan</div>
                <div className="auth-line"></div>
                <span className="auth-title">Authorized Registrar</span>
              </div>
            </div>

            <div className="showcase-holo-line"></div>
          </div>

          {/* ====================================================
              2. CARD BACK FACE (Seen when rotating around)
              ==================================================== */}
          <div className="showcase-card-face showcase-face-back">
            <div className="card-top-slot">
              <span className="slot-pill"></span>
            </div>

            <div className="showcase-card-header back-header">
              <div className="card-brand-title" style={{ textAlign: 'center', width: '100%', fontSize: '0.6875rem' }}>
                INSTITUTIONAL DIRECTIVES & EMERGENCY INFO
              </div>
            </div>

            <div className="showcase-card-body back-body">
              <div className="back-data-rows">
                <div className="back-data-item">
                  <Heart size={12} className="back-data-icon text-danger" />
                  <div>
                    <span className="back-data-label">Medical / Blood Group:</span>
                    <span className="back-data-value text-blood">BLOOD GRP: <strong>O+</strong></span>
                  </div>
                </div>

                <div className="back-data-item">
                  <MapPin size={12} className="back-data-icon" />
                  <div>
                    <span className="back-data-label">Campus Address:</span>
                    <span className="back-data-value">Tech Innovation Campus, Ridge Way</span>
                  </div>
                </div>

                <div className="back-data-item">
                  <Phone size={12} className="back-data-icon" />
                  <div>
                    <span className="back-data-label">Emergency Contact:</span>
                    <span className="back-data-value">+1 (800) 555-0199</span>
                  </div>
                </div>

                <div className="back-data-item">
                  <Calendar size={12} className="back-data-icon" />
                  <div>
                    <span className="back-data-label">Card Validity:</span>
                    <span className="back-data-value">Issued: Aug 2026 • Valid Thru: Jun 2030</span>
                  </div>
                </div>
              </div>

              {/* Exact Standard Institutional Terms */}
              <div className="back-guidelines-box">
                <span className="guidelines-caption">TERMS & CONDITIONS</span>
                <ol className="guidelines-ordered">
                  <li>Non-transferable and remains property of Digital University.</li>
                  <li>Report loss immediately to Academic Registrar.</li>
                  <li>Mandatory for campus, library, and lab entry.</li>
                </ol>
              </div>

              {/* Barcode representation */}
              <div className="back-barcode-box">
                <div className="barcode-bars">
                  <div className="bar b-thick"></div>
                  <div className="bar b-thin"></div>
                  <div className="bar b-med"></div>
                  <div className="bar b-thick"></div>
                  <div className="bar b-thin"></div>
                  <div className="bar b-med"></div>
                  <div className="bar b-thick"></div>
                  <div className="bar b-thin"></div>
                  <div className="bar b-thick"></div>
                  <div className="bar b-med"></div>
                  <div className="bar b-thin"></div>
                  <div className="bar b-thick"></div>
                  <div className="bar b-thin"></div>
                  <div className="bar b-thick"></div>
                  <div className="bar b-med"></div>
                </div>
                <span className="barcode-code-text">*DID-2026-001*</span>
              </div>
            </div>

            <div className="showcase-holo-line"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

      {/* Interactive 3D Controls Bar */}
      <div className="showcase-controls-bar">
        <button
          type="button"
          className="ctrl-pill-btn"
          onClick={flipToOppositeSide}
          title={isBackSide ? "Flip to view front side" : "Flip to view back side"}
        >
          <RotateCw size={13} className={isBackSide ? "rotate-flipped" : ""} />
          <span>{isBackSide ? 'View Front Side' : 'View Back Side'}</span>
        </button>

        <button
          type="button"
          className="ctrl-pill-btn"
          onClick={toggleAutoRotate}
          title={isAutoRotating ? 'Turn off auto-rotation' : 'Turn on auto-rotation'}
        >
          {isAutoRotating ? <Pause size={13} /> : <Play size={13} />}
          <span>{isAutoRotating ? 'Auto-Rotate ON' : 'Auto-Rotate OFF'}</span>
        </button>
      </div>

      <div className="showcase-interaction-hint">
        <span>💡 Drag or click card to inspect both sides in 3D</span>
      </div>
    </div>
  );
}

