"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/components/lib/utils";

// ─── Physics constants ────────────────────────────────────────────────────────
const SPRING_K        = 0;     // Real pendulum relies on gravity
const DAMPING         = 0.92;  // Air resistance for smooth natural swing
const GRAVITY         = 3000;  // Gravity scalar for snappy momentum
const MASS            = 1;

// ─── Elastic Spring Expansion Constants ───────────────────────────────────────
const SPRING_EXPAND_K = 280;   // Snappy spring force pulling scale back to 1.0
const DAMPING_EXPAND  = 18;    // Smooth spring settle
const SPRING_STRETCH_K= 300;   // Rope elastic return force
const DAMPING_STRETCH = 20;    // Rope stretch settle

interface CardPhysicsState {
  angle:      number; // radians from vertical
  vel:        number; // angular velocity rad/s
  scale:      number; // expansion scale (1.0 = normal, ~1.22 = expanded)
  scaleVel:   number; // scale spring velocity
  stretch:    number; // extra rope stretch in px
  stretchVel: number; // rope stretch spring velocity
}

export interface HangingIdCardProps {
  children?: React.ReactNode;
  ropeLength?: number;
  ropeColor?: string;
  className?: string;
  name?: string;
  role?: string;
  badgeId?: string;
  accentColor?: string;
  expandable?: boolean;
}

