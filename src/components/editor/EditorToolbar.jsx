import React from 'react';
import { Link } from 'react-router-dom';
import {
  Undo2,
  Redo2,
  Copy,
  Trash2,
  Eye,
  Save,
  Download,
  Printer,
  CreditCard,
  ArrowLeft,
  Smartphone,
  Layers,
  Sparkles
} from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

export default function EditorToolbar({
  side,
  onToggleSide,
  orientation,
  onToggleOrientation,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  selectedCount,
  onDuplicate,
  onDelete,
  onOpenPreview,
  onSave,
  onOpenExport,
  onPrint
}) {
  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Brand & Back to Home */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 group" title="Return to Home">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
            <CreditCard size={18} />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white hidden sm:inline">
            Aunty<span className="text-blue-600 dark:text-blue-400">ID</span>
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              CANVAS STUDIO
            </span>
          </span>
        </Link>

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block" />

        {/* History Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={17} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={17} />
          </button>
        </div>

        {/* Selected actions: Duplicate / Delete */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
            <button
              type="button"
              onClick={onDuplicate}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Duplicate (Ctrl+D)"
            >
              <Copy size={16} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Delete (Delete)"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Center: Front / Back Toggle & Orientation */}
      <div className="flex items-center gap-3">
        {/* Front / Back Side Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => onToggleSide('front')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              side === 'front'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            [ FRONT ]
          </button>
          <button
            type="button"
            onClick={() => onToggleSide('back')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              side === 'back'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            [ BACK ]
          </button>
        </div>

        {/* Orientation Switcher */}
        <button
          type="button"
          onClick={onToggleOrientation}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 hidden md:flex items-center gap-1.5"
          title={`Switch to ${orientation === 'landscape' ? 'Portrait' : 'Landscape'}`}
        >
          <Smartphone size={14} className={orientation === 'landscape' ? 'rotate-90' : ''} />
          <span>{orientation === 'landscape' ? 'Landscape' : 'Portrait'}</span>
        </button>
      </div>

      {/* Right: Preview, Save, Export, Print */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Preview Button */}
        <button
          type="button"
          onClick={onOpenPreview}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs flex items-center gap-1.5 transition"
        >
          <Eye size={15} className="text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        {/* Save Button */}
        <button
          type="button"
          onClick={onSave}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs flex items-center gap-1.5 transition"
          title="Save Design (JSON / Storage)"
        >
          <Save size={15} className="text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Print Button */}
        <button
          type="button"
          onClick={onPrint}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition"
          title="Print ID Card"
        >
          <Printer size={15} />
        </button>

        {/* Export Button */}
        <button
          type="button"
          onClick={onOpenExport}
          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition active:scale-95"
        >
          <Download size={15} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
