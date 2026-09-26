import React, { useState } from 'react';
import { X, Download, Printer, UserCheck, RefreshCw } from 'lucide-react';
import { exportStageToImage, downloadDataUrl, printCardStage } from './editorUtils';

export default function PreviewModal({
  isOpen,
  onClose,
  frontStageRef,
  backStageRef,
  currentSide,
  onToggleSide,
  orientation,
  activeStudent,
  onSelectStudent,
  studentList = []
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full p-6 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck size={20} className="text-blue-600 dark:text-blue-400" />
              <span>Realistic ID Card Preview</span>
            </h3>
            <p className="text-xs text-slate-500">
              Card preview with dynamic data placeholders populated in real-time.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls Bar: Front/Back & Profile Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          {/* Side Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onToggleSide('front')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                currentSide === 'front'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              FRONT SIDE
            </button>
            <button
              type="button"
              onClick={() => onToggleSide('back')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                currentSide === 'back'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              BACK SIDE
            </button>
          </div>

          {/* Student Profile Switcher */}
          {studentList.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Test Data Profile:</span>
              <select
                value={activeStudent?.rollNumber || ''}
                onChange={(e) => {
                  const found = studentList.find((s) => s.rollNumber === e.target.value);
                  if (found) onSelectStudent(found);
                }}
                className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              >
                {studentList.map((s) => (
                  <option key={s.rollNumber} value={s.rollNumber}>
                    {s.fullName} ({s.rollNumber})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Preview Card Display Area */}
        <div className="flex-1 min-h-[380px] bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center p-6 overflow-hidden">
          <div className="shadow-2xl rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800">
            {/* The active stage snapshot image is rendered cleanly */}
            {(() => {
              const activeRef = currentSide === 'front' ? frontStageRef : backStageRef;
              const imgData = exportStageToImage(activeRef, 'png', 2);
              if (imgData) {
                return (
                  <img
                    src={imgData}
                    alt="ID Card Preview"
                    className="max-w-full h-auto object-contain block select-none"
                    style={{ maxHeight: '420px' }}
                  />
                );
              }
              return (
                <div className="p-12 text-slate-400 text-sm">
                  Render in progress...
                </div>
              );
            })()}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 mt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono">
            Standard CR80 85.60 × 53.98 mm • 300 DPI Export Ready
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const activeRef = currentSide === 'front' ? frontStageRef : backStageRef;
                printCardStage(activeRef, orientation);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const activeRef = currentSide === 'front' ? frontStageRef : backStageRef;
                const dataUrl = exportStageToImage(activeRef, 'png', 3);
                if (dataUrl) downloadDataUrl(dataUrl, `id-card-${currentSide}.png`);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition"
            >
              <Download size={15} />
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
