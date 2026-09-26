import React, { useState } from 'react';
import { X, Download, FileText, Image as ImageIcon, Printer, CheckCircle } from 'lucide-react';
import { exportStageToImage, downloadDataUrl, exportCardToPdf, printCardStage } from './editorUtils';

export default function ExportModal({
  isOpen,
  onClose,
  frontStageRef,
  backStageRef,
  orientation,
  activeStudent
}) {
  const [selectedFormat, setSelectedFormat] = useState('png'); // 'png' | 'jpg' | 'pdf'
  const [exportSide, setExportSide] = useState('both'); // 'front' | 'back' | 'both'
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExecuteExport = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      const studentPrefix = (activeStudent?.fullName || 'student').toLowerCase().replace(/\s+/g, '-');

      if (selectedFormat === 'pdf') {
        if (exportSide === 'front' || exportSide === 'both') {
          exportCardToPdf(frontStageRef, `${studentPrefix}-id-front.pdf`, orientation);
        }
        if (exportSide === 'back' || exportSide === 'both') {
          exportCardToPdf(backStageRef, `${studentPrefix}-id-back.pdf`, orientation);
        }
      } else {
        const ext = selectedFormat === 'jpg' ? 'jpeg' : 'png';
        if (exportSide === 'front' || exportSide === 'both') {
          const frontUrl = exportStageToImage(frontStageRef, ext, 3);
          if (frontUrl) downloadDataUrl(frontUrl, `${studentPrefix}-id-front.${selectedFormat}`);
        }
        if (exportSide === 'back' || exportSide === 'both') {
          const backUrl = exportStageToImage(backStageRef, ext, 3);
          if (backUrl) downloadDataUrl(backUrl, `${studentPrefix}-id-back.${selectedFormat}`);
        }
      }

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Download size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Export ID Card</h3>
              <p className="text-xs text-slate-500">Produce high-resolution printable assets</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Format Selection */}
        <div className="py-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Output Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedFormat('png')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition ${
                  selectedFormat === 'png'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <ImageIcon size={20} className="text-blue-600" />
                <span className="text-xs">PNG</span>
                <span className="text-[10px] text-slate-400 font-normal">HD Raster</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('jpg')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition ${
                  selectedFormat === 'jpg'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <ImageIcon size={20} className="text-emerald-600" />
                <span className="text-xs">JPG</span>
                <span className="text-[10px] text-slate-400 font-normal">Compact</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('pdf')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition ${
                  selectedFormat === 'pdf'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <FileText size={20} className="text-purple-600" />
                <span className="text-xs">PDF</span>
                <span className="text-[10px] text-slate-400 font-normal">CR80 Print</span>
              </button>
            </div>
          </div>

          {/* Side Selection */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Card Sides to Include
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setExportSide('both')}
                className={`py-2 px-3 rounded-xl border transition ${
                  exportSide === 'both'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                Both Sides
              </button>
              <button
                type="button"
                onClick={() => setExportSide('front')}
                className={`py-2 px-3 rounded-xl border transition ${
                  exportSide === 'front'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                Front Only
              </button>
              <button
                type="button"
                onClick={() => setExportSide('back')}
                className={`py-2 px-3 rounded-xl border transition ${
                  exportSide === 'back'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                Back Only
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
            Export generates clean, edge-to-edge card artwork without editor rulers, grid, or selection boxes at 300 DPI print quality.
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleExecuteExport}
            disabled={isExporting}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle size={18} className="text-emerald-300" />
                <span>Download Ready!</span>
              </>
            ) : isExporting ? (
              <span>Generating {selectedFormat.toUpperCase()}...</span>
            ) : (
              <>
                <Download size={18} />
                <span>Download {selectedFormat.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
