import React, { useState } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Edit2,
  Check,
  Type,
  Image as ImageIcon,
  Square,
  QrCode,
  Barcode as BarcodeIcon
} from 'lucide-react';

export default function LayersPanel({
  elements = [],
  selectedIds = [],
  onSelectElement,
  onReorderElement,
  onToggleLock,
  onToggleVisibility,
  onRenameElement
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const getElementIcon = (type) => {
    switch (type) {
      case 'text':
        return <Type size={14} className="text-blue-500" />;
      case 'image':
      case 'profile-photo':
      case 'logo':
        return <ImageIcon size={14} className="text-emerald-500" />;
      case 'shape':
        return <Square size={14} className="text-purple-500" />;
      case 'qr':
        return <QrCode size={14} className="text-sky-500" />;
      case 'barcode':
        return <BarcodeIcon size={14} className="text-indigo-500" />;
      default:
        return <Layers size={14} className="text-slate-400" />;
    }
  };

  const handleStartRename = (el) => {
    setEditingId(el.id);
    setEditingName(el.name || el.type);
  };

  const handleSaveRename = (id) => {
    if (editingName.trim()) {
      onRenameElement(id, editingName.trim());
    }
    setEditingId(null);
  };

  // Elements are rendered in visual stack order: top-most element first in layer list
  const reversedElements = [...elements].reverse();

  return (
    <div className="p-3 space-y-2 select-none">
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        <span>Layers Stack ({elements.length})</span>
        <span className="text-[10px] text-slate-400 font-normal">Top to Bottom</span>
      </div>

      {elements.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          No elements on canvas
        </div>
      ) : (
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {reversedElements.map((el, idx) => {
            const isSelected = selectedIds.includes(el.id);
            const isEditing = editingId === el.id;

            return (
              <div
                key={el.id}
                onClick={() => onSelectElement([el.id])}
                className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 font-semibold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getElementIcon(el.type)}

                  {isEditing ? (
                    <input
                      autoFocus
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleSaveRename(el.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(el.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="py-0.5 px-1.5 rounded border border-blue-500 text-xs w-full bg-white dark:bg-slate-800"
                    />
                  ) : (
                    <span className="truncate max-w-[120px]">
                      {el.name || `${el.type} (${el.id.slice(0, 4)})`}
                    </span>
                  )}
                </div>

                {/* Layer Quick Controls */}
                <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => handleStartRename(el)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 transition"
                      title="Rename Layer"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onToggleVisibility(el.id)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 transition"
                    title={el.visible === false ? 'Show' : 'Hide'}
                  >
                    {el.visible === false ? <EyeOff size={13} className="text-amber-500" /> : <Eye size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleLock(el.id)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 transition"
                    title={el.locked ? 'Unlock' : 'Lock'}
                  >
                    {el.locked ? <Lock size={13} className="text-amber-500" /> : <Unlock size={13} />}
                  </button>

                  {/* Move Up / Down */}
                  <button
                    type="button"
                    onClick={() => onReorderElement(el.id, 'bringForward')}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 transition"
                    title="Bring Forward"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onReorderElement(el.id, 'sendBackward')}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 transition"
                    title="Send Backward"
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
