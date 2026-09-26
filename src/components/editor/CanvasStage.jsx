import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Image as KonvaImage, Transformer, Group } from 'react-konva';
import { generateQrDataUrl, generateBarcodeDataUrl, resolveDynamicValue, snapToGrid } from './editorUtils';

// Robust native image loader hook for Konva
function useCanvasImage(url, crossOrigin = 'anonymous') {
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    img.src = url;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url, crossOrigin]);

  return [image];
}

// Helper component to render an image element with optional shape clipping and borders
function CanvasImageElement({ element, isSelected, onSelect, onChange, isPreview, activeData }) {
  const resolvedSrc = useMemo(() => {
    let src = element.src;
    if (element.type === 'profile-photo' && activeData?.photoUrl) {
      src = activeData.photoUrl;
    }
    return src || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
  }, [element.src, element.type, activeData]);

  const [image] = useCanvasImage(resolvedSrc, 'anonymous');
  const imageRef = useRef(null);

  const clipFunc = useMemo(() => {
    if (element.clipType === 'circle') {
      return (ctx) => {
        const radius = Math.min(element.width, element.height) / 2;
        ctx.arc(element.width / 2, element.height / 2, radius, 0, Math.PI * 2, false);
      };
    } else if (element.clipType === 'rounded' && element.cornerRadius) {
      return (ctx) => {
        const r = element.cornerRadius || 12;
        const w = element.width;
        const h = element.height;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(w - r, 0);
        ctx.quadraticCurveTo(w, 0, w, r);
        ctx.lineTo(w, h - r);
        ctx.quadraticCurveTo(w, h, w - r, h);
        ctx.lineTo(r, h);
        ctx.quadraticCurveTo(0, h, 0, h - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
      };
    }
    return null;
  }, [element.clipType, element.cornerRadius, element.width, element.height]);

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation || 0}
      opacity={element.opacity !== undefined ? element.opacity : 1}
      draggable={!element.locked && !isPreview}
      onClick={onSelect}
      onTap={onSelect}
      clipFunc={clipFunc}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      onTransformEnd={() => {
        const node = imageRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * scaleX),
          height: Math.max(20, node.height() * scaleY),
          rotation: node.rotation()
        });
      }}
    >
      <KonvaImage
        ref={imageRef}
        image={image}
        width={element.width}
        height={element.height}
        stroke={element.borderColor || ''}
        strokeWidth={element.borderWidth || 0}
      />
    </Group>
  );
}

// Helper component to render dynamically generated QR code
function CanvasQrElement({ element, onSelect, onChange, isPreview, activeData }) {
  const [qrUrl, setQrUrl] = useState(null);
  const resolvedValue = resolveDynamicValue(element.value || 'ID-CODE', activeData);

  useEffect(() => {
    let isMounted = true;
    generateQrDataUrl(resolvedValue, {
      color: element.color || '#000000',
      bgColor: element.bgColor || '#ffffff'
    }).then((url) => {
      if (isMounted) setQrUrl(url);
    });
    return () => { isMounted = false; };
  }, [resolvedValue, element.color, element.bgColor]);

  const [image] = useCanvasImage(qrUrl);
  const groupRef = useRef(null);

  return (
    <Group
      id={element.id}
      ref={groupRef}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation || 0}
      opacity={element.opacity !== undefined ? element.opacity : 1}
      draggable={!element.locked && !isPreview}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      onTransformEnd={() => {
        const node = groupRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(30, node.width() * scaleX),
          height: Math.max(30, node.height() * scaleY),
          rotation: node.rotation()
        });
      }}
    >
      <KonvaImage
        image={image}
        width={element.width}
        height={element.height}
      />
    </Group>
  );
}

