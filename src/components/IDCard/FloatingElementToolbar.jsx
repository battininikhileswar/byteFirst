import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Lock,
  Unlock,
  EyeOff,
  Minus,
  Plus,
  RotateCw,
  X,
  Camera,
  Upload,
  Square,
  Circle,
  Type,
  Edit3,
  QrCode,
  Layers,
  Palette
} from 'lucide-react';
import { ELEMENT_TO_FIELD_MAP } from './ElementToolbar';

const PRESET_COLORS = [
  '#ffffff',
  '#0f172a',
  '#1e3a8a',
  '#2563eb',
  '#38bdf8',
  '#059669',
  '#e11d48',
  '#d97706',
  '#881337',
  '#4c1d95'
];

export default function FloatingElementToolbar({
  element,
  studentData = {},
  cardWidth = 600,
  cardHeight = 380,
  onUpdateElement,
  onUpdateStudentField,
  onReorderElement,
  onToggleLock,
  onHideElement,
  onDeselect,
  onPhotoUpload,
  onLogoUpload,
  onEnterInlineEdit
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
  const [showLayersMenu, setShowLayersMenu] = useState(false);

  const photoInputRef = useRef(null);
  const logoInputRef = useRef(null);

  if (!element) return null;

  const isText = element.type === 'text' || element.type === 'badge';
  const isPhoto =
    element.id === 'studentPhoto' ||
    (element.type === 'image' && element.id?.toLowerCase().includes('photo'));
  const isLogo =
    element.id === 'collegeEmblem' ||
    element.id === 'collegeLogo' ||
    (element.type === 'icon' && element.id?.toLowerCase().includes('emblem'));
  const isShape =
    element.type === 'shape' || element.id === 'idRibbon' || element.id === 'smartChip';
  const isQr = element.id === 'qrCode' || element.id === 'barcode';

  const mappedField = ELEMENT_TO_FIELD_MAP[element.id];
  const currentBorderWidth = element.borderWidth !== undefined ? element.borderWidth : 2;

  // File Upload Handlers
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (onPhotoUpload && ev.target?.result) {
        onPhotoUpload(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (onLogoUpload && ev.target?.result) {
        onLogoUpload(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Clamped Coordinates: Position directly above (or below if close to top edge)
  const isNearTop = element.y < 54;
  const topPos = isNearTop
    ? element.y + (element.height || 30) + 10
    : Math.max(4, element.y - 48);

  const elemCenterX = element.x + (element.width || 80) / 2;
  // Estimate max toolbar width based on active element type
  const estWidth = isText ? 440 : isPhoto ? 400 : isLogo ? 380 : 340;
  const halfWidth = Math.min(cardWidth / 2 - 8, estWidth / 2);
  const clampCenterX = Math.max(halfWidth + 8, Math.min(cardWidth - halfWidth - 8, elemCenterX));

  return (
    <div
      data-floating-toolbar="true"
      className="absolute flex items-center gap-1.5 p-1.5 bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-xl z-50 text-xs select-none transition-all duration-75 animate-in fade-in zoom-in-95 pointer-events-auto"
      style={{
        left: `${clampCenterX}px`,
        top: `${topPos}px`,
        transform: 'translateX(-50%)',
        maxWidth: `${cardWidth - 16}px`
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        className="hidden"
        onChange={handlePhotoFileChange}
      />
      <input
        type="file"
        ref={logoInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleLogoFileChange}
      />

      {/* 1. Element Type Indicator / Quick Edit Icon */}
      <div className="flex items-center gap-1 bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-tight shrink-0">
        {isPhoto ? (
          <Camera size={12} />
        ) : isLogo ? (
          <Upload size={12} />
        ) : isQr ? (
          <QrCode size={12} />
        ) : isShape ? (
          <Square size={12} />
        ) : (
          <Type size={12} />
        )}
        <span className="truncate max-w-[100px]">{element.label || element.id}</span>
      </div>

      {/* 2. Text Editing Controls */}
      {isText && (
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Inline Edit Button */}
          {onEnterInlineEdit && (
            <button
              type="button"
              onClick={() => onEnterInlineEdit(element.id)}
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-700/80 flex items-center gap-1 cursor-pointer"
              title="Edit Text (or double-click element)"
            >
              <Edit3 size={12} className="text-blue-400" />
              <span className="text-[10px] font-semibold">Edit</span>
            </button>
          )}

          {/* Font Size decrease / increase */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded p-0.5">
            <button
              type="button"
              onClick={() =>
                onUpdateElement(element.id, {
                  fontSize: Math.max(8, (element.fontSize || 14) - 1)
                }, true)
              }
              className="p-0.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Decrease font size"
            >
              <Minus size={11} />
            </button>
            <span className="text-[10px] font-mono px-1 min-w-[20px] text-center text-slate-200">
              {element.fontSize || 14}
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateElement(element.id, {
                  fontSize: Math.min(44, (element.fontSize || 14) + 1)
                }, true)
              }
              className="p-0.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Increase font size"
            >
              <Plus size={11} />
            </button>
          </div>

          {/* Bold */}
          <button
            type="button"
            onClick={() =>
              onUpdateElement(element.id, {
                fontWeight:
                  element.fontWeight === 'bold' || element.fontWeight >= 700 ? '400' : '800'
              }, true)
            }
            className={`p-1 rounded cursor-pointer ${
              element.fontWeight === 'bold' || element.fontWeight >= 700
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Bold"
          >
            <Bold size={12} />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() =>
              onUpdateElement(element.id, {
                fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic'
              }, true)
            }
            className={`p-1 rounded cursor-pointer ${
              element.fontStyle === 'italic'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Italic"
          >
            <Italic size={12} />
          </button>

          {/* Text Alignment */}
          <button
            type="button"
            onClick={() =>
              onUpdateElement(element.id, {
                textAlign:
                  element.textAlign === 'left'
                    ? 'center'
                    : element.textAlign === 'center'
                    ? 'right'
                    : 'left'
              }, true)
            }
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
            title={`Align: ${element.textAlign || 'left'}`}
          >
            {element.textAlign === 'center' ? (
              <AlignCenter size={12} />
            ) : element.textAlign === 'right' ? (
              <AlignRight size={12} />
            ) : (
              <AlignLeft size={12} />
            )}
          </button>

          {/* Text Color Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowBorderColorPicker(false);
              }}
              className="p-1 hover:bg-slate-800 rounded flex items-center gap-1 text-slate-300 border border-slate-700 cursor-pointer"
              title="Text Color"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-xs"
                style={{ backgroundColor: element.color || '#ffffff' }}
              />
            </button>

            {showColorPicker && (
              <div className="absolute top-8 left-0 z-50 p-2 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl flex flex-wrap gap-1.5 w-36 animate-in fade-in zoom-in-95">
                <span className="text-[10px] text-slate-400 font-bold w-full mb-0.5">
                  Text Color:
                </span>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onUpdateElement(element.id, { color: c }, true);
                      setShowColorPicker(false);
                    }}
                    className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition shadow-xs cursor-pointer"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Photo Controls */}
      {isPhoto && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex items-center gap-1 transition shadow-xs cursor-pointer text-[11px]"
            title="Upload new student photo"
          >
            <Camera size={12} />
            <span>Replace</span>
          </button>

          {/* Shape Toggle */}
          <button
            type="button"
            onClick={() =>
              onUpdateElement(element.id, {
                shape: element.shape === 'circle' ? 'square' : 'circle'
              }, true)
            }
            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium flex items-center gap-1 transition border border-slate-700 cursor-pointer text-[11px]"
            title={element.shape === 'circle' ? 'Switch to Square' : 'Switch to Circle'}
          >
            {element.shape === 'circle' ? (
              <Circle size={12} className="text-blue-400" />
            ) : (
              <Square size={12} className="text-blue-400" />
            )}
            <span className="capitalize text-[10px]">
              {element.shape === 'circle' ? 'Circle' : 'Square'}
            </span>
          </button>

          {/* Border Width */}
          <button
            type="button"
            onClick={() => {
              const nextWidth =
                currentBorderWidth === 0 ? 2 : currentBorderWidth === 2 ? 4 : 0;
              onUpdateElement(element.id, { borderWidth: nextWidth }, true);
            }}
            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono transition border border-slate-700 cursor-pointer"
            title="Cycle border thickness (0px, 2px, 4px)"
          >
            Border: {currentBorderWidth}px
          </button>

          {/* Border Color Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowBorderColorPicker(!showBorderColorPicker);
                setShowColorPicker(false);
              }}
              className="p-1 hover:bg-slate-800 rounded flex items-center gap-1 text-slate-300 border border-slate-700 cursor-pointer"
              title="Photo border color"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                style={{ backgroundColor: element.borderColor || '#38bdf8' }}
              />
            </button>

            {showBorderColorPicker && (
              <div className="absolute top-8 left-0 z-50 p-2 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl flex flex-wrap gap-1.5 w-36 animate-in fade-in zoom-in-95">
                <span className="text-[10px] text-slate-400 font-bold w-full mb-0.5">
                  Border Color:
                </span>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onUpdateElement(element.id, { borderColor: c }, true);
                      setShowBorderColorPicker(false);
                    }}
                    className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition shadow-xs cursor-pointer"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Logo / Emblem Controls */}
      {isLogo && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium flex items-center gap-1 transition shadow-xs cursor-pointer text-[11px]"
            title="Upload new institution logo"
          >
            <Upload size={12} />
            <span>Replace</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateElement(element.id, {
                rotation: ((element.rotation || 0) + 15) % 360
              }, true)
            }
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white flex items-center gap-1 border border-slate-700 cursor-pointer text-[10px]"
            title="Rotate 15°"
          >
            <RotateCw size={11} />
            <span className="font-mono">{element.rotation || 0}°</span>
          </button>
        </div>
      )}

      {/* 5. Ribbon / Shape Controls */}
      {isShape && (
        <div className="flex items-center gap-1 shrink-0">
          {/* Color Picker Popover for Ribbon / Shape */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1 hover:bg-slate-800 rounded flex items-center gap-1 text-slate-300 border border-slate-700 cursor-pointer text-[11px]"
              title="Shape Color"
            >
              <Palette size={12} className="text-amber-400" />
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-xs"
                style={{ backgroundColor: element.color || '#38bdf8' }}
              />
            </button>

            {showColorPicker && (
              <div className="absolute top-8 left-0 z-50 p-2 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl flex flex-wrap gap-1.5 w-36 animate-in fade-in zoom-in-95">
                <span className="text-[10px] text-slate-400 font-bold w-full mb-0.5">
                  Accent Color:
                </span>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onUpdateElement(element.id, { color: c }, true);
                      setShowColorPicker(false);
                    }}
                    className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition shadow-xs cursor-pointer"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Height adjustment */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded p-0.5">
            <button
              type="button"
              onClick={() =>
                onUpdateElement(element.id, {
                  height: Math.max(16, (element.height || 24) - 2)
                }, true)
              }
              className="p-0.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Decrease height"
            >
              <Minus size={11} />
            </button>
            <span className="text-[10px] font-mono px-1 min-w-[20px] text-center text-slate-200">
              {element.height || 24}h
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateElement(element.id, {
                  height: Math.min(60, (element.height || 24) + 2)
                }, true)
              }
              className="p-0.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Increase height"
            >
              <Plus size={11} />
            </button>
          </div>
        </div>
      )}

      {/* 6. QR Code / Barcode Size Controls */}
      {isQr && (
        <div className="flex items-center bg-slate-800 border border-slate-700 rounded p-0.5 shrink-0">
          <button
            type="button"
            onClick={() =>
              onUpdateElement(element.id, {
                width: Math.max(40, (element.width || 60) - 4),
                height: Math.max(40, (element.height || 60) - 4)
              }, true)
            }
            className="p-0.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Decrease size"
          >
            <Minus size={11} />
          </button>
          <span className="text-[10px] font-mono px-1 text-slate-200">Size</span>
          <button
            type="button"
            onClick={() =>
              onUpdateElement(element.id, {
                width: Math.min(140, (element.width || 60) + 4),
                height: Math.min(140, (element.height || 60) + 4)
              }, true)
            }
            className="p-0.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Increase size"
          >
            <Plus size={11} />
          </button>
        </div>
      )}

      <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5 shrink-0" />

      {/* 7. Common Actions: Layer Ordering */}
      <div className="flex items-center bg-slate-800/90 border border-slate-700/60 rounded p-0.5 gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onReorderElement(element.id, 'sendToBack')}
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 transition cursor-pointer ${
            (element.zIndex || 10) <= 5
              ? 'bg-amber-500/20 text-amber-300'
              : 'hover:bg-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Send to Back (Behind other layers)"
        >
          <ChevronsDown size={11} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <button
          type="button"
          onClick={() => onReorderElement(element.id, 'sendBackward')}
          className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
          title="Send Backward (Ctrl+[)"
        >
          <ArrowDown size={11} />
        </button>

        <button
          type="button"
          onClick={() => onReorderElement(element.id, 'bringForward')}
          className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
          title="Bring Forward (Ctrl+])"
        >
          <ArrowUp size={11} />
        </button>

        <button
          type="button"
          onClick={() => onReorderElement(element.id, 'bringToFront')}
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 transition cursor-pointer ${
            (element.zIndex || 10) >= 30
              ? 'bg-blue-500/20 text-blue-300'
              : 'hover:bg-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Bring to Front"
        >
          <ChevronsUp size={11} />
          <span className="hidden sm:inline">Front</span>
        </button>
      </div>

      {/* 8. Opacity Quick Presets */}
      <div className="flex items-center gap-0.5 bg-slate-800/90 border border-slate-700/60 rounded p-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onUpdateElement(element.id, { opacity: 1 }, true)}
          className={`px-1 py-0.5 rounded text-[9px] font-mono cursor-pointer ${
            element.opacity === undefined || element.opacity === 1
              ? 'bg-blue-600 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
          title="100% Solid"
        >
          100%
        </button>
        <button
          type="button"
          onClick={() => onUpdateElement(element.id, { opacity: 0.5 }, true)}
          className={`px-1 py-0.5 rounded text-[9px] font-mono cursor-pointer ${
            element.opacity === 0.5
              ? 'bg-blue-600 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
          title="50% Semi-transparent"
        >
          50%
        </button>
      </div>

      {/* 9. Lock / Unlock */}
      <button
        type="button"
        onClick={() => onToggleLock(element.id)}
        className={`p-1 rounded border border-slate-700 cursor-pointer shrink-0 ${
          element.locked
            ? 'text-amber-400 bg-amber-950/40 border-amber-500/40'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
        title={element.locked ? 'Unlock element' : 'Lock element position'}
      >
        {element.locked ? <Lock size={12} /> : <Unlock size={12} />}
      </button>

      {/* 10. Hide / Delete */}
      <button
        type="button"
        onClick={() => onHideElement(element.id)}
        className="p-1 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 rounded border border-slate-700 cursor-pointer shrink-0"
        title="Hide element"
      >
        <EyeOff size={12} />
      </button>

      {/* 11. Close / Deselect */}
      <button
        type="button"
        onClick={onDeselect}
        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-700 cursor-pointer shrink-0 ml-0.5"
        title="Deselect element (Esc)"
      >
        <X size={12} />
      </button>
    </div>
  );
}
