import React, { useRef, useState, useEffect, forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  GraduationCap,
  ShieldCheck,
  Heart,
  MapPin,
  Phone,
  Calendar
} from 'lucide-react';
import DraggableElement from './DraggableElement';
import ElementToolbar from './ElementToolbar';
import FloatingElementToolbar from './FloatingElementToolbar';
import AlignmentGuides from './AlignmentGuides';
import { CANVAS_DIMENSIONS } from '../../state/defaultDesign';

const IDCardCanvas = forwardRef(function IDCardCanvas(
  {
    student = {},
    design,
    selectedElementId,
    onSelectElement,
    onUpdateElement,
    onReorderElement,
    onToggleLock,
    onHideElement,
    isFlipped = false,
    isExportMode = false,
    onFocusField,
    onPhotoUpload,
    onLogoUpload,
    onUpdateStudentField
  },
  ref
) {
  const containerRef = useRef(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [activeGuides, setActiveGuides] = useState(null);
  const [inlineEditingId, setInlineEditingId] = useState(null);

  const lastSelectTimeRef = useRef(0);
  const isPointerDownOnElementRef = useRef(false);

  // Safe handler to select an element and remember timestamp
  const handleSelectElement = (id) => {
    lastSelectTimeRef.current = Date.now();
    isPointerDownOnElementRef.current = true;
    onSelectElement(id);
    if (inlineEditingId && inlineEditingId !== id) {
      setInlineEditingId(null);
    }
    setTimeout(() => {
      isPointerDownOnElementRef.current = false;
    }, 250);
  };

  const handleBackgroundClick = (e) => {
    // If the click is inside a canvas element or floating toolbar, ignore
    if (
      e.target.closest('[data-canvas-element="true"]') ||
      e.target.closest('[data-floating-toolbar="true"]')
    ) {
      return;
    }
    // If pointer was pressed down on an element or selected within last 250ms, do not deselect!
    if (isPointerDownOnElementRef.current || Date.now() - lastSelectTimeRef.current < 250) {
      return;
    }
    onSelectElement(null);
    setInlineEditingId(null);
  };

  const handlePointerDown = (e) => {
    if (
      e.target.closest('[data-canvas-element="true"]') ||
      e.target.closest('[data-floating-toolbar="true"]')
    ) {
      isPointerDownOnElementRef.current = true;
      lastSelectTimeRef.current = Date.now();
      setTimeout(() => {
        isPointerDownOnElementRef.current = false;
      }, 250);
    } else {
      isPointerDownOnElementRef.current = false;
    }
  };

  const orientation = design?.card?.orientation || 'horizontal';
  const { width: cardWidth, height: cardHeight } = CANVAS_DIMENSIONS[orientation] || CANVAS_DIMENSIONS.horizontal;

  // Responsive Visual Scaling calculation to fit exact screen space
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      const containerWidth = parent?.clientWidth || cardWidth;
      const containerHeight = parent?.clientHeight || cardHeight;

      // Allow scale up to 1 (natural resolution) or scale down to fit BOTH width and height
      const scaleX = (containerWidth - 24) / cardWidth;
      const scaleY = (containerHeight - 16) / cardHeight;
      const scale = Math.min(1, Math.max(0.42, Math.min(scaleX, scaleY)));
      setCanvasScale(scale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [cardWidth, cardHeight, orientation]);

  // Derived student information with fallbacks
  const displayName = student.fullName && student.fullName.trim() ? student.fullName.toUpperCase() : 'STUDENT NAME';
  const displayCollege = student.collegeName && student.collegeName.trim() ? student.collegeName.toUpperCase() : 'NATIONAL INSTITUTE OF TECHNOLOGY';
  const displayRoll = student.rollNumber && student.rollNumber.trim() ? student.rollNumber.toUpperCase() : '21B91A0582';
  const displayBranch = student.branch || 'Computer Science & Engineering';
  const displayYearSection = `${student.year || '4th Year'} • Sec ${student.section || 'A'}`;
  const displayEmail = student.email || 'student@college.edu';
  const displayPhone = student.phone || '+91 98765 43210';
  const displayBlood = student.bloodGroup || 'O+';
  const displayDob = student.dob || '2003-08-14';
  const displayAddress = student.address || 'University Campus, Academic Ridge, India';

  const initials = student.fullName
    ? student.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'ID';

  const qrPayload = JSON.stringify({
    name: displayName,
    id: displayRoll,
    inst: displayCollege,
    branch: displayBranch,
    blood: displayBlood,
    valid: '2028-06-30'
  });

  const selectedElement = design?.elements && selectedElementId ? design.elements[selectedElementId] : null;

  // Handle Drag state to show/hide alignment guides
  const handleDragStateChange = (isDragging, currentElement, guides) => {
    if (!isDragging) {
      setActiveGuides(null);
    } else {
      setActiveGuides(guides);
    }
  };

  // Render individual element content based on its key
  const renderElementContent = (key, el) => {
    switch (key) {
      case 'collegeEmblem':
        if (student.logoUrl || el.imageUrl) {
          return (
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={student.logoUrl || el.imageUrl}
                alt="College Logo"
                className="w-full h-full object-contain pointer-events-none drop-shadow-xs select-none"
              />
            </div>
          );
        }
        return (
          <div
            className="w-full h-full rounded-full flex items-center justify-center shadow-xs"
            style={{ backgroundColor: `${design.card.accentColor || '#38bdf8'}33`, border: `1.5px solid ${design.card.accentColor || '#38bdf8'}` }}
          >
            <GraduationCap size={Math.round(el.width * 0.55)} className="text-white drop-shadow-xs" />
          </div>
        );

      case 'collegeName':
        if (inlineEditingId === 'collegeName') {
          return (
            <input
              type="text"
              value={student.collegeName !== undefined ? student.collegeName : ''}
              onChange={(e) => onUpdateStudentField && onUpdateStudentField('collegeName', e.target.value)}
              onBlur={() => setInlineEditingId(null)}
              onKeyDown={(e) => { if (e.key === 'Enter') setInlineEditingId(null); }}
              autoFocus
              className="w-full h-full bg-blue-500/20 border-b-2 border-white text-white outline-none px-1 select-text"
              style={{
                fontSize: `${el.fontSize || 16}px`,
                fontWeight: el.fontWeight || '800',
                textAlign: el.textAlign || 'left'
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          );
        }
        return (
          <h2
            className="w-full h-full truncate font-black tracking-tight leading-tight select-none"
            style={{
              fontSize: `${el.fontSize || 16}px`,
              fontWeight: el.fontWeight || '800',
              color: el.color || '#ffffff',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left'
            }}
          >
            {displayCollege}
          </h2>
        );

      case 'collegeTagline':
        return (
          <span
            className="w-full h-full truncate font-semibold tracking-wider uppercase block select-none"
            style={{
              fontSize: `${el.fontSize || 9}px`,
              fontWeight: el.fontWeight || '600',
              color: el.color || '#93c5fd',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left'
            }}
          >
            ACCREDITED AUTONOMOUS INSTITUTION
          </span>
        );

      case 'smartChip':
        return (
          <div className="w-full h-full rounded-sm bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border border-amber-300 shadow-xs flex items-center justify-center p-0.5">
            <div className="w-full h-full border border-amber-600/40 rounded-[2px] opacity-75" />
          </div>
        );

      case 'idRibbon':
        return (
          <div
            className="w-full h-full flex items-center justify-between px-6 shadow-xs select-none"
            style={{ backgroundColor: design.card.accentColor || '#38bdf8' }}
          >
            <span
              className="font-bold tracking-wider uppercase"
              style={{ fontSize: `${el.fontSize || 10}px`, color: el.color || '#ffffff' }}
            >
              STUDENT IDENTITY CARD
            </span>
            <span
              className="font-mono font-semibold opacity-90"
              style={{ fontSize: `${(el.fontSize || 10) - 1}px`, color: el.color || '#ffffff' }}
            >
              2024–2028
            </span>
          </div>
        );

      case 'studentPhoto':
        return (
          <div
            className={`w-full h-full overflow-hidden shadow-md bg-slate-100 flex items-center justify-center relative ${
              el.shape === 'circle' ? 'rounded-full' : 'rounded-xl'
            }`}
            style={{
              borderColor: el.borderColor || design.card.accentColor || '#38bdf8',
              borderWidth: `${el.borderWidth !== undefined ? el.borderWidth : 2}px`,
              borderStyle: 'solid'
            }}
          >
            {student.photoUrl ? (
              <img src={student.photoUrl} alt={displayName} className="w-full h-full object-cover pointer-events-none select-none" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 pointer-events-none select-none">
                <span className="font-extrabold text-xl text-slate-500">{initials}</span>
                <span className="text-[9px] font-bold tracking-wider mt-0.5">PHOTO</span>
              </div>
            )}
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-black/60 text-emerald-400 backdrop-blur-xs flex items-center gap-0.5 border border-white/20 pointer-events-none">
              <ShieldCheck size={9} />
              <span>VERIFIED</span>
            </div>
          </div>
        );

      case 'studentName':
        if (inlineEditingId === 'studentName') {
          return (
            <input
              type="text"
              value={student.fullName !== undefined ? student.fullName : ''}
              onChange={(e) => onUpdateStudentField && onUpdateStudentField('fullName', e.target.value)}
              onBlur={() => setInlineEditingId(null)}
              onKeyDown={(e) => { if (e.key === 'Enter') setInlineEditingId(null); }}
              autoFocus
              className="w-full h-full bg-blue-500/10 border-b-2 border-blue-600 outline-none px-1 select-text"
              style={{
                fontSize: `${el.fontSize || 20}px`,
                fontWeight: el.fontWeight || '900',
                color: el.color || '#0f172a',
                fontStyle: el.fontStyle || 'normal',
                textAlign: el.textAlign || 'left'
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          );
        }
        return (
          <h3
            className="w-full h-full truncate leading-tight select-none"
            style={{
              fontSize: `${el.fontSize || 20}px`,
              fontWeight: el.fontWeight || '900',
              color: el.color || '#0f172a',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left'
            }}
          >
            {displayName}
          </h3>
        );

      case 'rollNumber':
        if (inlineEditingId === 'rollNumber') {
          return (
            <div className="w-full h-full flex items-center">
              <span
                className="px-2 py-0.5 rounded-md font-mono font-bold tracking-wider border shadow-2xs flex items-center gap-1 select-text"
                style={{
                  fontSize: `${el.fontSize || 11}px`,
                  color: el.color || '#1e40af',
                  backgroundColor: `${design.card.accentColor || '#38bdf8'}20`,
                  borderColor: `${design.card.accentColor || '#38bdf8'}50`
                }}
              >
                <span>ROLL:</span>
                <input
                  type="text"
                  value={student.rollNumber !== undefined ? student.rollNumber : ''}
                  onChange={(e) => onUpdateStudentField && onUpdateStudentField('rollNumber', e.target.value)}
                  onBlur={() => setInlineEditingId(null)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setInlineEditingId(null); }}
                  autoFocus
                  className="bg-transparent font-mono font-bold outline-none border-b border-blue-500 w-24 select-text"
                  style={{ color: el.color || '#1e40af' }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </span>
            </div>
          );
        }
        return (
          <div className="w-full h-full flex items-center">
            <span
              className="px-2.5 py-0.5 rounded-md font-mono font-bold tracking-wider border shadow-2xs select-none"
              style={{
                fontSize: `${el.fontSize || 11}px`,
                color: el.color || '#1e40af',
                backgroundColor: `${design.card.accentColor || '#38bdf8'}20`,
                borderColor: `${design.card.accentColor || '#38bdf8'}50`
              }}
            >
              ROLL: {displayRoll}
            </span>
          </div>
        );

      case 'branch':
        if (inlineEditingId === 'branch') {
          return (
            <input
              type="text"
              value={student.branch !== undefined ? student.branch : ''}
              onChange={(e) => onUpdateStudentField && onUpdateStudentField('branch', e.target.value)}
              onBlur={() => setInlineEditingId(null)}
              onKeyDown={(e) => { if (e.key === 'Enter') setInlineEditingId(null); }}
              autoFocus
              className="w-full h-full bg-blue-500/10 border-b-2 border-blue-600 outline-none px-1 select-text"
              style={{
                fontSize: `${el.fontSize || 12}px`,
                fontWeight: el.fontWeight || '700',
                color: el.color || '#1e3a8a',
                fontStyle: el.fontStyle || 'normal',
                textAlign: el.textAlign || 'left'
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          );
        }
        return (
          <div
            className="w-full h-full truncate select-none"
            style={{
              fontSize: `${el.fontSize || 12}px`,
              fontWeight: el.fontWeight || '700',
              color: el.color || '#1e3a8a',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left'
            }}
          >
            {displayBranch}
          </div>
        );

      case 'yearSection':
        return (
          <div
            className="w-full h-full truncate select-none"
            style={{
              fontSize: `${el.fontSize || 11}px`,
              fontWeight: el.fontWeight || '600',
              color: el.color || '#475569',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left'
            }}
          >
            {displayYearSection}
          </div>
        );

      case 'email':
        return (
          <div
            className="w-full h-full truncate font-mono select-none"
            style={{
              fontSize: `${el.fontSize || 10}px`,
              fontWeight: el.fontWeight || '500',
              color: el.color || '#334155',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left'
            }}
          >
            {displayEmail}
          </div>
        );

      case 'phone':
        return (
          <div
            className="w-full h-full truncate font-mono select-none"
            style={{
              fontSize: `${el.fontSize || 10}px`,
              fontWeight: el.fontWeight || '500',
              color: el.color || '#334155',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left'
            }}
          >
            {displayPhone}
          </div>
        );

      case 'bloodGroup':
        return (
          <div
            className="w-full h-full flex items-center gap-1 select-none"
            style={{
              fontSize: `${el.fontSize || 11}px`,
              fontWeight: el.fontWeight || '700',
              color: el.color || '#e11d48',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left'
            }}
          >
            <Heart size={11} className="fill-rose-500 text-rose-500 shrink-0" />
            <span>BLOOD: {displayBlood}</span>
          </div>
        );

      case 'dob':
        return (
          <div
            className="w-full h-full truncate select-none"
            style={{
              fontSize: `${el.fontSize || 11}px`,
              fontWeight: el.fontWeight || '500',
              color: el.color || '#475569',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left'
            }}
          >
            DOB: {displayDob}
          </div>
        );

      case 'address':
        return (
          <div
            className="w-full h-full truncate select-none flex items-center gap-1"
            style={{
              fontSize: `${el.fontSize || 9}px`,
              fontWeight: el.fontWeight || '500',
              color: el.color || '#64748b',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left'
            }}
          >
            <MapPin size={10} className="shrink-0 text-slate-400" />
            <span className="truncate">{displayAddress}</span>
          </div>
        );

      case 'qrCode':
        return (
          <div className="w-full h-full bg-white p-1 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center">
            <QRCodeSVG value={qrPayload} size={Math.min(el.width, el.height) - 8} level="M" />
          </div>
        );

      case 'signature':
        return (
          <div className="w-full h-full flex flex-col items-center justify-end select-none">
            <span className="font-serif italic text-sm text-slate-800 tracking-wide">
              {student.fullName ? student.fullName.slice(0, 15) : 'H. Vardhan'}
            </span>
            <div className="w-full border-b border-slate-400 my-0.5" />
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
              Authorized Signatory
            </span>
          </div>
        );

      case 'barcode':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white/95 px-2 py-1 rounded border border-slate-200 shadow-2xs select-none">
            <div className="w-full h-5 flex items-stretch justify-between gap-[2px] overflow-hidden">
              {[3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2].map((w, i) => (
                <div key={i} className="bg-slate-900" style={{ width: `${w}px` }} />
              ))}
            </div>
            <span className="text-[8px] font-mono font-bold tracking-wider text-slate-700 mt-0.5">
              *{displayRoll}*
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full min-h-0 canvas-empty-workspace"
      onPointerDownCapture={handlePointerDown}
      onClick={handleBackgroundClick}
    >
      {/* Visual Canvas Scaler Container */}
      <div
        ref={containerRef}
        style={{
          width: `${Math.round(cardWidth * canvasScale)}px`,
          height: `${Math.round(cardHeight * canvasScale)}px`,
          transition: 'width 0.15s ease-out, height 0.15s ease-out'
        }}
        className="relative flex items-center justify-center shrink-0"
      >
        {/* Scaled Virtual Canvas Root */}
        <div
          style={{
            transform: `scale(${canvasScale})`,
            transformOrigin: 'top left',
            width: `${cardWidth}px`,
            height: `${cardHeight}px`
          }}
          className="absolute top-0 left-0"
        >
          {/* Card Face: Mutually exclusive Front or Back rendering to completely prevent ghosting/overlap */}
          {!isFlipped ? (
            /* FRONT FACE (Interactive Design Canvas) */
            <div
              ref={ref}
              id="downloadable-id-card"
              className="relative w-full h-full rounded-2xl overflow-hidden shadow-card border select-none font-sans"
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                backgroundColor: design?.card?.background || '#ffffff',
                borderColor: design?.card?.borderColor || '#93c5fd',
                borderWidth: `${design?.card?.borderWidth || 1}px`
              }}
              onPointerDownCapture={handlePointerDown}
              onClick={handleBackgroundClick}
            >
              {/* Lanyard punch slot */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <span className="w-12 h-2 rounded-full bg-slate-900/30 border border-white/20 inline-block shadow-inner" />
              </div>

              {/* Header Banner */}
              <div
                data-card-bg="true"
                className="w-full h-18 relative z-0 shadow-sm transition-colors duration-200"
                style={{ background: design?.card?.headerBg || 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' }}
              />

              {/* Decorative Subtle Background Pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:14px_14px]" />

              {/* All Movable Design Elements */}
              {design?.elements &&
                Object.entries(design.elements).map(([key, el]) => (
                  <DraggableElement
                    key={key}
                    element={el}
                    isSelected={!isExportMode && selectedElementId === key}
                    isEditing={inlineEditingId === key}
                    canvasScale={canvasScale}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                    onSelect={handleSelectElement}
                    onChange={onUpdateElement}
                    onDragStateChange={handleDragStateChange}
                    onDoubleClick={(elemId) => {
                      if (elemId === 'studentPhoto') {
                        if (onFocusField) onFocusField('studentPhoto');
                        return;
                      }
                      if (elemId === 'collegeEmblem') {
                        if (onFocusField) onFocusField('collegeEmblem');
                        return;
                      }
                      const elementObj = design?.elements?.[elemId];
                      if (elementObj?.type === 'text' || elementObj?.type === 'badge') {
                        setInlineEditingId(elemId);
                      }
                    }}
                  >
                    {renderElementContent(key, el)}
                  </DraggableElement>
                ))}

              {/* Alignment and Snap Guides */}
              {!isExportMode && (
                <AlignmentGuides
                  activeGuides={activeGuides}
                  cardWidth={cardWidth}
                  cardHeight={cardHeight}
                />
              )}

              {/* Bottom Decorative Accent Bar */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1.5 z-20 pointer-events-none"
                style={{ backgroundColor: design?.card?.accentColor || '#38bdf8' }}
              />
            </div>
          ) : (
            /* BACK FACE (Interactive Back View) */
            <div
              className="relative w-full h-full rounded-2xl overflow-hidden shadow-card border select-none font-sans flex flex-col justify-between"
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                backgroundColor: design?.card?.background || '#ffffff',
                borderColor: design?.card?.borderColor || '#93c5fd',
                borderWidth: `${design?.card?.borderWidth || 1}px`
              }}
            >
              {/* Top Magnetic / Security Stripe */}
              <div className="w-full h-8 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
                <div className="w-10 h-2 rounded bg-slate-700/60" />
                <span className="text-[9px] tracking-widest text-slate-400 font-mono">
                  SECURITY VERIFIED • INSTITUTIONAL CREDENTIAL
                </span>
                <div className="w-10 h-2 rounded bg-slate-700/60" />
              </div>

              {/* Back Information & Directives */}
              <div className="p-4 flex-1 flex flex-col justify-between text-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart size={12} className="text-rose-500 fill-rose-500 shrink-0" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase w-20">Blood Group:</span>
                    <span className="text-[11px] font-bold text-slate-800 font-mono">{displayBlood}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-blue-500 shrink-0" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase w-20">Helpline:</span>
                    <span className="text-[11px] font-medium text-slate-700 font-mono">{displayPhone}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin size={12} className="text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase w-20">Campus:</span>
                    <span className="text-[10px] font-medium text-slate-600 line-clamp-1">{displayAddress}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-blue-500 shrink-0" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase w-20">Validity:</span>
                    <span className="text-[10px] font-medium text-slate-700">Issued: Aug 2024 • Valid: Jun 2028</span>
                  </div>
                </div>

                {/* Terms and Conditions block */}
                <div className="p-2.5 rounded-lg bg-black/5 border border-black/10 text-[8px] leading-relaxed text-slate-600">
                  <span className="font-bold text-slate-800 block mb-0.5">TERMS & CONDITIONS:</span>
                  <ol className="list-decimal pl-3 space-y-0.5">
                    <li>This credential is non-transferable and remains property of {displayCollege}.</li>
                    <li>Report loss immediately to the Academic Registrar office.</li>
                    <li>Mandatory for campus, examination halls, library, and laboratory access.</li>
                  </ol>
                </div>

                {/* Barcode section */}
                <div className="bg-white p-2 rounded border border-slate-200 flex flex-col items-center justify-center shadow-2xs">
                  <div className="w-full h-6 flex items-stretch justify-center gap-[2px] overflow-hidden">
                    {[2, 1, 3, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 3, 2, 4, 1].map((w, i) => (
                      <div key={i} className="bg-slate-900" style={{ width: `${w}px` }} />
                    ))}
                  </div>
                  <span className="text-[8px] font-mono font-bold tracking-wider text-slate-700 mt-0.5">
                    *{displayRoll}*
                  </span>
                </div>
              </div>

              {/* Bottom Accent Bar */}
              <div
                className="h-1.5 w-full shrink-0"
                style={{ backgroundColor: design?.card?.accentColor || '#38bdf8' }}
              />
            </div>
          )}

          {/* Canva / Figma Style FLOATING EDITING TOOLBAR */}
          {!isFlipped && !isExportMode && selectedElement && (
            <FloatingElementToolbar
              element={selectedElement}
              studentData={student}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              onUpdateElement={onUpdateElement}
              onUpdateStudentField={onUpdateStudentField}
              onReorderElement={onReorderElement}
              onToggleLock={onToggleLock}
              onHideElement={onHideElement}
              onDeselect={() => {
                onSelectElement(null);
                setInlineEditingId(null);
              }}
              onPhotoUpload={onPhotoUpload}
              onLogoUpload={onLogoUpload}
              onEnterInlineEdit={(elemId) => {
                const elementObj = design?.elements?.[elemId];
                if (elementObj?.type === 'text' || elementObj?.type === 'badge') {
                  setInlineEditingId(elemId);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default IDCardCanvas;
