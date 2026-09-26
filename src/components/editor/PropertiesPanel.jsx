import React from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Layers,
  Sparkles,
  Maximize2
} from 'lucide-react';

const FONT_FAMILIES = [
  'Plus Jakarta Sans',
  'Inter',
  'JetBrains Mono',
  'Roboto',
  'Montserrat',
  'Poppins',
  'Arial',
  'Georgia',
  'Times New Roman'
];

export default function PropertiesPanel({
  selectedElement,
  onUpdateElement,
  onReorderElement,
  onToggleLock,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  cardWidth,
  cardHeight,
  orientation,
  totalElementsCount
}) {
  if (!selectedElement) {
    return (
      <div className="w-80 h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 select-none flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Layers size={14} />
            <span>Card Canvas Specs</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Standard Spec:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">ISO/IEC 7810 CR80</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Physical Size:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">85.60 × 53.98 mm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Canvas Dimensions:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                {cardWidth} × {cardHeight} px
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Orientation:</span>
              <span className="font-bold capitalize text-slate-800 dark:text-slate-200">{orientation}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Active Elements:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{totalElementsCount}</span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">No Element Selected</p>
            <p className="leading-relaxed">
              Click any element on the canvas to inspect and modify its typography, position, color, and layer settings.
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-medium text-center">
          ProTip: Double click any text element to edit in-place directly on canvas.
        </div>
      </div>
    );
  }

  const { id, type, name } = selectedElement;

  return (
    <div className="w-80 h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col z-20 select-none">
      {/* Element Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[170px]">
            {name || `${type.toUpperCase()} Element`}
          </p>
          <p className="text-[10px] text-slate-500 font-mono capitalize">{type}</p>
        </div>

        {/* Quick Toolbar for Element */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleLock(id)}
            className={`p-1.5 rounded-lg transition ${
              selectedElement.locked
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={selectedElement.locked ? 'Unlock Element' : 'Lock Element'}
          >
            {selectedElement.locked ? <Lock size={15} /> : <Unlock size={15} />}
          </button>

          <button
            type="button"
            onClick={() => onToggleVisibility(id)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Hide Element"
          >
            {selectedElement.visible === false ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>

          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Duplicate"
          >
            <Copy size={15} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Properties Scroll Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Transform & Geometry */}
        <div>
          <p className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">Geometry</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">X Position</label>
              <input
                type="number"
                value={Math.round(selectedElement.x || 0)}
                onChange={(e) => onUpdateElement(id, { x: parseFloat(e.target.value) || 0 })}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">Y Position</label>
              <input
                type="number"
                value={Math.round(selectedElement.y || 0)}
                onChange={(e) => onUpdateElement(id, { y: parseFloat(e.target.value) || 0 })}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">Width</label>
              <input
                type="number"
                value={Math.round(selectedElement.width || 0)}
                onChange={(e) => onUpdateElement(id, { width: Math.max(10, parseFloat(e.target.value) || 10) })}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">Height</label>
              <input
                type="number"
                value={Math.round(selectedElement.height || 0)}
                onChange={(e) => onUpdateElement(id, { height: Math.max(10, parseFloat(e.target.value) || 10) })}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Rotation & Opacity */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] text-slate-500">Rotation</label>
              <span className="font-mono text-slate-700 dark:text-slate-300">{Math.round(selectedElement.rotation || 0)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={Math.round(selectedElement.rotation || 0)}
              onChange={(e) => onUpdateElement(id, { rotation: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] text-slate-500">Opacity</label>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {Math.round((selectedElement.opacity !== undefined ? selectedElement.opacity : 1) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={selectedElement.opacity !== undefined ? selectedElement.opacity : 1}
              onChange={(e) => onUpdateElement(id, { opacity: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        {/* ================= TEXT SPECIFIC ================= */}
        {type === 'text' && (
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Typography</p>

            {/* Text string input */}
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Text Content</label>
              <textarea
                rows={2}
                value={selectedElement.text || ''}
                onChange={(e) => onUpdateElement(id, { text: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-sans text-xs"
              />
            </div>

            {/* Font Family */}
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Font Family</label>
              <select
                value={selectedElement.fontFamily || 'Plus Jakarta Sans'}
                onChange={(e) => onUpdateElement(id, { fontFamily: e.target.value })}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                {FONT_FAMILIES.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size & Weight */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Size (px)</label>
                <input
                  type="number"
                  min="8"
                  max="120"
                  value={selectedElement.fontSize || 14}
                  onChange={(e) => onUpdateElement(id, { fontSize: parseInt(e.target.value, 10) || 14 })}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Weight</label>
                <select
                  value={selectedElement.fontWeight || 'normal'}
                  onChange={(e) => onUpdateElement(id, { fontWeight: e.target.value })}
                  className="w-full py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <option value="normal">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semibold (600)</option>
                  <option value="bold">Bold (700)</option>
                  <option value="800">Extra Bold (800)</option>
                </select>
              </div>
            </div>

            {/* Formatting & Alignment Toolbar */}
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onUpdateElement(id, { italic: !selectedElement.italic })}
                  className={`p-1.5 rounded-lg transition ${
                    selectedElement.italic
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Italic"
                >
                  <Italic size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateElement(id, { underline: !selectedElement.underline })}
                  className={`p-1.5 rounded-lg transition ${
                    selectedElement.underline
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Underline"
                >
                  <Underline size={14} />
                </button>
              </div>

              <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700" />

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onUpdateElement(id, { align: 'left' })}
                  className={`p-1.5 rounded-lg transition ${
                    selectedElement.align === 'left' || !selectedElement.align
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Align Left"
                >
                  <AlignLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateElement(id, { align: 'center' })}
                  className={`p-1.5 rounded-lg transition ${
                    selectedElement.align === 'center'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Align Center"
                >
                  <AlignCenter size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateElement(id, { align: 'right' })}
                  className={`p-1.5 rounded-lg transition ${
                    selectedElement.align === 'right'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Align Right"
                >
                  <AlignRight size={14} />
                </button>
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedElement.fill || '#0f172a'}
                  onChange={(e) => onUpdateElement(id, { fill: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={selectedElement.fill || '#0f172a'}
                  onChange={(e) => onUpdateElement(id, { fill: e.target.value })}
                  className="flex-1 py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= SHAPE SPECIFIC ================= */}
        {type === 'shape' && (
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Shape Styling</p>

            {/* Fill Color */}
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Fill Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedElement.fill || '#3b82f6'}
                  onChange={(e) => onUpdateElement(id, { fill: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={selectedElement.fill || '#3b82f6'}
                  onChange={(e) => onUpdateElement(id, { fill: e.target.value })}
                  className="flex-1 py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                />
              </div>
            </div>

            {/* Corner Radius (if rect) */}
            {selectedElement.shapeType !== 'circle' && selectedElement.shapeType !== 'line' && (
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Corner Radius (px)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={selectedElement.cornerRadius || 0}
                  onChange={(e) => onUpdateElement(id, { cornerRadius: parseInt(e.target.value, 10) || 0 })}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                />
              </div>
            )}

            {/* Stroke Border */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Border Width</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={selectedElement.strokeWidth || 0}
                  onChange={(e) => onUpdateElement(id, { strokeWidth: parseInt(e.target.value, 10) || 0 })}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Border Color</label>
                <input
                  type="color"
                  value={selectedElement.stroke || '#000000'}
                  onChange={(e) => onUpdateElement(id, { stroke: e.target.value })}
                  className="w-full h-8 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= IMAGE SPECIFIC ================= */}
        {(type === 'image' || type === 'profile-photo' || type === 'logo') && (
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Photo & Crop</p>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Shape Crop</label>
              <div className="grid grid-cols-3 gap-1.5 font-bold text-[11px]">
                <button
                  type="button"
                  onClick={() => onUpdateElement(id, { clipType: 'square', cornerRadius: 0 })}
                  className={`py-1.5 rounded-lg border transition ${
                    selectedElement.clipType === 'square' || !selectedElement.clipType
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Square
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateElement(id, { clipType: 'rounded', cornerRadius: 16 })}
                  className={`py-1.5 rounded-lg border transition ${
                    selectedElement.clipType === 'rounded'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Rounded
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateElement(id, { clipType: 'circle' })}
                  className={`py-1.5 rounded-lg border transition ${
                    selectedElement.clipType === 'circle'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Circle
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Border Frame</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={selectedElement.borderWidth || 0}
                  onChange={(e) => onUpdateElement(id, { borderWidth: parseInt(e.target.value, 10) || 0 })}
                  placeholder="Width"
                  className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                />
                <input
                  type="color"
                  value={selectedElement.borderColor || '#3b82f6'}
                  onChange={(e) => onUpdateElement(id, { borderColor: e.target.value })}
                  className="w-full h-8 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= QR SPECIFIC ================= */}
        {type === 'qr' && (
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">QR Code Settings</p>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Encoded Value or URL</label>
              <input
                type="text"
                value={selectedElement.value || ''}
                onChange={(e) => onUpdateElement(id, { value: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* ================= BARCODE SPECIFIC ================= */}
        {type === 'barcode' && (
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Barcode Settings</p>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Barcode Value / ID</label>
              <input
                type="text"
                value={selectedElement.value || ''}
                onChange={(e) => onUpdateElement(id, { value: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* ================= LAYER ORDERING ================= */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">Layer Arrangement</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onReorderElement(id, 'bringToFront')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 flex items-center justify-center gap-1.5 transition"
            >
              <ChevronsUp size={14} className="text-blue-500" />
              <span>To Front</span>
            </button>
            <button
              type="button"
              onClick={() => onReorderElement(id, 'sendToBack')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 flex items-center justify-center gap-1.5 transition"
            >
              <ChevronsDown size={14} className="text-blue-500" />
              <span>To Back</span>
            </button>
            <button
              type="button"
              onClick={() => onReorderElement(id, 'bringForward')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 flex items-center justify-center gap-1.5 transition"
            >
              <ArrowUp size={14} />
              <span>Forward</span>
            </button>
            <button
              type="button"
              onClick={() => onReorderElement(id, 'sendBackward')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 flex items-center justify-center gap-1.5 transition"
            >
              <ArrowDown size={14} />
              <span>Backward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
