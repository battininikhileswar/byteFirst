import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  RefreshCw,
  Lightbulb,
  Zap,
  X,
  Image as ImageIcon,
  Paperclip,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { validateAndSanitizeActions } from '../../utils/designValidation';
import { processUploadedImage } from '../../utils/imageAnalysis';

const SUGGESTED_PROMPTS = [
  '✨ Generate with AI',
  '📸 Attach photo to create ID',
  'Put college logo in background as watermark',
  'Create a modern dark blue college ID card',
  'Move the name to the center',
  'Put QR code in bottom right',
  'Give it an Apple-like minimal style',
  'Hide the phone number'
];

export default function AIChat({
  currentDesign,
  onApplyActions,
  onResetDesign,
  onClose,
  onImageAttached,
  onUpdateStudentData
}) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        "Hello! I'm your ID Design AI. You can attach a photo or logo below or describe how you'd like your ID styled, and I'll create it instantly."
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Process an image file from file picker, drag & drop, or paste
  const handleProcessImageFile = async (file) => {
    if (!file) return;
    setIsProcessingImage(true);
    setErrorMsg(null);
    try {
      const processed = await processUploadedImage(file);
      setAttachedImage({
        dataUrl: processed.dataUrl,
        palette: processed.palette,
        fileName: file.name || 'uploaded-image.png',
        role: 'photo' // Default to photo
      });
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to process image');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleProcessImageFile(file);
    e.target.value = '';
  };

  // Paste image handler (Ctrl+V)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          handleProcessImageFile(file);
          break;
        }
      }
    }
  };

  const handleSendMessage = async (textToSend) => {
    let prompt = (textToSend || inputPrompt).trim();
    const currentAttachment = attachedImage;

    // If sending an image with empty prompt, provide a smart default prompt
    if (!prompt && currentAttachment) {
      if (currentAttachment.role === 'photo') {
        prompt = 'Create a professional modern ID card with this student photograph';
      } else if (currentAttachment.role === 'logo') {
        prompt = 'Use this university logo as watermark in the background and design the ID card';
      } else {
        prompt = 'Create a harmonious ID card matching the colors and theme of this image';
      }
    }

    if (!prompt && !currentAttachment) return;
    if (isLoading) return;

    setInputPrompt('');
    setAttachedImage(null);
    setErrorMsg(null);

    // If an image was attached, update the card canvas immediately
    if (currentAttachment && onImageAttached) {
      onImageAttached(currentAttachment.role, currentAttachment.dataUrl);
    }

    // Add user message to stream with attached thumbnail if present
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      image: currentAttachment ? currentAttachment.dataUrl : null,
      imageRole: currentAttachment ? currentAttachment.role : null
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          currentDesign,
          chatHistory: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
          imageMeta: currentAttachment
            ? {
                hasImage: true,
                role: currentAttachment.role,
                palette: currentAttachment.palette
              }
            : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      const rawActions = data.actions || [];
      const aiMessage = data.message || 'I have updated your ID card design.';
      const studentUpdates = data.studentUpdates;

      // Apply student profile updates if recognized
      if (studentUpdates && onUpdateStudentData && Object.keys(studentUpdates).length > 0) {
        onUpdateStudentData(studentUpdates);
      }

      // Validate & sanitize incoming actions
      const validatedActions = validateAndSanitizeActions(rawActions, currentDesign);

      if (validatedActions.length > 0) {
        onApplyActions(validatedActions, aiMessage);
      }

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: aiMessage,
          actionsCount: validatedActions.length,
          hasImageAttached: Boolean(currentAttachment),
          imageRole: currentAttachment?.role,
          studentUpdatesCount: studentUpdates ? Object.keys(studentUpdates).length : 0
        }
      ]);
    } catch (err) {
      console.error('AI chat error:', err);
      setErrorMsg(err.message || 'Failed to communicate with AI assistant.');
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, I encountered an issue: ${err.message}. Please try again.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputPrompt);
  };

  return (
    <div
      className={`relative flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-800 dark:text-slate-100 ${
        isDraggingOver ? 'ring-2 ring-blue-500 bg-blue-50/20' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
          handleProcessImageFile(file);
        }
      }}
    >
      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-blue-600/90 backdrop-blur-xs z-50 flex flex-col items-center justify-center text-white p-4 animate-in fade-in">
          <Upload size={38} className="animate-bounce mb-2" />
          <p className="font-bold text-sm">Drop image here</p>
          <p className="text-xs text-blue-100">Attach photo or logo to create your ID</p>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/20">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">ID Design AI</h2>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
                GROQ
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Attach a photo or logo or describe your design.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Generate with AI Fast Action */}
          <button
            type="button"
            onClick={() => handleSendMessage('Generate a complete professional modern college ID card design theme')}
            disabled={isLoading}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-sm flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            title="Auto-generate complete visual theme"
          >
            <Zap size={13} className="text-amber-300" />
            <span className="hidden sm:inline">✨ Generate</span>
          </button>

          {/* Optional Close Button for Floating Mode */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              title="Close AI Assistant"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Scrollable Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/20">
                <Bot size={15} />
              </div>
            )}

            <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {/* User Image Attachment thumbnail */}
              {msg.image && (
                <div className="mb-1 rounded-xl overflow-hidden border border-blue-400/40 shadow-sm relative group max-w-[200px]">
                  <img src={msg.image} alt="User attachment" className="w-full max-h-36 object-cover rounded-xl" />
                  <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs flex items-center gap-0.5">
                    {msg.imageRole === 'photo' ? '👤 Photo' : msg.imageRole === 'logo' ? '🏛️ Logo' : '🎨 Theme'}
                  </span>
                </div>
              )}

              <div
                className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs shadow-sm font-medium'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <p>{msg.content}</p>

                {msg.hasImageAttached && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-300/40 dark:border-slate-700/40 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    <span>
                      Applied image as {msg.imageRole === 'photo' ? 'Student Photo' : msg.imageRole === 'logo' ? 'College Logo' : 'Theme Reference'}
                    </span>
                  </div>
                )}

                {msg.studentUpdatesCount > 0 && (
                  <div className="mt-1 text-[10px] text-indigo-600 dark:text-indigo-300 font-medium flex items-center gap-1">
                    <span>✓ Extracted & updated {msg.studentUpdatesCount} student field(s)</span>
                  </div>
                )}

                {msg.actionsCount > 0 && (
                  <div className="mt-1 text-[10px] text-blue-600 dark:text-blue-300 font-medium flex items-center gap-1">
                    <span>✓ Applied {msg.actionsCount} design modification{msg.actionsCount > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User size={15} />
              </div>
            )}
          </div>
        ))}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic">
            <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Loader2 size={15} className="animate-spin text-blue-600" />
            </div>
            <span>Designing in realtime with Groq...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pills */}
      <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 mb-1.5">
          <Lightbulb size={11} className="text-amber-500" />
          <span>Quick Actions:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
          {SUGGESTED_PROMPTS.map((promptText) => (
            <button
              key={promptText}
              type="button"
              onClick={() => {
                if (promptText.includes('Attach photo')) {
                  imageInputRef.current?.click();
                } else {
                  handleSendMessage(promptText);
                }
              }}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-200/70 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 transition-colors border border-slate-300/40 dark:border-slate-700 disabled:opacity-50 text-left whitespace-nowrap cursor-pointer"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Image Attachment Preview Bar */}
      {attachedImage && (
        <div className="mx-3 mb-1 p-2 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 flex items-center justify-between gap-2.5 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={attachedImage.dataUrl}
                alt="Attachment"
                className="w-10 h-10 object-cover rounded-lg border border-slate-300 dark:border-slate-600 shadow-2xs"
              />
              {attachedImage.palette && (
                <div className="absolute -bottom-1 -right-1 flex gap-0.5 p-0.5 rounded-full bg-black/60 backdrop-blur-xs">
                  <span
                    className="w-2 h-2 rounded-full border border-white/50"
                    style={{ backgroundColor: attachedImage.palette.primary }}
                  />
                  <span
                    className="w-2 h-2 rounded-full border border-white/50"
                    style={{ backgroundColor: attachedImage.palette.accent }}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate max-w-[130px]">
                  {attachedImage.fileName}
                </span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-1 py-0.2 rounded border border-emerald-500/20">
                  Ready
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Use as:</span>
                <button
                  type="button"
                  onClick={() => setAttachedImage((prev) => ({ ...prev, role: 'photo' }))}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                    attachedImage.role === 'photo'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                  }`}
                >
                  👤 Photo
                </button>
                <button
                  type="button"
                  onClick={() => setAttachedImage((prev) => ({ ...prev, role: 'logo' }))}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                    attachedImage.role === 'logo'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                  }`}
                >
                  🏛️ Logo
                </button>
                <button
                  type="button"
                  onClick={() => setAttachedImage((prev) => ({ ...prev, role: 'reference' }))}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                    attachedImage.role === 'reference'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                  }`}
                >
                  🎨 Theme
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500 rounded-md transition shrink-0 cursor-pointer"
            title="Remove attached image"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleFormSubmit}
        className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
      >
        {/* Hidden File Input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/svg+xml"
          className="hidden"
          onChange={handleImageFileSelect}
        />

        {/* Upload Image Button */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={isLoading || isProcessingImage}
          className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
            attachedImage
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
              : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Upload Photo, Logo, or Reference to Create ID (or drag & drop/paste)"
        >
          {isProcessingImage ? (
            <Loader2 size={17} className="animate-spin text-blue-600" />
          ) : (
            <ImageIcon size={17} />
          )}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onPaste={handlePaste}
          placeholder={
            attachedImage
              ? attachedImage.role === 'photo'
                ? 'Type student details or press send to create ID...'
                : 'Describe watermark/logo placement or press send...'
              : 'Describe ID change or attach an image...'
          }
          disabled={isLoading}
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        <button
          type="submit"
          disabled={(!inputPrompt.trim() && !attachedImage) || isLoading}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition shadow-sm cursor-pointer shrink-0"
          title="Send command"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
