import React, { useRef, useState, useEffect } from 'react';

/**
 * Draggable & Resizable Element Container
 * Uses mouse events calibrated to the canvas virtual coordinates.
 */
export default function DraggableElement({
  element,
  isSelected,
  isEditing = false,
  canvasScale = 1,
  cardWidth = 600,
  cardHeight = 380,
  onSelect,
  onChange,
  onDragStateChange,
  onDoubleClick,
  children
}) {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragDataRef = useRef({
    element,
    canvasScale,
    cardWidth,
    cardHeight
  });

  // Keep ref up to date
  dragDataRef.current = { element, canvasScale, cardWidth, cardHeight };

  // Handle Drag Start
  const handleMouseDown = (e) => {
    // Only left click
    if (e.button !== 0) return;
    if (isEditing) return; // Don't drag while typing in inline input
    e.stopPropagation();
    onSelect(element.id);

    if (element.locked) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startElemX = element.x;
    const startElemY = element.y;
    let hasMoved = false;
    let latestX = startElemX;
    let latestY = startElemY;

    const onMouseMove = (moveEvent) => {
      const { canvasScale: scale, cardWidth: cW, cardHeight: cH } = dragDataRef.current;
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;

      if (!hasMoved && Math.hypot(deltaX, deltaY) > 3) {
        hasMoved = true;
        setIsDragging(true);
        if (onDragStateChange) onDragStateChange(true, element);
      }

      if (!hasMoved) return;

      let newX = startElemX + deltaX;
      let newY = startElemY + deltaY;

      // Card Boundaries Clamping
      newX = Math.max(0, Math.min(cW - (element.width || 40), Math.round(newX)));
      newY = Math.max(0, Math.min(cH - (element.height || 20), Math.round(newY)));

      // Snap logic: Snap to horizontal & vertical center within 6px threshold
      const centerX = Math.round(cW / 2) - Math.round((element.width || 0) / 2);
      const centerY = Math.round(cH / 2) - Math.round((element.height || 0) / 2);

      let snappedX = newX;
      let snappedY = newY;
      const activeGuides = { centerX: false, centerY: false };

      if (Math.abs(newX - centerX) <= 6) {
        snappedX = centerX;
        activeGuides.centerX = true;
      }
      if (Math.abs(newY - centerY) <= 6) {
        snappedY = centerY;
        activeGuides.centerY = true;
      }

      latestX = snappedX;
      latestY = snappedY;

      onChange(element.id, { x: snappedX, y: snappedY }, false);

      if (onDragStateChange) {
        onDragStateChange(true, { ...element, x: snappedX, y: snappedY }, activeGuides);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      setIsDragging(false);
      if (onDragStateChange) onDragStateChange(false, null, null);

      if (hasMoved) {
        onChange(element.id, { x: latestX, y: latestY }, true);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Handle Resize Start
  const handleResizeStart = (e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    if (element.locked) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = element.width;
    const startH = element.height;
    let latestW = startW;
    let latestH = startH;
    let hasResized = false;

    setIsResizing(true);

    const onMouseMove = (moveEvent) => {
      const { canvasScale: scale } = dragDataRef.current;
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;

      if (!hasResized && (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2)) {
        hasResized = true;
      }

      let newWidth = startW;
      let newHeight = startH;

      if (handle.includes('e')) newWidth = Math.max(30, Math.round(startW + deltaX));
      if (handle.includes('s')) newHeight = Math.max(20, Math.round(startH + deltaY));
      if (handle.includes('w')) newWidth = Math.max(30, Math.round(startW - deltaX));
      if (handle.includes('n')) newHeight = Math.max(20, Math.round(startH - deltaY));

      latestW = newWidth;
      latestH = newHeight;

      onChange(element.id, { width: newWidth, height: newHeight }, false);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      setIsResizing(false);
      if (hasResized) {
        onChange(element.id, { width: latestW, height: latestH }, true);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  if (!element.visible) return null;

  return (
    <div
      ref={elementRef}
      id={`canvas-elem-${element.id}`}
      data-element-id={element.id}
      data-canvas-element="true"
      className={`absolute group select-none transition-shadow ${
        isSelected
          ? isEditing
            ? 'ring-2 ring-blue-500 rounded-sm cursor-text shadow-md'
            : 'ring-2 ring-blue-500 ring-offset-1 rounded-sm cursor-move shadow-md'
          : 'hover:ring-1 hover:ring-blue-400/60 rounded-sm cursor-pointer'
      } ${element.locked ? 'cursor-not-allowed opacity-90' : ''}`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: element.width ? `${element.width}px` : 'auto',
        height: element.height ? `${element.height}px` : 'auto',
        zIndex: isSelected ? Math.max(25, (element.zIndex || 10) + 15) : (element.zIndex || 10),
        opacity: element.opacity !== undefined ? element.opacity : 1,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : 'none',
        userSelect: isEditing ? 'text' : 'none',
        WebkitUserSelect: isEditing ? 'text' : 'none'
      }}
      onPointerDown={(e) => {
        if (e.button === 0 && !isEditing) {
          onSelect(element.id);
        }
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (onDoubleClick) onDoubleClick(element.id);
      }}
    >
      {/* Content wrapper */}
      <div className={`w-full h-full ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'}`}>{children}</div>

      {/* Resize handles (visible only when selected and not locked) */}
      {isSelected && !element.locked && (
        <>
          {/* Top-Left */}
          <div
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize shadow-xs pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            onClick={(e) => e.stopPropagation()}
          />
          {/* Top-Right */}
          <div
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize shadow-xs pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            onClick={(e) => e.stopPropagation()}
          />
          {/* Bottom-Right */}
          <div
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize shadow-xs pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            onClick={(e) => e.stopPropagation()}
          />
          {/* Bottom-Left */}
          <div
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize shadow-xs pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            onClick={(e) => e.stopPropagation()}
          />
        </>
      )}
    </div>
  );
}
