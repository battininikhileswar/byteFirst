import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentForm from '../components/StudentForm';
import IDCardCanvas from '../components/IDCard/IDCardCanvas';
import ElementToolbar from '../components/IDCard/ElementToolbar';
import ThemeSelector from '../components/ThemeSelector';
import ActionToolbar from '../components/ActionToolbar';
import Footer from '../components/Footer';

import { CARD_THEMES } from '../data/themes';
import { SAMPLE_STUDENTS } from '../data/sampleData';
import { validateAllFields } from '../utils/validation';
import { downloadCardAsImage, printCard } from '../utils/downloadCard';
import {
  CheckCircle2,
  Sparkles,
  CreditCard,
  ArrowLeft,
  Undo2,
  Redo2,
  RotateCcw,
  Layers,
  Bot,
  Sliders,
  Move
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { getDefaultDesign } from '../state/defaultDesign';
import { useDesignHistory } from '../utils/history';
import { applyActionsToDesign } from '../utils/designActions';
import { useAgent } from '../context/AgentContext';
import '../App.css';

const INITIAL_STUDENT_DATA = {
  fullName: 'Harshavardhan',
  rollNumber: '21B91A0582',
  collegeName: 'National Institute of Technology',
  branch: 'Computer Science & Engineering',
  year: '4th Year (Senior)',
  section: 'A',
  email: 'harshavardhan@college.edu',
  phone: '+91 98765 43210',
  dob: '2003-08-14',
  bloodGroup: 'O+',
  address: 'Hyderabad, Telangana',
  photoUrl: '',
  logoUrl: ''
};

const BLANK_STUDENT_DATA = {
  fullName: '',
  rollNumber: '',
  collegeName: '',
  branch: '',
  year: '',
  section: '',
  email: '',
  phone: '',
  dob: '',
  bloodGroup: '',
  address: '',
  photoUrl: '',
  logoUrl: ''
};

export default function CreateID() {
  const { updateSafeContext, registerHandlers, unregisterHandlers, openAgent } = useAgent();
  const [studentData, setStudentData] = useState(INITIAL_STUDENT_DATA);
  const [selectedTheme, setSelectedTheme] = useState(CARD_THEMES[0]);
  const [cardOrientation, setCardOrientation] = useState('horizontal');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState('canvas'); // 'canvas', 'form', 'ai'

  // Centralized Design State & Undo/Redo History
  const {
    design,
    setDesign,
    undo,
    redo,
    canUndo,
    canRedo,
    resetDesign
  } = useDesignHistory(getDefaultDesign('horizontal'));

  const cardRef = useRef(null);

  // Sync safe UI telemetry with Agent (strictly non-sensitive metadata)
  useEffect(() => {
    const requiredKeys = ['fullName', 'rollNumber', 'collegeName', 'branch', 'year', 'section'];
    const completedCount = requiredKeys.filter((k) => !!studentData[k]?.trim()).length;

    updateSafeContext({
      page: '/create',
      requiredFieldsCompleted: completedCount,
      totalRequiredFields: requiredKeys.length,
      photoUploaded: !!studentData.photoUrl,
      selectedTheme: selectedTheme.name,
      cardOrientation,
      hasValidationErrors: Object.keys(formErrors).length > 0,
      isGenerated
    });
  }, [studentData, selectedTheme, cardOrientation, formErrors, isGenerated, updateSafeContext]);

  // Continuously sync active card data to localStorage so Canvas Studio always reflects the generated card
  useEffect(() => {
    try {
      localStorage.setItem('auntyid_generated_card', JSON.stringify({
        student: studentData,
        design: design,
        orientation: 'landscape',
        timestamp: Date.now()
      }));
    } catch (_) {}
  }, [studentData, design]);

  const handleOpenCanvasStudio = () => {
    try {
      localStorage.setItem('auntyid_generated_card', JSON.stringify({
        student: studentData,
        design: design,
        orientation: 'landscape',
        timestamp: Date.now()
      }));
      localStorage.removeItem('auntyid_canvas_design_v1');
    } catch (_) {}
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Figma-style keyboard shortcuts when an element is selected
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (!selectedElementId) return;

      if (e.key === '[') {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey || e.altKey) {
          handleReorderElement(selectedElementId, 'sendToBack');
          showToast('Sent element to background (behind text)');
        } else {
          handleReorderElement(selectedElementId, 'sendBackward');
        }
      } else if (e.key === ']') {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey || e.altKey) {
          handleReorderElement(selectedElementId, 'bringToFront');
          showToast('Brought element to front');
        } else {
          handleReorderElement(selectedElementId, 'bringForward');
        }
      } else if (e.key === 'Escape') {
        setSelectedElementId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId]);

  // Sync orientation changes to design state
  const handleOrientationChange = (newOrientation) => {
    setCardOrientation(newOrientation);
    const newDesign = getDefaultDesign(newOrientation);
    // Keep active theme colors
    newDesign.card.themeId = selectedTheme.id;
    newDesign.card.headerBg = selectedTheme.headerBg;
    newDesign.card.borderColor = selectedTheme.borderColor;
    newDesign.card.accentColor = selectedTheme.accent;
    resetDesign(newDesign);
    showToast(`Switched to ${newOrientation} layout`);
  };

  // Sync theme changes to design state
  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    setDesign((current) => ({
      ...current,
      card: {
        ...current.card,
        themeId: newTheme.id,
        headerBg: newTheme.headerBg,
        borderColor: newTheme.borderColor,
        accentColor: newTheme.accent
      }
    }), true);
    showToast(`Applied ${newTheme.name} theme`);
  };

  // Form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handlePhotoUpload = (dataUrl) => {
    setStudentData((prev) => ({
      ...prev,
      photoUrl: dataUrl
    }));
    showToast('Student photograph updated');
  };

  const handlePhotoRemove = () => {
    setStudentData((prev) => ({
      ...prev,
      photoUrl: ''
    }));
    showToast('Photograph removed');
  };

  const handleLogoUpload = (dataUrl) => {
    setStudentData((prev) => ({
      ...prev,
      logoUrl: dataUrl
    }));
    showToast('Institution logo updated');
  };

  const handleLogoRemove = () => {
    setStudentData((prev) => ({
      ...prev,
      logoUrl: ''
    }));
    showToast('Institution logo removed');
  };

  const handleLoadSample = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_STUDENTS.length);
    const sample = SAMPLE_STUDENTS[randomIndex];
    setStudentData({ ...sample });
    setFormErrors({});
    setIsGenerated(true);
    showToast(`Loaded sample profile for ${sample.fullName}`);
  };

  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to reset all form fields?')) {
      setStudentData(BLANK_STUDENT_DATA);
      setFormErrors({});
      setIsGenerated(false);
      showToast('Form reset to blank');
    }
  };

  // Reset entire design layout to default
  const handleResetDesign = () => {
    if (window.confirm('Reset ID card visual design to initial default layout?')) {
      resetDesign(getDefaultDesign(cardOrientation));
      setSelectedElementId(null);
      showToast('Design layout reset to default');
    }
  };

  // Handle single element update (from drag or element toolbar)
  const handleUpdateElement = (id, updates, commitToHistory = true) => {
    setDesign((current) => {
      if (!current.elements[id]) return current;
      return {
        ...current,
        elements: {
          ...current.elements,
          [id]: {
            ...current.elements[id],
            ...updates
          }
        }
      };
    }, commitToHistory);
  };

  // Handle direct text updates to student data from canvas editor
  const handleUpdateStudentField = (field, value) => {
    setStudentData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle layer reordering (bring to front, etc.)
  const handleReorderElement = (id, direction) => {
    setDesign((current) => {
      const actions = [{ type: 'reorder', element: id, direction }];
      return applyActionsToDesign(current, actions);
    }, true);
  };

  // Toggle lock state
  const handleToggleLock = (id) => {
    setDesign((current) => {
      if (!current.elements[id]) return current;
      const locked = !current.elements[id].locked;
      return {
        ...current,
        elements: {
          ...current.elements,
          [id]: {
            ...current.elements[id],
            locked
          }
        }
      };
    }, true);
  };

  // Hide element
  const handleHideElement = (id) => {
    setDesign((current) => {
      if (!current.elements[id]) return current;
      return {
        ...current,
        elements: {
          ...current.elements,
          [id]: {
            ...current.elements[id],
            visible: false
          }
        }
      };
    }, true);
    setSelectedElementId(null);
    showToast('Element hidden. You can ask AI to restore it.');
  };

  // Apply actions from AI Chatbot
  const handleApplyAiActions = (actions, message) => {
    setDesign((current) => applyActionsToDesign(current, actions), true);
    showToast(message || 'AI design changes applied!');
  };

  // Focus matching form field when element is double-clicked on canvas
  const handleFocusField = (elementId) => {
    if (elementId === 'studentPhoto') {
      const photoInput =
        document.querySelector('.photo-upload-zone input[type="file"]') ||
        document.querySelector('input[type="file"][accept*="image"]');
      if (photoInput) {
        photoInput.click();
        return;
      }
    }

    if (elementId === 'collegeEmblem' || elementId === 'collegeLogo') {
      const logoInput = document.querySelector('.logo-upload-zone input[type="file"]');
      if (logoInput) {
        logoInput.click();
        return;
      }
    }

    const fieldMapping = {
      studentName: 'fullName',
      rollNumber: 'rollNumber',
      collegeName: 'collegeName',
      branch: 'branch',
      email: 'email',
      phone: 'phone',
      address: 'address',
      dob: 'dob',
      bloodGroup: 'bloodGroup'
    };

    const targetFieldName = fieldMapping[elementId];
    if (targetFieldName) {
      const input = document.querySelector(`[name="${targetFieldName}"]`);
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleGenerate = () => {
    const errors = validateAllFields(studentData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please fix the highlighted required fields');
      return;
    }

    setFormErrors({});
    setIsGenerated(true);
    showToast('ID Card verified successfully!');
  };

  const handleDownload = async () => {
    if (isFlipped) {
      setIsFlipped(false);
      await new Promise((r) => setTimeout(r, 400));
    }

    // Deselect element prior to snapshot
    setSelectedElementId(null);
    setIsDownloading(true);

    try {
      const fileName = `${(studentData.fullName || 'student').toLowerCase().replace(/\s+/g, '-')}-id-card.png`;
      await downloadCardAsImage(cardRef.current, fileName);
      showToast('ID Card PNG downloaded successfully!');
    } catch (error) {
      console.error(error);
      showToast('Failed to download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    setSelectedElementId(null);
    printCard();
  };

  // Register real application action handlers with the AI Agent
  useEffect(() => {
    registerHandlers({
      fillStudentForm: (fields) => {
        setStudentData((prev) => ({
          ...prev,
          ...fields
        }));
        setFormErrors((prev) => {
          const next = { ...prev };
          Object.keys(fields).forEach((k) => delete next[k]);
          return next;
        });
        setIsGenerated(true);
        showToast('Form updated by AuntyID');
        return { success: true, updatedFields: Object.keys(fields) };
      },
      updateStudentField: (field, value) => {
        setStudentData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
        return { success: true };
      },
      validateStudentForm: () => {
        const errors = validateAllFields(studentData);
        setFormErrors(errors);
        return { success: Object.keys(errors).length === 0, errors };
      },
      generateId: () => {
        handleGenerate();
        return { success: true };
      },
      downloadId: async () => {
        await handleDownload();
        return { success: true };
      },
      printId: () => {
        handlePrint();
        return { success: true };
      },
      setIdTheme: (themeName) => {
        if (!themeName) return { success: false, error: 'No theme specified' };
        const q = themeName.toLowerCase().replace(/[-_]/g, ' ');
        let match = CARD_THEMES.find(
          (t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
        );
        if (!match) {
          if (q.includes('blue') || q.includes('modern') || q.includes('oxford')) {
            match = CARD_THEMES.find((t) => t.id === 'oxford-blue');
          } else if (q.includes('indigo') || q.includes('violet') || q.includes('royal') || q.includes('purple')) {
            match = CARD_THEMES.find((t) => t.id === 'royal-indigo');
          } else if (q.includes('crimson') || q.includes('red') || q.includes('harvard')) {
            match = CARD_THEMES.find((t) => t.id === 'harvard-crimson');
          } else if (q.includes('emerald') || q.includes('green') || q.includes('mit')) {
            match = CARD_THEMES.find((t) => t.id === 'mit-emerald');
          } else if (q.includes('dark') || q.includes('slate') || q.includes('midnight') || q.includes('black') || q.includes('minimal')) {
            match = CARD_THEMES.find((t) => t.id === 'midnight-slate');
          } else if (q.includes('amber') || q.includes('gold') || q.includes('imperial') || q.includes('sunset') || q.includes('orange')) {
            match = CARD_THEMES.find((t) => t.id === 'amber-gold');
          }
        }
        if (match) {
          handleThemeChange(match);
          return { success: true, theme: match.name };
        }
        return { success: false, error: 'Theme not found' };
      },
      flipIdCard: () => {
        setIsFlipped((prev) => !prev);
        return { success: true };
      },
      resetForm: () => {
        setStudentData(BLANK_STUDENT_DATA);
        setFormErrors({});
        setIsGenerated(false);
        showToast('Form reset by AuntyID');
        return { success: true };
      }
    });

    return () => {
      unregisterHandlers();
    };
  }, [studentData, isFlipped, registerHandlers, unregisterHandlers]);

  return (
    <div className="digital-id-app min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Creation Header Bar */}
      <header className="navbar-container sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="navbar-inner max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <Link to="/" className="brand-logo flex items-center gap-2">
            <div className="logo-icon-wrap p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <CreditCard className="logo-icon" size={20} />
            </div>
            <span className="brand-text font-black text-lg tracking-tight text-slate-900 dark:text-white">
              Aunty<span className="brand-accent text-blue-600 dark:text-blue-400">ID</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                AI STUDIO
              </span>
            </span>
          </Link>

          <div className="navbar-actions flex items-center gap-3">
            <Link
              to="/editor"
              onClick={handleOpenCanvasStudio}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 transition"
              title="Open Professional Canvas Designer"
            >
              <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
              <span>Canvas Studio</span>
            </Link>
            <ThemeToggle />
            <Link to="/" className="btn btn-outline btn-sm back-to-overview-btn">
              <ArrowLeft size={16} />
              <span className="back-btn-text">Back to Overview</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-2 sm:p-3 lg:p-4 flex flex-col min-h-0 lg:overflow-hidden">
        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl mb-3 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveMobileTab('canvas')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeMobileTab === 'canvas' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Move size={14} />
            <span>ID Canvas</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('form')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeMobileTab === 'form' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sliders size={14} />
            <span>Student Form</span>
          </button>
          <button
            type="button"
            onClick={openAgent}
            className="flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition text-blue-600 dark:text-blue-400 font-bold"
          >
            <Bot size={14} />
            <span>AI Assistant</span>
          </button>
        </div>

        {/* 2-Column Laptop-Friendly Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-5 items-stretch flex-1 min-h-0 lg:overflow-hidden">
          {/* ================= LEFT COLUMN: Student Credentials Form & Theming (lg:col-span-5 xl:col-span-4) ================= */}
          <div
            className={`lg:col-span-5 xl:col-span-4 flex flex-col lg:h-full lg:max-h-full min-h-0 ${
              activeMobileTab === 'form' ? 'block' : 'hidden lg:flex'
            }`}
          >
            <div className="flex-1 lg:overflow-y-auto space-y-3.5 pr-1 sm:pr-2 custom-scrollbar">
              <StudentForm
                formData={studentData}
                errors={formErrors}
                onChange={handleInputChange}
                onPhotoUpload={handlePhotoUpload}
                onPhotoRemove={handlePhotoRemove}
                onLogoUpload={handleLogoUpload}
                onLogoRemove={handleLogoRemove}
                onLoadSample={handleLoadSample}
                onReset={handleResetForm}
              />

              {/* Theme Selector */}
              <ThemeSelector
                selectedTheme={selectedTheme}
                onThemeChange={handleThemeChange}
                orientation={cardOrientation}
                onOrientationChange={handleOrientationChange}
                isFlipped={isFlipped}
                onToggleFlip={() => setIsFlipped(!isFlipped)}
              />

              {/* Actions Toolbar */}
              <ActionToolbar
                onGenerate={handleGenerate}
                onDownload={handleDownload}
                onPrint={handlePrint}
                onFlip={() => setIsFlipped(!isFlipped)}
                isFlipped={isFlipped}
                isGenerated={isGenerated}
                isDownloading={isDownloading}
                hasValidationErrors={Object.keys(formErrors).length > 0}
              />
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Interactive ID Card Canvas (lg:col-span-7 xl:col-span-8) ================= */}
          <div
            className={`lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl relative lg:h-full lg:max-h-full min-h-0 overflow-hidden ${
              activeMobileTab === 'canvas' ? 'block' : 'hidden lg:flex'
            }`}
          >
            {/* Contextual Canvas Editor Bar (Active element properties or studio navigation) */}
            <div className="w-full shrink-0">
              <ElementToolbar
                element={design?.elements && selectedElementId ? design.elements[selectedElementId] : null}
                studentData={studentData}
                onUpdateStudentField={handleUpdateStudentField}
                onUpdateStyle={(id, styles) => handleUpdateElement(id, styles, true)}
                onReorder={handleReorderElement}
                onToggleLock={handleToggleLock}
                onHide={handleHideElement}
                onDeselect={() => setSelectedElementId(null)}
                onPhotoUpload={handlePhotoUpload}
                onLogoUpload={handleLogoUpload}
                cardOrientation={cardOrientation}
                onOrientationChange={handleOrientationChange}
                isFlipped={isFlipped}
                onToggleFlip={() => setIsFlipped(!isFlipped)}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
                onResetDesign={handleResetDesign}
              />
            </div>

            {/* Center Canvas Area */}
            <div
              className="flex-1 w-full min-h-0 flex flex-col items-center justify-center overflow-hidden py-1"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedElementId(null);
                }
              }}
            >
              <IDCardCanvas
                ref={cardRef}
                student={studentData}
                design={design}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onUpdateElement={handleUpdateElement}
                onReorderElement={handleReorderElement}
                onToggleLock={handleToggleLock}
                onHideElement={handleHideElement}
                isFlipped={isFlipped}
                isExportMode={isDownloading}
                onFocusField={handleFocusField}
                onPhotoUpload={handlePhotoUpload}
                onLogoUpload={handleLogoUpload}
                onUpdateStudentField={handleUpdateStudentField}
              />
            </div>

            {/* Design Hint Footer */}
            <div className="w-full pt-2 mt-auto border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500 shrink-0" />
                <span>
                  <strong>ProTip:</strong> Click any element to drag, resize, or style. Double-click to focus field. Use [ and ] to adjust layers.
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                {cardOrientation === 'horizontal' ? '600 × 380 px' : '380 × 600 px'}
              </span>
            </div>
          </div>
        </div>
      </main>

      <div className="lg:hidden">
        <Footer />
      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="toast-container" role="status">
          <CheckCircle2 size={18} className="toast-icon text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