// ─── SVG Black Lanyard Rope & Metal Lock Clip ──────────────────────────────────
const Lanyard = ({ length, color }: { length: number; color: string }) => {
  const clampY = length;
  const ringY  = length + 10;
  const hookY  = length + 18;

  return (
    <svg
      width="44"
      height={length + 38}
      viewBox={`0 0 44 ${length + 38}`}
      style={{ display: "block", margin: "0 auto", overflow: "visible" }}
    >
      <defs>
        {/* Metal clamp & ring gradient */}
        <linearGradient id="metalDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#71717a" />
          <stop offset="35%" stopColor="#27272a" />
          <stop offset="70%" stopColor="#52525b" />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>

        {/* Hook gradient */}
        <linearGradient id="hookDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#52525b" />
          <stop offset="40%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#3f3f46" />
        </linearGradient>

        {/* Ribbon fabric texture shading */}
        <linearGradient id="strapHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
          <stop offset="25%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="75%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* Main Lanyard Ribbon Strap */}
      <rect
        x="12"
        y="0"
        width="20"
        height={clampY + 4}
        rx="2"
        fill={color || "#18181b"}
      />
      {/* Strap fabric depth shading */}
      <rect
        x="12"
        y="0"
        width="20"
        height={clampY + 4}
        rx="2"
        fill="url(#strapHighlight)"
      />

      {/* Strap side stitch lines */}
      <line
        x1="13.5"
        y1="0"
        x2="13.5"
        y2={clampY + 4}
        stroke="#ffffff"
        strokeOpacity="0.15"
        strokeWidth="0.75"
        strokeDasharray="3 2"
      />
      <line
        x1="30.5"
        y1="0"
        x2="30.5"
        y2={clampY + 4}
        stroke="#ffffff"
        strokeOpacity="0.15"
        strokeWidth="0.75"
        strokeDasharray="3 2"
      />

      {/* Metallic Ribbon Crimp Clamp (Base of Strap) */}
      <rect
        x="10"
        y={clampY}
        width="24"
        height="10"
        rx="2.5"
        fill="url(#metalDark)"
        stroke="#18181b"
        strokeWidth="0.8"
      />
      {/* Metallic Screws/Rivets on Clamp */}
      <circle cx="13.5" cy={clampY + 5} r="1.3" fill="#a1a1aa" />
      <circle cx="30.5" cy={clampY + 5} r="1.3" fill="#a1a1aa" />

      {/* Swivel Ring Loop */}
      <path
        d={`M 15 ${clampY + 9} C 15 ${ringY + 6}, 29 ${ringY + 6}, 29 ${clampY + 9}`}
        fill="none"
        stroke="url(#metalDark)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Swivel Joint */}
      <rect
        x="19"
        y={ringY + 2}
        width="6"
        height="6"
        rx="1"
        fill="url(#metalDark)"
      />

      {/* Metal Snap Hook / Lock Clip */}
      <path
        d={`M 20 ${ringY + 7} 
           L 20 ${hookY + 6} 
           C 20 ${hookY + 15}, 24 ${hookY + 15}, 24 ${hookY + 6} 
           L 24 ${ringY + 7}`}
        fill="none"
        stroke="url(#hookDark)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      
      {/* Spring Clip Latch Lever */}
      <line
        x1="20.5"
        y1={hookY + 1}
        x2="20.5"
        y2={hookY + 10}
        stroke="#d4d4d8"
        strokeWidth="1.2"
      />
    </svg>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const HangingIdCard = ({
  children,
  ropeLength  = 130,
  ropeColor   = "#18181b",
  className,
  name        = "John Doe",
  role        = "Product Designer",
  badgeId     = "ID-84920",
  accentColor = "#2563eb",
  expandable  = true,
}: HangingIdCardProps) => {
  const physRef      = useRef<CardPhysicsState>({
    angle: 0,
    vel: 0,
    scale: 1.0,
    scaleVel: 0,
    stretch: 0,
    stretchVel: 0
  });

  const rafRef       = useRef<number | null>(null);
  const prevTimeRef  = useRef<number | null>(null);
  const prevAngleRef = useRef<number>(0);
  const isDraggingRef= useRef(false);

  const [angle, setAngle] = useState(0);
  const [cardScale, setCardScale] = useState(1.0);
  const [ropeStretch, setRopeStretch] = useState(0);
  const [isDragState, setIsDragState] = useState(false);

  const dragStartX   = useRef(0);
  const dragStartY   = useRef(0);
  const dragAngle0   = useRef(0);

  // ── Physics loop ────────────────────────────────────────────────────────────
  const tick = useCallback((now: number) => {
    if (prevTimeRef.current === null) { prevTimeRef.current = now; }
    const dt = Math.min((now - prevTimeRef.current) / 1000, 0.05); // cap at 50ms
    prevTimeRef.current = now;

    const s = physRef.current;

    if (!isDraggingRef.current) {
      // 1. Realistic pendulum physics: L is approximate center of mass
      const L = (ropeLength + s.stretch) + 100; 
      const torque =
        -(GRAVITY / L)    * Math.sin(s.angle) -
        (DAMPING  / MASS) * s.vel             -
        (SPRING_K / MASS) * s.angle;

      s.vel   += torque * dt;
      s.angle += s.vel  * dt;
      setAngle(s.angle);

      // 2. Spring return physics for scale expansion back to 1.0
      const scaleDiff = s.scale - 1.0;
      const scaleForce = -SPRING_EXPAND_K * scaleDiff - DAMPING_EXPAND * s.scaleVel;
      s.scaleVel += scaleForce * dt;
      s.scale    += s.scaleVel * dt;
      setCardScale(s.scale);

      // 3. Spring return physics for rope stretch back to 0
      const stretchForce = -SPRING_STRETCH_K * s.stretch - DAMPING_STRETCH * s.stretchVel;
      s.stretchVel += stretchForce * dt;
      s.stretch    += s.stretchVel * dt;
      setRopeStretch(s.stretch);

      // Check if settled
      const isMoving =
        Math.abs(s.angle) > 0.001 ||
        Math.abs(s.vel) > 0.001 ||
        Math.abs(s.scale - 1.0) > 0.002 ||
        Math.abs(s.scaleVel) > 0.002 ||
        Math.abs(s.stretch) > 0.2 ||
        Math.abs(s.stretchVel) > 0.2;

      if (isMoving) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Settled cleanly at bottom
        s.angle = 0; s.vel = 0;
        s.scale = 1.0; s.scaleVel = 0;
        s.stretch = 0; s.stretchVel = 0;
        setAngle(0);
        setCardScale(1.0);
        setRopeStretch(0);
      }
    } else {
      // Track velocity while dragging so we can "flick" it on release
      if (dt > 0) {
        s.vel = (s.angle - prevAngleRef.current) / dt;
      }
      prevAngleRef.current = s.angle;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [ropeLength]);

  const startPhysics = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    prevTimeRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // ── Pointer events ──────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    setIsDragState(true);

    dragStartX.current   = e.clientX;
    dragStartY.current   = e.clientY;
    dragAngle0.current   = physRef.current.angle;
    prevAngleRef.current = physRef.current.angle;

    // Immediately trigger tactile initial expansion on touch/grab
    if (expandable) {
      physRef.current.scale = 1.12;
      setCardScale(1.12);
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    prevTimeRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  }, [expandable, tick]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - dragStartX.current;
    const dy = e.clientY - dragStartY.current;

    // Pendulum angle
    const L = ropeLength + physRef.current.stretch + 100; 
    const newAngle = dragAngle0.current - dx / L;
    const clampedAngle = Math.max(-1.45, Math.min(1.45, newAngle));
    physRef.current.angle = clampedAngle;
    setAngle(clampedAngle);

    // Expandable mechanics while dragging
    if (expandable) {
      const pullDist = Math.sqrt(dx * dx + Math.max(0, dy) * Math.max(0, dy));
      // Expands from 1.12 up to 1.25 as pull increases
      const targetScale = Math.min(1.26, 1.12 + (pullDist / 380) * 0.14);
      // Lanyard rope stretches when pulled downward or outward
      const targetStretch = Math.min(60, Math.max(0, dy) * 0.45 + Math.abs(dx) * 0.08);

      physRef.current.scale = targetScale;
      physRef.current.stretch = targetStretch;
      setCardScale(targetScale);
      setRopeStretch(targetStretch);
    }
  }, [expandable, ropeLength]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    isDraggingRef.current = false;
    setIsDragState(false);
    startPhysics();
  }, [startPhysics]);

  // ── Click impulse (tap) with slight spring expand bounce ─────────────────────
  const onCardClick = useCallback(() => {
    if (Math.abs(physRef.current.vel) < 0.1 && Math.abs(physRef.current.angle) < 0.05) {
      physRef.current.vel = 4.2; // Satisfying push
      if (expandable) {
        physRef.current.scale = 1.09; // Playful pop
        physRef.current.scaleVel = -0.5;
        setCardScale(1.09);
      }
      startPhysics();
    }
  }, [expandable, startPhysics]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const cardRotateDeg = angle * (180 / Math.PI);
  const currentRopeLen = Math.max(80, ropeLength + ropeStretch);
  const isExpandedActive = isDragState || cardScale > 1.05;

  return (
    <div
      className={cn("flex flex-col items-center select-none hanging-id-card-wrapper", className)}
      style={{ touchAction: "none" }}
    >
      {/* Ceiling anchor pin */}
      <div
        className="w-4 h-4 rounded-full shadow-lg z-10 relative bg-zinc-900 border border-zinc-700 hanging-card-anchor"
      />

      {/* The Pendulum Assembly (Rope + Lock Clip + Card) */}
      <div 
        className={cn(
          "flex flex-col items-center cursor-grab active:cursor-grabbing hanging-card-pendulum",
          isDragState && "is-dragging"
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onCardClick}
        style={{
          transform: `rotate(${cardRotateDeg}deg)`,
          transformOrigin: "top center",
          willChange: "transform",
          marginTop: "-6px"
        }}
      >
        {/* Lanyard Rope with Lock Clip (Elastic Stretchable Length) */}
        <div style={{ pointerEvents: "none" }}>
          <Lanyard length={currentRopeLen} color={ropeColor} />
        </div>

        {/* Expandable ID Card Container */}
        <div 
          className={cn(
            "relative w-56 rounded-2xl overflow-hidden shadow-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 pointer-events-none mt-[-16px] hanging-card-body",
            isExpandedActive && "is-expanded"
          )}
          style={{
            transform: `scale(${cardScale})`,
            transformOrigin: "top center",
            transition: isDragState ? "transform 0.05s linear" : "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            willChange: "transform, box-shadow"
          }}
        >
          {/* Punched Slot Hole for Lanyard Clip */}
          <div className="flex justify-center pt-2.5 pb-1 bg-zinc-100 dark:bg-zinc-800/80 border-b border-zinc-200/80 dark:border-zinc-800 relative">
            <div className="w-8 h-2.5 rounded-full bg-zinc-950 dark:bg-black border border-zinc-400/50 dark:border-zinc-700 shadow-inner flex items-center justify-center">
              <div className="w-6 h-1 rounded-full bg-zinc-900 dark:bg-zinc-950 opacity-90" />
            </div>

            {/* Expansion Indicator Pill (Reveals when dragging) */}
            {expandable && (
              <div
                className={cn(
                  "absolute right-2.5 top-2 px-2 py-0.5 rounded-full text-[8px] font-black tracking-wider uppercase transition-all duration-200",
                  isExpandedActive
                    ? "opacity-100 scale-100 bg-blue-600 text-white shadow-sm"
                    : "opacity-0 scale-75 pointer-events-none"
                )}
              >
                Expanded
              </div>
            )}
          </div>

          {children ?? (
            <div className="flex flex-col h-full">
              {/* Card Header Banner with Dynamic Holographic Glare */}
              <div
                className="px-4 pt-3.5 pb-4 flex flex-col items-center gap-2 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #1e1b4b 100%)` }}
              >
                {/* Holographic light sweep on drag */}
                {isExpandedActive && (
                  <div
                    className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
                    style={{ transform: `translateX(${angle * 80}px)` }}
                  />
                )}

                {/* Security Chip Icon */}
                <div className="absolute top-2.5 left-3 w-6 h-5 rounded bg-amber-400/90 border border-amber-500/80 shadow-sm flex items-center justify-center">
                  <div className="w-4 h-3 border border-amber-700/40 rounded-[1px] grid grid-cols-2 gap-[1px] p-[1px]">
                    <div className="bg-amber-600/40" />
                    <div className="bg-amber-600/40" />
                    <div className="bg-amber-600/40" />
                    <div className="bg-amber-600/40" />
                  </div>
                </div>

                {/* User Profile Avatar */}
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md mt-1 border border-white/30 shadow-md">
                  <svg className="w-8 h-8 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>

              {/* Card Body */}
              <div className="bg-white dark:bg-zinc-900 px-4 py-4 flex flex-col items-center gap-1.5 flex-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-white text-center leading-tight">
                  {name}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {role}
                </p>

                <div className="my-1 w-full border-t border-zinc-100 dark:border-zinc-800" />

                {/* Barcode */}
                <div className="flex gap-[2px] items-end h-6 px-1">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-zinc-800 dark:bg-zinc-200 rounded-[1px]"
                      style={{
                        width: i % 3 === 0 ? "3px" : "1.5px",
                        height: `${50 + Math.sin(i * 1.3) * 35}%`,
                      }}
                    />
                  ))}
                </div>

                <p
                  className="text-[10px] font-mono font-bold tracking-widest mt-0.5"
                  style={{ color: accentColor }}
                >
                  {badgeId}
                </p>

                {/* Status badge */}
                <div
                  className="mt-1 px-3 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-widest transition-colors duration-200"
                  style={{ background: isExpandedActive ? "#0ea5e9" : accentColor }}
                >
                  {isExpandedActive ? "EXPANDED • ACTIVE" : "ACTIVE"}
                </div>

                {/* Expandable Extra Details Panel (Expands downward while dragging) */}
                <div
                  className="w-full overflow-hidden transition-all duration-200 ease-out"
                  style={{
                    maxHeight: isExpandedActive ? "75px" : "0px",
                    opacity: isExpandedActive ? 1 : 0,
                    marginTop: isExpandedActive ? "6px" : "0px"
                  }}
                >
                  <div className="pt-2 px-1 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      SECURE ID
                    </span>
                    <span className="font-mono text-[9px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-semibold text-zinc-700 dark:text-zinc-300">
                      NFC ENABLED
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-zinc-400 dark:text-zinc-500 px-1 pt-1 font-mono">
                    <span>ISSUE: 2026</span>
                    <span>EXP: 2027</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drag hint with dynamic expansion status */}
      <p className="mt-8 text-[11px] text-zinc-400 dark:text-zinc-600 font-medium select-none pointer-events-none hanging-card-hint">
        {isExpandedActive ? "✨ Card Expanded • Drag to swing or release to snap back" : "🖐️ Drag left/right/down to swing & expand the card"}
      </p>
    </div>
  );
};

export default HangingIdCard;
