import React, { useRef, useState, useEffect } from 'react';
import CanvasStage from './CanvasStage';
import { ZoomIn, ZoomOut, Maximize2, Move, Grid, Magnet } from 'lucide-react';

export default function CanvasWorkspace({
  stageRef,
  cardWidth,
  cardHeight,
  background,
  elements,
  selectedIds,
  onSelectElement,
  onUpdateElement,
  snapGrid,
  showGrid,
  onToggleGrid,
  onToggleSnap,
  showGuides,
  isPreview,
  activeData,
  zoom,
  onZoomChange,
  side
}) {
  const containerRef = useRef(null);
  const [editingTextElement, setEditingTextElement] = useState(null);
  const [inlineEditText, setInlineEditText] = useState('');
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Listen for space key to trigger pan mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handlePointerDown = (e) => {
    if (isSpacePressed) {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y
      };
    }
  };

  const handlePointerMove = (e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      });
    }
  };

  const handlePointerUp = () => {
    setIsPanning(false);
  };

  // Double click text handler for in-place direct editing
  const handleDoubleClickText = (elem) => {
    setEditingTextElement(elem);
    setInlineEditText(elem.text);
  };

  const handleSaveInlineText = () => {
    if (editingTextElement) {
      onUpdateElement(editingTextElement.id, { text: inlineEditText });
      setEditingTextElement(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 h-full w-full overflow-hidden flex items-center justify-center select-none bg-slate-100 dark:bg-slate-950 transition-colors ${
        isSpacePressed ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        backgroundImage: showGrid
          ? 'radial-gradient(circle, rgba(148, 163, 184, 0.3) 1px, transparent 1px)'
          : 'none',
        backgroundSize: '20px 20px'
      }}
    >
      {/* Floating Canvas Quick Controls (Zoom, Grid, Snap) */}
      <div className="absolute bottom-5 right-6 z-30 flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(0.4, Number((zoom - 0.1).toFixed(2))))}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          title="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>
        <span className="w-12 text-center font-mono text-[11px] font-bold">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(2.5, Number((zoom + 0.1).toFixed(2))))}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          title="Zoom In"
        >
          <ZoomIn size={15} />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => {
            onZoomChange(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          title="Reset Zoom & Pan (100%)"
        >
          <Maximize2 size={14} />
        </button>

        <button
          type="button"
          onClick={onToggleGrid}
          className={`p-1 rounded-full transition ${
            showGrid ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={showGrid ? 'Hide Grid' : 'Show Grid'}
        >
          <Grid size={14} />
        </button>

        <button
          type="button"
          onClick={onToggleSnap}
          className={`p-1 rounded-full transition ${
            snapGrid ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={snapGrid ? 'Snap to Grid ON' : 'Snap to Grid OFF'}
        >
          <Magnet size={14} />
        </button>
      </div>

      {/* Side Badge Indicator */}
      <div className="absolute top-4 left-6 z-30 flex items-center gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-blue-600 text-white shadow-md">
          {side.toUpperCase()} SIDE
        </span>
        <span className="text-[11px] text-slate-500 font-mono bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          CR80: {cardWidth} × {cardHeight} px
        </span>
      </div>

      {/* Center Card Container with Pan & Zoom Transform */}
      <div
        className="relative transition-transform duration-75"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        <CanvasStage
          stageRef={stageRef}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          background={background}
          elements={elements}
          selectedIds={selectedIds}
          onSelectElement={onSelectElement}
          onUpdateElement={onUpdateElement}
          snapGrid={snapGrid}
          showGuides={showGuides}
          isPreview={isPreview}
          activeData={activeData}
          onDoubleClickText={handleDoubleClickText}
          zoom={zoom}
        />

        {/* In-Place Direct Inline Textarea Editor */}
        {editingTextElement && (
          <textarea
            autoFocus
            value={inlineEditText}
            onChange={(e) => setInlineEditText(e.target.value)}
            onBlur={handleSaveInlineText}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSaveInlineText();
              } else if (e.key === 'Escape') {
                setEditingTextElement(null);
              }
            }}
            className="absolute z-50 p-0 m-0 border-2 border-blue-500 bg-white/95 text-slate-900 shadow-xl resize-none outline-none rounded"
            style={{
              left: `${editingTextElement.x}px`,
              top: `${editingTextElement.y}px`,
              width: `${Math.max(120, editingTextElement.width || 120)}px`,
              height: `${Math.max(36, editingTextElement.height || 36)}px`,
              fontSize: `${editingTextElement.fontSize || 14}px`,
              fontFamily: editingTextElement.fontFamily || 'Plus Jakarta Sans',
              fontWeight: editingTextElement.fontWeight || 'normal',
              lineHeight: 1.2
            }}
          />
        )}
      </div>
    </div>
  );
}