// Helper component to render dynamically generated Barcode
function CanvasBarcodeElement({ element, onSelect, onChange, isPreview, activeData }) {
  const [barcodeUrl, setBarcodeUrl] = useState(null);
  const resolvedValue = resolveDynamicValue(element.value || '12345678', activeData);

  useEffect(() => {
    const url = generateBarcodeDataUrl(resolvedValue, {
      format: element.format || 'CODE128',
      color: element.color || '#000000',
      bgColor: element.bgColor || '#ffffff',
      displayValue: element.displayValue !== false
    });
    setBarcodeUrl(url);
  }, [resolvedValue, element.format, element.color, element.bgColor, element.displayValue]);

  const [image] = useCanvasImage(barcodeUrl);
  const groupRef = useRef(null);

  return (
    <Group
      id={element.id}
      ref={groupRef}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation || 0}
      opacity={element.opacity !== undefined ? element.opacity : 1}
      draggable={!element.locked && !isPreview}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      onTransformEnd={() => {
        const node = groupRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(40, node.width() * scaleX),
          height: Math.max(20, node.height() * scaleY),
          rotation: node.rotation()
        });
      }}
    >
      <KonvaImage
        image={image}
        width={element.width}
        height={element.height}
      />
    </Group>
  );
}

export default function CanvasStage({
  stageRef,
  cardWidth,
  cardHeight,
  background = {},
  elements = [],
  selectedIds = [],
  onSelectElement,
  onUpdateElement,
  onBatchUpdate,
  snapGrid = false,
  showGuides = true,
  isPreview = false,
  activeData = {},
  onDoubleClickText,
  zoom = 1
}) {
  const transformerRef = useRef(null);
  const [guideLines, setGuideLines] = useState([]);

  // Attach Transformer to selected Konva nodes
  useEffect(() => {
    if (isPreview || !transformerRef.current || !stageRef.current) return;
    const stage = stageRef.current;
    const nodes = selectedIds
      .map((id) => stage.findOne('#' + id))
      .filter((node) => Boolean(node));

    transformerRef.current.nodes(nodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedIds, elements, isPreview, stageRef]);

  // Click on stage background deselects elements
  const checkDeselect = (e) => {
    if (e.target === e.target.getStage() || e.target.name() === 'canvas-background-rect') {
      onSelectElement([]);
    }
  };

  // Dragging alignment guide calculations
  const handleDragMove = (e, elem) => {
    if (!showGuides && !snapGrid) return;
    const stage = stageRef.current;
    if (!stage) return;

    let newX = e.target.x();
    let newY = e.target.y();

    if (snapGrid) {
      newX = snapToGrid(newX, 10);
      newY = snapToGrid(newY, 10);
      e.target.position({ x: newX, y: newY });
    }

    if (showGuides) {
      const guides = [];
      const cardCenterX = cardWidth / 2;
      const cardCenterY = cardHeight / 2;
      const elemCenterX = newX + (elem.width || 0) / 2;
      const elemCenterY = newY + (elem.height || 0) / 2;

      // Center X alignment
      if (Math.abs(elemCenterX - cardCenterX) < 5) {
        e.target.x(cardCenterX - (elem.width || 0) / 2);
        guides.push({ points: [cardCenterX, 0, cardCenterX, cardHeight], color: '#38bdf8' });
      }
      // Center Y alignment
      if (Math.abs(elemCenterY - cardCenterY) < 5) {
        e.target.y(cardCenterY - (elem.height || 0) / 2);
        guides.push({ points: [0, cardCenterY, cardWidth, cardCenterY], color: '#38bdf8' });
      }

      setGuideLines(guides);
    }
  };

  const handleDragEnd = (e, elemId) => {
    setGuideLines([]);
    onUpdateElement(elemId, {
      x: e.target.x(),
      y: e.target.y()
    });
  };

  return (
    <Stage
      ref={stageRef}
      width={cardWidth}
      height={cardHeight}
      onMouseDown={checkDeselect}
      onTouchStart={checkDeselect}
      className="id-canvas-stage shadow-2xl rounded-2xl overflow-hidden bg-white"
    >
      <Layer>
        {/* Card Background Base */}
        {background.type === 'gradient' ? (
          <Rect
            name="canvas-background-rect"
            x={0}
            y={0}
            width={cardWidth}
            height={cardHeight}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: cardWidth, y: cardHeight }}
            fillLinearGradientColorStops={[0, background.gradientStart || '#ffffff', 1, background.gradientEnd || '#f1f5f9']}
            opacity={background.opacity !== undefined ? background.opacity : 1}
          />
        ) : (
          <Rect
            name="canvas-background-rect"
            x={0}
            y={0}
            width={cardWidth}
            height={cardHeight}
            fill={background.color || '#ffffff'}
            opacity={background.opacity !== undefined ? background.opacity : 1}
          />
        )}

        {/* Render Canvas Elements in Layer Order */}
        {elements
          .filter((el) => el.visible !== false)
          .map((el) => {
            const isSelected = selectedIds.includes(el.id);

            // 1. Text Element
            if (el.type === 'text') {
              const resolvedDisplay = isPreview || !el.isEditing
                ? resolveDynamicValue(el.text, activeData)
                : el.text;

              return (
                <Text
                  key={el.id}
                  id={el.id}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  text={resolvedDisplay}
                  fontSize={el.fontSize || 14}
                  fontFamily={el.fontFamily || 'Plus Jakarta Sans'}
                  fontStyle={`${el.italic ? 'italic ' : ''}${el.fontWeight === 'bold' || el.fontWeight >= 700 ? 'bold' : 'normal'}`}
                  fill={el.fill || '#0f172a'}
                  align={el.align || 'left'}
                  letterSpacing={el.letterSpacing || 0}
                  lineHeight={el.lineHeight || 1.2}
                  textDecoration={el.underline ? 'underline' : ''}
                  wrap="word"
                  rotation={el.rotation || 0}
                  opacity={el.opacity !== undefined ? el.opacity : 1}
                  draggable={!el.locked && !isPreview}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    onSelectElement([el.id]);
                  }}
                  onDblClick={(e) => {
                    e.cancelBubble = true;
                    if (onDoubleClickText) onDoubleClickText(el);
                  }}
                  onDragMove={(e) => handleDragMove(e, el)}
                  onDragEnd={(e) => handleDragEnd(e, el.id)}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    onUpdateElement(el.id, {
                      x: node.x(),
                      y: node.y(),
                      width: Math.max(30, node.width() * scaleX),
                      height: Math.max(16, node.height() * scaleY),
                      rotation: node.rotation()
                    });
                  }}
                />
              );
            }

            // 2. Shape Elements
            if (el.type === 'shape') {
              if (el.shapeType === 'circle') {
                const radius = Math.min(el.width, el.height) / 2;
                return (
                  <Circle
                    key={el.id}
                    id={el.id}
                    x={el.x + radius}
                    y={el.y + radius}
                    radius={radius}
                    fill={el.fill || '#3b82f6'}
                    stroke={el.stroke || ''}
                    strokeWidth={el.strokeWidth || 0}
                    rotation={el.rotation || 0}
                    opacity={el.opacity !== undefined ? el.opacity : 1}
                    draggable={!el.locked && !isPreview}
                    onClick={(e) => { e.cancelBubble = true; onSelectElement([el.id]); }}
                    onDragMove={(e) => handleDragMove(e, el)}
                    onDragEnd={(e) => handleDragEnd(e, el.id)}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const scaleX = node.scaleX();
                      node.scaleX(1);
                      node.scaleY(1);
                      onUpdateElement(el.id, {
                        x: node.x() - node.radius() * scaleX,
                        y: node.y() - node.radius() * scaleX,
                        width: Math.max(10, node.radius() * 2 * scaleX),
                        height: Math.max(10, node.radius() * 2 * scaleX),
                        rotation: node.rotation()
                      });
                    }}
                  />
                );
              }

              if (el.shapeType === 'line') {
                return (
                  <Line
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    points={[0, 0, el.width, 0]}
                    stroke={el.stroke || el.fill || '#cbd5e1'}
                    strokeWidth={el.strokeWidth || el.height || 2}
                    lineCap="round"
                    dash={el.dash || []}
                    rotation={el.rotation || 0}
                    opacity={el.opacity !== undefined ? el.opacity : 1}
                    draggable={!el.locked && !isPreview}
                    onClick={(e) => { e.cancelBubble = true; onSelectElement([el.id]); }}
                    onDragMove={(e) => handleDragMove(e, el)}
                    onDragEnd={(e) => handleDragEnd(e, el.id)}
                  />
                );
              }

              // Default: Rectangle / Rounded Rectangle
              return (
                <Rect
                  key={el.id}
                  id={el.id}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  cornerRadius={el.cornerRadius || 0}
                  fill={el.fill || '#e2e8f0'}
                  stroke={el.stroke || ''}
                  strokeWidth={el.strokeWidth || 0}
                  rotation={el.rotation || 0}
                  opacity={el.opacity !== undefined ? el.opacity : 1}
                  draggable={!el.locked && !isPreview}
                  onClick={(e) => { e.cancelBubble = true; onSelectElement([el.id]); }}
                  onDragMove={(e) => handleDragMove(e, el)}
                  onDragEnd={(e) => handleDragEnd(e, el.id)}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    onUpdateElement(el.id, {
                      x: node.x(),
                      y: node.y(),
                      width: Math.max(10, node.width() * scaleX),
                      height: Math.max(10, node.height() * scaleY),
                      rotation: node.rotation()
                    });
                  }}
                />
              );
            }

            // 3. Image / Profile Photo / Logo Elements
            if (el.type === 'image' || el.type === 'profile-photo' || el.type === 'logo') {
              return (
                <CanvasImageElement
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  onSelect={(e) => { e.cancelBubble = true; onSelectElement([el.id]); }}
                  onChange={(updates) => onUpdateElement(el.id, updates)}
                  isPreview={isPreview}
                  activeData={activeData}
                />
              );
            }

            // 4. QR Code Element
            if (el.type === 'qr') {
              return (
                <CanvasQrElement
                  key={el.id}
                  element={el}
                  onSelect={(e) => { e.cancelBubble = true; onSelectElement([el.id]); }}
                  onChange={(updates) => onUpdateElement(el.id, updates)}
                  isPreview={isPreview}
                  activeData={activeData}
                />
              );
            }

            // 5. Barcode Element
            if (el.type === 'barcode') {
              return (
                <CanvasBarcodeElement
                  key={el.id}
                  element={el}
                  onSelect={(e) => { e.cancelBubble = true; onSelectElement([el.id]); }}
                  onChange={(updates) => onUpdateElement(el.id, updates)}
                  isPreview={isPreview}
                  activeData={activeData}
                />
              );
            }

            return null;
          })}

        {/* Alignment Smart Guides */}
        {guideLines.map((g, idx) => (
          <Line
            key={`guide-${idx}`}
            points={g.points}
            stroke={g.color}
            strokeWidth={1}
            dash={[4, 4]}
          />
        ))}

        {/* Interactive Selection / Transform Handles (8 handles + rotation) */}
        {!isPreview && (
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 15 || Math.abs(newBox.height) < 15) {
                return oldBox;
              }
              return newBox;
            }}
            rotateEnabled={true}
            enabledAnchors={[
              'top-left',
              'top-center',
              'top-right',
              'middle-left',
              'middle-right',
              'bottom-left',
              'bottom-center',
              'bottom-right'
            ]}
            anchorSize={9}
            anchorCornerRadius={4}
            anchorStroke="#2563eb"
            anchorFill="#ffffff"
            anchorStrokeWidth={2}
            borderStroke="#3b82f6"
            borderStrokeWidth={1.5}
            borderDash={[4, 3]}
          />
        )}
      </Layer>
    </Stage>
  );
}
