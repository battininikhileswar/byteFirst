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
  Undo2,
  Redo2,
  RotateCcw,
  Sparkles
} from 'lucide-react';

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

export const ELEMENT_TO_FIELD_MAP = {
  studentName: 'fullName',
  rollNumber: 'rollNumber',
  collegeName: 'collegeName',
  branch: 'branch',
  yearSection: 'year',
  email: 'email',
  phone: 'phone',
  bloodGroup: 'bloodGroup',
  address: 'address',
  collegeTagline: 'collegeTagline',
  idRibbon: 'idRibbon'
};

export default function ElementToolbar({
  element,
  studentData = {},
  onUpdateStudentField,
  onUpdateStyle,
  onReorder,
  onToggleLock,
  onHide,
  onDeselect,
  onPhotoUpload,
  onLogoUpload,
  // Studio navigation props when no element is selected
  cardOrientation = 'horizontal',
  onOrientationChange,
  isFlipped = false,
  onToggleFlip,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onResetDesign
}) {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);

  const photoInputRef = useRef(null);
  const logoInputRef = useRef(null);

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

  // IF NO ELEMENT IS SELECTED: Render default canvas studio bar
  if (!element) {
    return (
      <div className="w-full flex flex-wrap items-center justify-between gap-2.5 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
        {/* Undo / Redo & Reset */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 disabled:opacity-40 transition shadow-2xs cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 disabled:opacity-40 transition shadow-2xs cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={15} />
          </button>
          <button
            type="button"
            onClick={onResetDesign}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-600 transition shadow-2xs flex items-center gap-1 ml-1 cursor-pointer"
            title="Reset design layout"
          >
            <RotateCcw size={14} />
            <span className="text-[11px] font-semibold hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Studio Center Hint */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
          <Sparkles size={13} className="text-blue-500" />
          <span>Click any element on the card to edit its text, styling, photo, or layers</span>
        </div>

        {/* Orientation & Flip Toggles */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onOrientationChange && onOrientationChange('horizontal')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                cardOrientation === 'horizontal'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Landscape
            </button>
            <button
              type="button"
              onClick={() => onOrientationChange && onOrientationChange('vertical')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                cardOrientation === 'vertical'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Portrait
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleFlip}
            className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-2xs cursor-pointer"
          >
            {isFlipped ? 'Show Front' : 'Show Back'}
          </button>
        </div>
      </div>
    );
  }

  // WHEN AN ELEMENT IS SELECTED: Render the complete Active Canvas Editor Bar
  const isPhoto = element.id === 'studentPhoto' || (element.type === 'image' && element.id?.toLowerCase().includes('photo'));
  const isLogo = element.id === 'collegeEmblem' || element.id === 'collegeLogo' || (element.type === 'icon' && element.id?.toLowerCase().includes('emblem'));
  const isText = element.type === 'text' || element.type === 'badge';

  const mappedField = ELEMENT_TO_FIELD_MAP[element.id];
  const currentTextValue = mappedField && studentData[mappedField] !== undefined
    ? studentData[mappedField]
    : element.customText || '';

  const currentBorderWidth = element.borderWidth !== undefined ? element.borderWidth : 2;

  const handleTextChange = (e) => {
    const val = e.target.value;
    if (mappedField && onUpdateStudentField) {
      onUpdateStudentField(mappedField, val);
    }
    if (onUpdateStyle) {
      onUpdateStyle(element.id, { customText: val });
    }
  };

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-blue-500/40 bg-slate-900 text-white rounded-xl p-2.5 shadow-lg animate-in fade-in duration-150 text-xs select-none">
      {/* Hidden File Inputs for Direct Photo & Logo Replacement */}
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

      {/* LEFT: Element Tag & Direct Value Editor */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Element Badge */}
        <div className="flex items-center gap-1.5 bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
          {isPhoto ? <Camera size={13} /> : isLogo ? <Upload size={13} /> : <Type size={13} />}
          <span>{element.label || element.id}</span>
        </div>

        {/* Text Input for instant text editing */}
        {isText && mappedField && (
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Edit Text:</span>
            <input
              type="text"
              value={currentTextValue}
              onChange={handleTextChange}
              placeholder="Type value..."
              className="bg-transparent text-white text-xs font-semibold focus:outline-none w-36 sm:w-52"
            />
          </div>
        )}

        {/* Photo Controls */}
        {isPhoto && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Upload new student photo"
            >
              <Camera size={13} />
              <span>Change Photo</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateStyle(element.id, {
                  shape: element.shape === 'circle' ? 'square' : 'circle'
                })
              }
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
              title={element.shape === 'circle' ? 'Switch to Rounded Square' : 'Switch to Circle'}
            >
              {element.shape === 'circle' ? <Circle size={13} className="text-blue-400" /> : <Square size={13} className="text-blue-400" />}
              <span className="capitalize">{element.shape === 'circle' ? 'Circle' : 'Square'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextWidth = currentBorderWidth === 0 ? 2 : currentBorderWidth === 2 ? 4 : 0;
                onUpdateStyle(element.id, { borderWidth: nextWidth });
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-mono transition border border-slate-700 cursor-pointer"
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
                  setShowTextColorPicker(false);
                }}
                className="p-1.5 hover:bg-slate-800 rounded-lg flex items-center gap-1 text-slate-300 border border-slate-700 cursor-pointer"
                title="Change photo border color"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                  style={{ backgroundColor: element.borderColor || '#38bdf8' }}
                />
              </button>

              {showBorderColorPicker && (
                <div className="absolute top-10 left-0 z-50 p-2 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl flex flex-wrap gap-1.5 w-36 animate-in fade-in zoom-in-95">
                  <span className="text-[10px] text-slate-400 font-bold w-full mb-1">Border Color:</span>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        onUpdateStyle(element.id, { borderColor: c });
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

        {/* Logo Controls */}
        {isLogo && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Upload new institution logo"
            >
              <Upload size={13} />
              <span>Change Logo</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateStyle(element.id, { rotation: ((element.rotation || 0) + 15) % 360 })}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white flex items-center gap-1 border border-slate-700 cursor-pointer"
              title="Rotate 15°"
            >
              <RotateCw size={13} />
              <span className="text-[10px] font-mono">{element.rotation || 0}°</span>
            </button>
          </div>
        )}
      </div>

      {/* MIDDLE: Typography & Formatting */}
      {isText && (
        <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 rounded-lg p-1">
          {/* Font Size decrease */}
          <button
            type="button"
            onClick={() => onUpdateStyle(element.id, { fontSize: Math.max(8, (element.fontSize || 14) - 1) })}
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Decrease font size"
          >
            <Minus size={12} />
          </button>
          <span className="text-[11px] font-mono w-5 text-center text-slate-200">
            {element.fontSize || 14}
          </span>
          {/* Font Size increase */}
          <button
            type="button"
            onClick={() => onUpdateStyle(element.id, { fontSize: Math.min(44, (element.fontSize || 14) + 1) })}
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Increase font size"
          >
            <Plus size={12} />
          </button>

          <div className="h-4 w-[1px] bg-slate-700 mx-0.5" />

          {/* Bold */}
          <button
            type="button"
            onClick={() =>
              onUpdateStyle(element.id, {
                fontWeight: element.fontWeight === 'bold' || element.fontWeight >= 700 ? '400' : '800'
              })
            }
            className={`p-1 rounded cursor-pointer ${
              element.fontWeight === 'bold' || element.fontWeight >= 700
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-700 text-slate-300'
            }`}
            title="Bold"
          >
            <Bold size={13} />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() =>
              onUpdateStyle(element.id, {
                fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic'
              })
            }
            className={`p-1 rounded cursor-pointer ${
              element.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'
            }`}
            title="Italic"
          >
            <Italic size={13} />
          </button>

          {/* Text Alignment */}
          <button
            type="button"
            onClick={() =>
              onUpdateStyle(element.id, {
                textAlign:
                  element.textAlign === 'left' ? 'center' : element.textAlign === 'center' ? 'right' : 'left'
              })
            }
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
            title={`Align: ${element.textAlign || 'left'}`}
          >
            {element.textAlign === 'center' ? (
              <AlignCenter size={13} />
            ) : element.textAlign === 'right' ? (
              <AlignRight size={13} />
            ) : (
              <AlignLeft size={13} />
            )}
          </button>

          {/* Text Color Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowTextColorPicker(!showTextColorPicker);
                setShowBorderColorPicker(false);
              }}
              className="p-1 hover:bg-slate-700 rounded flex items-center gap-1 text-slate-300 cursor-pointer"
              title="Text Color"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                style={{ backgroundColor: element.color || '#ffffff' }}
              />
            </button>

            {showTextColorPicker && (
              <div className="absolute top-10 left-0 z-50 p-2 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl flex flex-wrap gap-1.5 w-36 animate-in fade-in zoom-in-95">
                <span className="text-[10px] text-slate-400 font-bold w-full mb-1">Text Color:</span>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onUpdateStyle(element.id, { color: c });
                      setShowTextColorPicker(false);
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

      {/* RIGHT: Figma Layers, Opacity, Lock, and Deselect */}
      <div className="flex items-center gap-1.5">
        {/* Figma Layer Ordering */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-lg p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => onReorder(element.id, 'sendToBack')}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition cursor-pointer ${
              (element.zIndex || 10) <= 5
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Send to Back (Background behind text & photo)"
          >
            <ChevronsDown size={12} />
            <span>To Back</span>
          </button>

          <button
            type="button"
            onClick={() => onReorder(element.id, 'bringToFront')}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition cursor-pointer ${
              (element.zIndex || 10) >= 30
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Bring to Front (Foreground in front of all)"
          >
            <ChevronsUp size={12} />
            <span>To Front</span>
          </button>

          <button
            type="button"
            onClick={() => onReorder(element.id, 'bringForward')}
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Bring Forward (Ctrl+])"
          >
            <ArrowUp size={12} />
          </button>
          <button
            type="button"
            onClick={() => onReorder(element.id, 'sendBackward')}
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Send Backward (Ctrl+[)"
          >
            <ArrowDown size={12} />
          </button>
        </div>

        {/* Opacity / Watermark */}
        <div className="flex items-center gap-0.5 bg-slate-800/80 border border-slate-700/60 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => onUpdateStyle(element.id, { opacity: 1 })}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
              element.opacity === undefined || element.opacity === 1
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="100% Solid"
          >
            100%
          </button>
          <button
            type="button"
            onClick={() => onUpdateStyle(element.id, { opacity: 0.5 })}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
              element.opacity === 0.5
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="50% Semi-transparent"
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => onUpdateStyle(element.id, { opacity: 0.2 })}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
              element.opacity === 0.2
                ? 'bg-amber-600 text-white font-bold'
                : 'text-amber-400 hover:text-amber-300 hover:bg-slate-700'
            }`}
            title="20% Watermark"
          >
            20%
          </button>
        </div>

        {/* Lock */}
        <button
          type="button"
          onClick={() => onToggleLock(element.id)}
          className={`p-1.5 rounded-lg border border-slate-700 cursor-pointer ${
            element.locked ? 'text-amber-400 bg-amber-950/40' : 'text-slate-300 hover:bg-slate-800'
          }`}
          title={element.locked ? 'Unlock element' : 'Lock element position'}
        >
          {element.locked ? <Lock size={13} /> : <Unlock size={13} />}
        </button>

        {/* Hide */}
        <button
          type="button"
          onClick={() => onHide(element.id)}
          className="p-1.5 hover:bg-red-950/40 text-slate-300 hover:text-rose-400 rounded-lg border border-slate-700 cursor-pointer"
          title="Hide element"
        >
          <EyeOff size={13} />
        </button>

        {/* Close / Deselect */}
        <button
          type="button"
          onClick={onDeselect}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-700 ml-0.5 cursor-pointer"
          title="Done editing / Deselect"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
