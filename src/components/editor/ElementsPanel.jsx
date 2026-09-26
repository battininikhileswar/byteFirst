import React, { useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  Square,
  QrCode,
  Barcode as BarcodeIcon,
  Variable,
  LayoutTemplate,
  Palette,
  Upload,
  User,
  Building,
  Hash,
  Mail,
  Phone,
  Calendar,
  Heart,
  MapPin,
  Circle as CircleIcon,
  Minus
} from 'lucide-react';

export default function ElementsPanel({
  onAddText,
  onAddShape,
  onAddImage,
  onAddQr,
  onAddBarcode,
  onAddDynamicField,
  onApplyTemplate,
  background,
  onChangeBackground
}) {
  const [activeTab, setActiveTab] = useState('text'); // text, media, shapes, dynamic, templates, background

  // Trigger file dialog for uploading images / logos
  const handleFileUpload = (e, type = 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onAddImage(event.target.result, type);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="w-80 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col z-20 select-none">
      {/* Category Icons Tabs */}
      <div className="flex items-center justify-around border-b border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-900/60">
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex flex-col items-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition ${
            activeTab === 'text'
              ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="Text Elements"
        >
          <Type size={16} />
          <span>Text</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('media')}
          className={`flex flex-col items-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition ${
            activeTab === 'media'
              ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="Media & Photos"
        >
          <ImageIcon size={16} />
          <span>Media</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shapes')}
          className={`flex flex-col items-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition ${
            activeTab === 'shapes'
              ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="Shapes & Dividers"
        >
          <Square size={16} />
          <span>Shapes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dynamic')}
          className={`flex flex-col items-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition ${
            activeTab === 'dynamic'
              ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="Dynamic Data Fields"
        >
          <Variable size={16} />
          <span>Fields</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('background')}
          className={`flex flex-col items-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition ${
            activeTab === 'background'
              ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="Card Background"
        >
          <Palette size={16} />
          <span>Canvas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`flex flex-col items-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition ${
            activeTab === 'templates'
              ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="Presets & Templates"
        >
          <LayoutTemplate size={16} />
          <span>Templates</span>
        </button>
      </div>

      {/* Tab Content Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. TEXT TAB */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Standard Text</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onAddText({ text: 'Card Heading', fontSize: 22, fontWeight: 'bold' })}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 text-left font-bold text-base transition flex items-center justify-between"
                >
                  <span>Add Heading</span>
                  <span className="text-xs text-slate-400 font-mono">22px</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddText({ text: 'Subheading Title', fontSize: 16, fontWeight: '600' })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 text-left font-semibold text-sm transition flex items-center justify-between"
                >
                  <span>Add Subheading</span>
                  <span className="text-xs text-slate-400 font-mono">16px</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddText({ text: 'Standard body text content here', fontSize: 13, fontWeight: 'normal' })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 text-left text-xs transition flex items-center justify-between"
                >
                  <span>Add Body Text</span>
                  <span className="text-xs text-slate-400 font-mono">13px</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddText({ text: 'Small footnote or disclaimer', fontSize: 10, fontWeight: 'normal', fill: '#64748b' })}
                  className="w-full py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 text-left text-[11px] text-slate-500 transition flex items-center justify-between"
                >
                  <span>Add Small Text</span>
                  <span className="text-[10px] text-slate-400 font-mono">10px</span>
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ID Card Pre-built Text</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onAddText({ text: 'NAME: {{name}}', fontSize: 15, fontWeight: 'bold' })}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition flex items-center gap-1.5"
                >
                  <User size={14} className="text-blue-500" />
                  <span>Full Name</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddText({ text: 'ID: {{employee_id}}', fontSize: 13, fontFamily: 'JetBrains Mono', fontWeight: 'bold', fill: '#2563eb' })}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition flex items-center gap-1.5"
                >
                  <Hash size={14} className="text-indigo-500" />
                  <span>ID Number</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddText({ text: 'DEPT: {{department}}', fontSize: 12, fontWeight: '600' })}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition flex items-center gap-1.5"
                >
                  <Building size={14} className="text-sky-500" />
                  <span>Department</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddText({ text: 'PH: {{phone}}', fontSize: 11, fontFamily: 'JetBrains Mono' })}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition flex items-center gap-1.5"
                >
                  <Phone size={14} className="text-emerald-500" />
                  <span>Phone</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddText({ text: 'EMAIL: {{email}}', fontSize: 11 })}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition flex items-center gap-1.5"
                >
                  <Mail size={14} className="text-amber-500" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddText({ text: 'DOB: {{dob}}', fontSize: 11, fontFamily: 'JetBrains Mono' })}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition flex items-center gap-1.5"
                >
                  <Calendar size={14} className="text-purple-500" />
                  <span>Date of Birth</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddText({ text: 'BLOOD: {{bloodGroup}}', fontSize: 12, fontWeight: 'bold', fill: '#dc2626', fontFamily: 'JetBrains Mono' })}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition flex items-center gap-1.5"
                >
                  <Heart size={14} className="text-rose-500" />
                  <span>Blood Group</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddText({ text: 'EXPIRY: {{expiry_date}}', fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 'bold' })}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition flex items-center gap-1.5"
                >
                  <Calendar size={14} className="text-teal-500" />
                  <span>Expiry Date</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. MEDIA TAB */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Upload Elements</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 transition">
                  <User size={20} className="text-blue-500" />
                  <span className="text-xs font-semibold">Profile Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'profile-photo')}
                    className="hidden"
                  />
                </label>

                <label className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 transition">
                  <Building size={20} className="text-indigo-500" />
                  <span className="text-xs font-semibold">College / Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    className="hidden"
                  />
                </label>

                <label className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 transition col-span-2">
                  <Upload size={20} className="text-slate-500" />
                  <span className="text-xs font-semibold">Upload Any Image / Signature</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Machine-Readable Codes</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onAddQr('https://verify.auntyid.com/student/{{employee_id}}')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col items-center justify-center text-center gap-1.5 transition"
                >
                  <QrCode size={22} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold">Add QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddBarcode('{{employee_id}}')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col items-center justify-center text-center gap-1.5 transition"
                >
                  <BarcodeIcon size={22} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold">Add Barcode</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. SHAPES TAB */}
        {activeTab === 'shapes' && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Geometric Shapes</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onAddShape({ shapeType: 'rect', fill: '#3b82f6', width: 140, height: 80 })}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 flex flex-col items-center gap-2 transition"
              >
                <div className="w-12 h-8 bg-blue-500 rounded-none shadow-sm" />
                <span className="text-xs font-semibold">Rectangle</span>
              </button>

              <button
                type="button"
                onClick={() => onAddShape({ shapeType: 'rounded-rect', fill: '#2563eb', cornerRadius: 12, width: 140, height: 80 })}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 flex flex-col items-center gap-2 transition"
              >
                <div className="w-12 h-8 bg-blue-600 rounded-lg shadow-sm" />
                <span className="text-xs font-semibold">Rounded Rect</span>
              </button>

              <button
                type="button"
                onClick={() => onAddShape({ shapeType: 'circle', fill: '#06b6d4', width: 90, height: 90 })}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 flex flex-col items-center gap-2 transition"
              >
                <div className="w-9 h-9 bg-cyan-500 rounded-full shadow-sm" />
                <span className="text-xs font-semibold">Circle</span>
              </button>

              <button
                type="button"
                onClick={() => onAddShape({ shapeType: 'line', fill: '#cbd5e1', stroke: '#cbd5e1', strokeWidth: 2, width: 220, height: 2 })}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 flex flex-col items-center gap-2 transition"
              >
                <div className="w-12 h-1 bg-slate-400 rounded-full my-4" />
                <span className="text-xs font-semibold">Line / Divider</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. DYNAMIC DATA FIELDS TAB */}
        {activeTab === 'dynamic' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              <strong>Dynamic Placeholders:</strong> Clicking any tag places a dynamic placeholder onto the canvas. During final ID generation & preview, real student/employee data replaces them automatically!
            </div>

            <div className="grid grid-cols-1 gap-2">
              {[
                { tag: '{{name}}', label: 'Student / Employee Name', icon: User },
                { tag: '{{employee_id}}', label: 'Roll Number / ID', icon: Hash },
                { tag: '{{department}}', label: 'Department / Branch', icon: Building },
                { tag: '{{designation}}', label: 'Designation / Year', icon: User },
                { tag: '{{company_name}}', label: 'College / Company Name', icon: Building },
                { tag: '{{phone}}', label: 'Phone Contact', icon: Phone },
                { tag: '{{email}}', label: 'Email Address', icon: Mail },
                { tag: '{{dob}}', label: 'Date of Birth', icon: Calendar },
                { tag: '{{bloodGroup}}', label: 'Blood Group', icon: Heart },
                { tag: '{{address}}', label: 'Residential Address', icon: MapPin },
                { tag: '{{expiry_date}}', label: 'Card Expiry Date', icon: Calendar }
              ].map((f) => {
                const IconComponent = f.icon;
                return (
                  <button
                    key={f.tag}
                    type="button"
                    onClick={() => onAddDynamicField(f.tag, f.label)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 text-left transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent size={15} className="text-blue-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{f.label}</p>
                        <p className="text-[10px] font-mono text-blue-600 dark:text-blue-400">{f.tag}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 opacity-0 group-hover:opacity-100 transition">
                      + Add
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. BACKGROUND TAB */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Card Canvas Base</p>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Background Style
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => onChangeBackground({ type: 'solid' })}
                    className={`py-2 rounded-lg border transition ${
                      background.type === 'solid'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Solid Color
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeBackground({ type: 'gradient', gradientStart: '#ffffff', gradientEnd: '#f1f5f9' })}
                    className={`py-2 rounded-lg border transition ${
                      background.type === 'gradient'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Linear Gradient
                  </button>
                </div>
              </div>

              {background.type === 'solid' ? (
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={background.color || '#ffffff'}
                      onChange={(e) => onChangeBackground({ color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={background.color || '#ffffff'}
                      onChange={(e) => onChangeBackground({ color: e.target.value })}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Gradient Start
                    </label>
                    <input
                      type="color"
                      value={background.gradientStart || '#ffffff'}
                      onChange={(e) => onChangeBackground({ gradientStart: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Gradient End
                    </label>
                    <input
                      type="color"
                      value={background.gradientEnd || '#f1f5f9'}
                      onChange={(e) => onChangeBackground({ gradientEnd: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Opacity ({Math.round((background.opacity !== undefined ? background.opacity : 1) * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={background.opacity !== undefined ? background.opacity : 1}
                  onChange={(e) => onChangeBackground({ opacity: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ready-Made Designs</p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => onApplyTemplate('generated-dashboard')}
                className="w-full p-3 rounded-xl border-2 border-blue-500 hover:border-blue-600 text-left transition bg-blue-50/50 dark:bg-blue-950/30 group"
              >
                <div className="h-20 w-full rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 mb-2 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                  Generated Dashboard Card (Landscape)
                </div>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Generated Dashboard Card</p>
                <p className="text-[11px] text-slate-500">Exact ID card generated from your AuntyID dashboard in landscape layout</p>
              </button>

              <button
                type="button"
                onClick={() => onApplyTemplate('student-campus')}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition bg-slate-50/50 dark:bg-slate-800/40 group"
              >
                <div className="h-20 w-full rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 mb-2 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                  Academic Campus ID
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Academic Campus ID</p>
                <p className="text-[11px] text-slate-500">Dual-sided student ID with photo frame, QR & barcode</p>
              </button>

              <button
                type="button"
                onClick={() => onApplyTemplate('corporate-minimal')}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition bg-slate-50/50 dark:bg-slate-800/40 group"
              >
                <div className="h-20 w-full rounded-lg bg-slate-900 border border-slate-700 mb-2 flex items-center justify-center text-cyan-400 font-bold text-xs shadow-inner">
                  Corporate Executive Badge
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Corporate Executive Badge</p>
                <p className="text-[11px] text-slate-500">Dark theme corporate credential with cyan accents</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
