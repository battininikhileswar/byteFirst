import React, { useState, useRef, useEffect, useCallback } from 'react';
import EditorToolbar from './EditorToolbar';
import ElementsPanel from './ElementsPanel';
import CanvasWorkspace from './CanvasWorkspace';
import PropertiesPanel from './PropertiesPanel';
import LayersPanel from './LayersPanel';
import PreviewModal from './PreviewModal';
import ExportModal from './ExportModal';
import { DEFAULT_TEMPLATES } from './defaultTemplates';
import { CR80_DIMENSIONS, printCardStage, resolveDynamicValue, buildCanvasDesignFromGenerated } from './editorUtils';
import { SAMPLE_STUDENTS } from '../../data/sampleData';
import { CheckCircle2, Layers, Sliders } from 'lucide-react';

const STORAGE_KEY = 'auntyid_canvas_design_v1';

export default function IDCardEditor() {
  // Retrieve student profile from generated card or sample data
  const getInitialStudent = () => {
    try {
      const generatedRaw = localStorage.getItem('auntyid_generated_card');
      if (generatedRaw) {
        const parsed = JSON.parse(generatedRaw);
        if (parsed.student && parsed.student.fullName) {
          return parsed.student;
        }
      }
    } catch (_) {}
    return SAMPLE_STUDENTS[0];
  };

  // 1. Initial State from generated dashboard card, localStorage, or fallback
  const getInitialDesign = () => {
    try {
      const generatedRaw = localStorage.getItem('auntyid_generated_card');
      const saved = localStorage.getItem(STORAGE_KEY);
      const generatedParsed = generatedRaw ? JSON.parse(generatedRaw) : null;
      const savedParsed = saved ? JSON.parse(saved) : null;

      // Always show the generated dashboard card if available
      if (generatedParsed?.student) {
        if (!savedParsed || (generatedParsed.timestamp && (!savedParsed.timestamp || generatedParsed.timestamp >= savedParsed.timestamp))) {
          const generatedDesign = buildCanvasDesignFromGenerated(generatedParsed.student, generatedParsed.design);
          generatedDesign.orientation = 'landscape';
          return generatedDesign;
        }
      }

      if (savedParsed && savedParsed.front && savedParsed.back) {
        savedParsed.orientation = 'landscape';
        return savedParsed;
      }

      if (generatedParsed?.student) {
        const generatedDesign = buildCanvasDesignFromGenerated(generatedParsed.student, generatedParsed.design);
        generatedDesign.orientation = 'landscape';
        return generatedDesign;
      }
    } catch (_) {}
    const defaultDesign = buildCanvasDesignFromGenerated(SAMPLE_STUDENTS[0], {});
    defaultDesign.orientation = 'landscape';
    return defaultDesign;
  };

  const [design, setDesign] = useState(getInitialDesign);
  const [side, setSide] = useState('front'); // 'front' | 'back'
  const [selectedIds, setSelectedIds] = useState([]);
  const [copiedElements, setCopiedElements] = useState([]);

  // Right sidebar drawer tab (properties or layers)
  const [rightPanelTab, setRightPanelTab] = useState('properties'); // 'properties' | 'layers'

  // Stage References for both Front and Back
  const frontStageRef = useRef(null);
  const backStageRef = useRef(null);

  // Viewport & Canvas Controls
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [snapGrid, setSnapGrid] = useState(false);
  const [showGuides, setShowGuides] = useState(true);

  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Active Real Student Profile for Dynamic Placeholders
  const [activeStudent, setActiveStudent] = useState(getInitialStudent);

  // History Stack for Undo / Redo
  const [history, setHistory] = useState([getInitialDesign()]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Dimensions based on orientation
  const isLandscape = design.orientation === 'landscape';
  const cardWidth = isLandscape ? CR80_DIMENSIONS.landscape.width : CR80_DIMENSIONS.portrait.width;
  const cardHeight = isLandscape ? CR80_DIMENSIONS.landscape.height : CR80_DIMENSIONS.portrait.height;

  // Active side elements & background
  const currentSideData = side === 'front' ? design.front : design.back;
  const elements = currentSideData.elements || [];
  const background = currentSideData.background || { type: 'solid', color: '#ffffff' };

  // Commit changes to history
  const commitDesignChange = useCallback((newDesign) => {
    setDesign(newDesign);
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, newDesign];
    });
    setHistoryIndex((prev) => prev + 1);

    // Persist to local storage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...newDesign, timestamp: Date.now() }));
    } catch (_) {}
  }, [historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setDesign(history[newIndex]);
      showToast('Undo');
    }
  }, [historyIndex, history]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setDesign(history[newIndex]);
      showToast('Redo');
    }
  }, [historyIndex, history]);

  // Update elements on active side
  const handleUpdateElement = useCallback((id, updates) => {
    setDesign((prev) => {
      const activeSide = side === 'front' ? 'front' : 'back';
      const updatedElements = prev[activeSide].elements.map((el) => {
        if (el.id === id) {
          return { ...el, ...updates };
        }
        return el;
      });

      const nextDesign = {
        ...prev,
        [activeSide]: {
          ...prev[activeSide],
          elements: updatedElements
        }
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDesign));
      } catch (_) {}
      return nextDesign;
    });
  }, [side]);

  // Background Change
  const handleChangeBackground = useCallback((bgUpdates) => {
    const activeSide = side === 'front' ? 'front' : 'back';
    const newDesign = {
      ...design,
      [activeSide]: {
        ...design[activeSide],
        background: {
          ...design[activeSide].background,
          ...bgUpdates
        }
      }
    };
    commitDesignChange(newDesign);
  }, [design, side, commitDesignChange]);

  // Add a new element to active side
  const handleAddElement = useCallback((newElem) => {
    const activeSide = side === 'front' ? 'front' : 'back';
    const elemWithId = {
      id: `elem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      x: 60,
      y: 60,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      ...newElem
    };

    const newDesign = {
      ...design,
      [activeSide]: {
        ...design[activeSide],
        elements: [...design[activeSide].elements, elemWithId]
      }
    };

    commitDesignChange(newDesign);
    setSelectedIds([elemWithId.id]);
    showToast(`Added ${newElem.name || newElem.type}`);
  }, [design, side, commitDesignChange]);

  // Delete selected elements
  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const activeSide = side === 'front' ? 'front' : 'back';
    const newDesign = {
      ...design,
      [activeSide]: {
        ...design[activeSide],
        elements: design[activeSide].elements.filter((el) => !selectedIds.includes(el.id))
      }
    };
    commitDesignChange(newDesign);
    setSelectedIds([]);
    showToast('Deleted element(s)');
  }, [design, side, selectedIds, commitDesignChange]);

  // Duplicate selected elements
  const handleDuplicateSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const activeSide = side === 'front' ? 'front' : 'back';
    const newElements = [...design[activeSide].elements];
    const newSelectedIds = [];

    design[activeSide].elements.forEach((el) => {
      if (selectedIds.includes(el.id)) {
        const cloned = {
          ...el,
          id: `elem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          x: el.x + 20,
          y: el.y + 20,
          name: `${el.name || el.type} (Copy)`
        };
        newElements.push(cloned);
        newSelectedIds.push(cloned.id);
      }
    });

    const newDesign = {
      ...design,
      [activeSide]: {
        ...design[activeSide],
        elements: newElements
      }
    };
    commitDesignChange(newDesign);
    setSelectedIds(newSelectedIds);
    showToast('Duplicated element(s)');
  }, [design, side, selectedIds, commitDesignChange]);

  // Layer Reordering
  const handleReorderElement = useCallback((id, direction) => {
    const activeSide = side === 'front' ? 'front' : 'back';
    const list = [...design[activeSide].elements];
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) return;

    const [item] = list.splice(index, 1);

    if (direction === 'bringToFront') {
      list.push(item);
    } else if (direction === 'sendToBack') {
      list.unshift(item);
    } else if (direction === 'bringForward') {
      const targetIndex = Math.min(list.length, index + 1);
      list.splice(targetIndex, 0, item);
    } else if (direction === 'sendBackward') {
      const targetIndex = Math.max(0, index - 1);
      list.splice(targetIndex, 0, item);
    }

    const newDesign = {
      ...design,
      [activeSide]: {
        ...design[activeSide],
        elements: list
      }
    };
    commitDesignChange(newDesign);
  }, [design, side, commitDesignChange]);

  // Toggle Lock
  const handleToggleLock = useCallback((id) => {
    const el = elements.find((e) => e.id === id);
    if (el) {
      handleUpdateElement(id, { locked: !el.locked });
      showToast(el.locked ? 'Element unlocked' : 'Element locked');
    }
  }, [elements, handleUpdateElement]);

  // Toggle Visibility
  const handleToggleVisibility = useCallback((id) => {
    const el = elements.find((e) => e.id === id);
    if (el) {
      handleUpdateElement(id, { visible: el.visible === false ? true : false });
    }
  }, [elements, handleUpdateElement]);

  // Toggle Orientation (Landscape / Portrait)
  const handleToggleOrientation = useCallback(() => {
    const nextOrientation = design.orientation === 'landscape' ? 'portrait' : 'landscape';
    const newDesign = {
      ...design,
      orientation: nextOrientation
    };
    commitDesignChange(newDesign);
    showToast(`Switched to ${nextOrientation} mode`);
  }, [design, commitDesignChange]);

  // Apply Full Template Preset
  const handleApplyTemplate = useCallback((templateId) => {
    if (templateId === 'generated-dashboard') {
      try {
        const generatedRaw = localStorage.getItem('auntyid_generated_card');
        if (generatedRaw) {
          const parsed = JSON.parse(generatedRaw);
          if (parsed.student) {
            const gen = buildCanvasDesignFromGenerated(parsed.student, parsed.design);
            gen.orientation = 'landscape';
            commitDesignChange(gen);
            setActiveStudent(parsed.student);
            setSelectedIds([]);
            showToast('Applied Generated Dashboard Card (Landscape)');
            return;
          }
        }
      } catch (_) {}
      const fallback = buildCanvasDesignFromGenerated(SAMPLE_STUDENTS[0], {});
      fallback.orientation = 'landscape';
      commitDesignChange(fallback);
      setSelectedIds([]);
      showToast('Applied Generated Card (Landscape)');
      return;
    }

    const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId);
    if (template && window.confirm(`Apply "${template.name}" template? Current unsaved edits will be replaced.`)) {
      const tpl = { ...template, orientation: 'landscape' };
      commitDesignChange(tpl);
      setSelectedIds([]);
      showToast(`Applied ${template.name}`);
    }
  }, [commitDesignChange]);

  // Save Design JSON
  const handleSaveDesign = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(design));
      const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `id-card-design-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Design saved & downloaded as JSON!');
    } catch (_) {
      showToast('Failed to save design');
    }
  };

  // Keyboard Shortcuts (Delete, Undo, Redo, Copy, Paste, Duplicate, Move Arrows, Select All, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
      }

      // Undo / Redo
      if (cmdKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if (cmdKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }

      // Copy
      if (cmdKey && e.key.toLowerCase() === 'c') {
        if (selectedIds.length > 0) {
          const toCopy = elements.filter((el) => selectedIds.includes(el.id));
          setCopiedElements(toCopy);
          showToast(`Copied ${toCopy.length} element(s)`);
        }
      }

      // Paste
      if (cmdKey && e.key.toLowerCase() === 'v') {
        if (copiedElements.length > 0) {
          e.preventDefault();
          const activeSide = side === 'front' ? 'front' : 'back';
          const newElems = [...design[activeSide].elements];
          const newIds = [];
          copiedElements.forEach((el) => {
            const pasted = {
              ...el,
              id: `elem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              x: el.x + 25,
              y: el.y + 25,
              name: `${el.name || el.type} (Copy)`
            };
            newElems.push(pasted);
            newIds.push(pasted.id);
          });
          const newDesign = {
            ...design,
            [activeSide]: {
              ...design[activeSide],
              elements: newElems
            }
          };
          commitDesignChange(newDesign);
          setSelectedIds(newIds);
          showToast('Pasted elements');
        }
      }

      // Duplicate (Ctrl+D)
      if (cmdKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
      }

      // Select All (Ctrl+A)
      if (cmdKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectedIds(elements.map((el) => el.id));
      }

      // Escape (Deselect)
      if (e.key === 'Escape') {
        setSelectedIds([]);
      }

      // Arrow Key Nudges
      if (selectedIds.length > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        selectedIds.forEach((id) => {
          const el = elements.find((x) => x.id === id);
          if (!el) return;
          let dx = 0;
          let dy = 0;
          if (e.key === 'ArrowUp') dy = -step;
          if (e.key === 'ArrowDown') dy = step;
          if (e.key === 'ArrowLeft') dx = -step;
          if (e.key === 'ArrowRight') dx = step;
          handleUpdateElement(id, { x: el.x + dx, y: el.y + dy });
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedIds,
    elements,
    copiedElements,
    side,
    design,
    handleDeleteSelected,
    handleDuplicateSelected,
    handleUndo,
    handleRedo,
    handleUpdateElement,
    commitDesignChange
  ]);

  const selectedElement = elements.find((el) => el.id === selectedIds[0]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 select-none">
      {/* 1. Top Application Toolbar */}
      <EditorToolbar
        side={side}
        onToggleSide={setSide}
        orientation={design.orientation}
        onToggleOrientation={handleToggleOrientation}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        selectedCount={selectedIds.length}
        onDuplicate={handleDuplicateSelected}
        onDelete={handleDeleteSelected}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onSave={handleSaveDesign}
        onOpenExport={() => setIsExportOpen(true)}
        onPrint={() => {
          const activeRef = side === 'front' ? frontStageRef : backStageRef;
          printCardStage(activeRef, design.orientation);
        }}
      />

      {/* 2. Main Studio 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Elements Sidebar */}
        <ElementsPanel
          onAddText={(props) =>
            handleAddElement({
              type: 'text',
              name: 'Text Label',
              width: 220,
              height: 28,
              ...props
            })
          }
          onAddShape={(props) =>
            handleAddElement({
              type: 'shape',
              name: 'Shape',
              ...props
            })
          }
          onAddImage={(dataUrl, type = 'image') =>
            handleAddElement({
              type,
              name: type === 'profile-photo' ? 'Student Photo' : 'Image Asset',
              src: dataUrl,
              width: 140,
              height: 160,
              clipType: type === 'profile-photo' ? 'rounded' : 'square',
              cornerRadius: 12
            })
          }
          onAddQr={(value) =>
            handleAddElement({
              type: 'qr',
              name: 'Verification QR Code',
              value,
              width: 90,
              height: 90
            })
          }
          onAddBarcode={(value) =>
            handleAddElement({
              type: 'barcode',
              name: 'Access Barcode',
              value,
              width: 240,
              height: 60
            })
          }
          onAddDynamicField={(tag, label) =>
            handleAddElement({
              type: 'text',
              name: label,
              text: tag,
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'Plus Jakarta Sans',
              fill: '#0f172a',
              width: 200,
              height: 24
            })
          }
          onApplyTemplate={handleApplyTemplate}
          background={background}
          onChangeBackground={handleChangeBackground}
        />

        {/* Center Interactive Canvas Workspace */}
        <CanvasWorkspace
          stageRef={side === 'front' ? frontStageRef : backStageRef}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          background={background}
          elements={elements}
          selectedIds={selectedIds}
          onSelectElement={setSelectedIds}
          onUpdateElement={handleUpdateElement}
          snapGrid={snapGrid}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onToggleSnap={() => setSnapGrid(!snapGrid)}
          showGuides={showGuides}
          isPreview={false}
          activeData={activeStudent}
          zoom={zoom}
          onZoomChange={setZoom}
          side={side}
        />

        {/* Right Inspector & Layers Sidebar */}
        <div className="w-80 h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col z-20">
          {/* Tabs for Properties vs Layers */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-900/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setRightPanelTab('properties')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                rightPanelTab === 'properties'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sliders size={14} />
              <span>Properties</span>
            </button>
            <button
              type="button"
              onClick={() => setRightPanelTab('layers')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                rightPanelTab === 'layers'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers size={14} />
              <span>Layers ({elements.length})</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {rightPanelTab === 'properties' ? (
              <PropertiesPanel
                selectedElement={selectedElement}
                onUpdateElement={handleUpdateElement}
                onReorderElement={handleReorderElement}
                onToggleLock={handleToggleLock}
                onToggleVisibility={handleToggleVisibility}
                onDuplicate={handleDuplicateSelected}
                onDelete={handleDeleteSelected}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                orientation={design.orientation}
                totalElementsCount={elements.length}
              />
            ) : (
              <LayersPanel
                elements={elements}
                selectedIds={selectedIds}
                onSelectElement={setSelectedIds}
                onReorderElement={handleReorderElement}
                onToggleLock={handleToggleLock}
                onToggleVisibility={handleToggleVisibility}
                onRenameElement={(id, newName) => handleUpdateElement(id, { name: newName })}
              />
            )}
          </div>
        </div>
      </div>

      {/* 3. Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        frontStageRef={frontStageRef}
        backStageRef={backStageRef}
        currentSide={side}
        onToggleSide={setSide}
        orientation={design.orientation}
        activeStudent={activeStudent}
        onSelectStudent={setActiveStudent}
        studentList={SAMPLE_STUDENTS}
      />

      {/* 4. Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        frontStageRef={frontStageRef}
        backStageRef={backStageRef}
        orientation={design.orientation}
        activeStudent={activeStudent}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
