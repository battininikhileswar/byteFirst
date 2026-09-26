import React from 'react';

/**
 * Alignment & Center Snap Guides for the interactive ID card canvas.
 */
export default function AlignmentGuides({ activeGuides, cardWidth, cardHeight }) {
  if (!activeGuides) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {/* Center Vertical Guide */}
      {activeGuides.centerX && (
        <div
          className="absolute top-0 bottom-0 w-[1.5px] bg-sky-500 shadow-sm transition-all"
          style={{ left: `${Math.round(cardWidth / 2)}px` }}
        >
          <span className="absolute top-2 left-1 text-[8px] font-mono text-sky-500 bg-white/90 px-1 rounded shadow-xs">
            Center
          </span>
        </div>
      )}

      {/* Center Horizontal Guide */}
      {activeGuides.centerY && (
        <div
          className="absolute left-0 right-0 h-[1.5px] bg-sky-500 shadow-sm transition-all"
          style={{ top: `${Math.round(cardHeight / 2)}px` }}
        >
          <span className="absolute left-2 -top-3.5 text-[8px] font-mono text-sky-500 bg-white/90 px-1 rounded shadow-xs">
            Center
          </span>
        </div>
      )}

      {/* Edge Snaps */}
      {activeGuides.leftEdge && (
        <div className="absolute top-0 bottom-0 left-4 w-[1px] border-l border-dashed border-sky-400" />
      )}
      {activeGuides.rightEdge && (
        <div className="absolute top-0 bottom-0 right-4 w-[1px] border-r border-dashed border-sky-400" />
      )}
      {activeGuides.topEdge && (
        <div className="absolute left-0 right-0 top-4 h-[1px] border-t border-dashed border-sky-400" />
      )}
      {activeGuides.bottomEdge && (
        <div className="absolute left-0 right-0 bottom-4 h-[1px] border-b border-dashed border-sky-400" />
      )}
    </div>
  );
}
