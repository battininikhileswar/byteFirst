import React, { useRef, useState } from 'react';
import { 
  User, 
  Hash, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Layers, 
  Mail, 
  Phone, 
  Heart, 
  MapPin, 
  Upload, 
  Trash2, 
  AlertCircle,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { BRANCH_OPTIONS, YEAR_OPTIONS, BLOOD_GROUPS } from '../data/sampleData';
import { validateImageFile } from '../utils/validation';

export default function StudentForm({
  formData,
  errors,
  onChange,
  onPhotoUpload,
  onPhotoRemove,
  onLogoUpload,
  onLogoRemove,
  onLoadSample,
  onReset
}) {
  const fileInputRef = useRef(null);
  const [photoError, setPhotoError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setPhotoError(validation.error);
      return;
    }

    setPhotoError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      onPhotoUpload(e.target.result);
    };
    reader.onerror = () => {
      setPhotoError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="student-form-card">
      
      {/* Form Card Header */}
      <div className="form-card-header">
        <div>
          <h3 className="form-card-title">Student Information</h3>
          <p className="form-card-subtitle">
            All fields are controlled inputs syncing directly with the live ID preview.
          </p>
        </div>

        <div className="form-quick-actions">
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={onLoadSample}
            title="Load sample student profile"
          >
            <Sparkles size={14} />
            <span>Load Sample Data</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-xs text-danger"
            onClick={onReset}
            title="Reset form fields"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <form className="student-form" onSubmit={(e) => e.preventDefault()}>
        
        {/* Photo Upload Section */}
        <div className="form-section">
          <label className="form-section-title">
            <User size={16} />
            <span>Student Photograph</span>
          </label>

          <div
            className={`photo-upload-zone ${dragOver ? 'drag-over' : ''} ${formData.photoUrl ? 'has-photo' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              style={{ display: 'none' }}
            />

            {formData.photoUrl ? (
              <div className="photo-preview-active">
                <img
                  src={formData.photoUrl}
                  alt="Student Preview"
                  className="photo-preview-thumb"
                />
                <div className="photo-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-outline btn-xs"
                    onClick={onPhotoRemove}
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="photo-upload-placeholder">
                <div className="upload-icon-circle">
                  <Upload size={20} />
                </div>
                <div className="upload-text">
                  <span className="upload-text-main">Click to upload</span> or drag and drop photo
                </div>
                <span className="upload-text-hint">PNG, JPG, or WEBP (Max 5MB)</span>
              </div>
            )}
          </div>

          {photoError && (
            <div className="form-field-error">
              <AlertCircle size={14} />
              <span>{photoError}</span>
            </div>
          )}
        </div>

        {/* Section: Academic Identity */}
        <div className="form-section">
          <label className="form-section-title">
            <GraduationCap size={16} />
            <span>Academic Identity</span>
          </label>

          <div className="form-grid">
            {/* College Name */}
            <div className="form-group full-width">
              <label htmlFor="collegeName" className="form-label">
                College / University Name <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <GraduationCap size={18} className="input-icon" />
                <input
                  id="collegeName"
                  name="collegeName"
                  type="text"
                  placeholder="e.g. Indian Institute of Technology"
                  value={formData.collegeName}
                  onChange={onChange}
                  className={`form-input ${errors.collegeName ? 'has-error' : ''}`}
                />
              </div>
              {errors.collegeName && (
                <span className="field-error-text">{errors.collegeName}</span>
              )}
            </div>

            {/* College Logo / Watermark Upload */}
            <div className="form-group full-width">
              <div className="flex items-center justify-between mb-1">
                <label className="form-label text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <GraduationCap size={14} className="text-blue-600" />
                  <span>College Logo / Watermark Emblem</span>
                </label>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={onLogoRemove}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Remove Logo</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                {formData.logoUrl ? (
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Upload size={18} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                    {formData.logoUrl ? 'Custom logo uploaded' : 'Upload college seal / watermark logo'}
                  </p>
                  <p className="text-[10px] text-slate-400">PNG, SVG, or JPG (Send to Back for watermark)</p>
                </div>
                <label className="btn btn-secondary btn-xs cursor-pointer shrink-0">
                  <span>{formData.logoUrl ? 'Change' : 'Upload Logo'}</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onLogoUpload) {
                        const reader = new FileReader();
                        reader.onload = (ev) => onLogoUpload(ev.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group half-width">
              <label htmlFor="fullName" className="form-label">
                Full Name <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="e.g. Harshavardhan P"
                  value={formData.fullName}
                  onChange={onChange}
                  className={`form-input ${errors.fullName ? 'has-error' : ''}`}
                />
              </div>
              {errors.fullName && (
                <span className="field-error-text">{errors.fullName}</span>
              )}
            </div>

            {/* Roll Number */}
            <div className="form-group half-width">
              <label htmlFor="rollNumber" className="form-label">
                Roll Number / Student ID <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Hash size={18} className="input-icon" />
                <input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  placeholder="e.g. 21B91A0582"
                  value={formData.rollNumber}
                  onChange={onChange}
                  className={`form-input uppercase ${errors.rollNumber ? 'has-error' : ''}`}
                />
              </div>
              {errors.rollNumber && (
                <span className="field-error-text">{errors.rollNumber}</span>
              )}
            </div>

            {/* Branch */}
            <div className="form-group full-width">
              <label htmlFor="branch" className="form-label">
                Branch / Department <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <BookOpen size={18} className="input-icon" />
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={onChange}
                  className={`form-select ${errors.branch ? 'has-error' : ''}`}
                >
                  <option value="">Select Branch...</option>
                  {BRANCH_OPTIONS.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
              {errors.branch && (
                <span className="field-error-text">{errors.branch}</span>
              )}
            </div>

            {/* Year */}
            <div className="form-group half-width">
              <label htmlFor="year" className="form-label">
                Academic Year <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={onChange}
                  className={`form-select ${errors.year ? 'has-error' : ''}`}
                >
                  <option value="">Select Year...</option>
                  {YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {errors.year && (
                <span className="field-error-text">{errors.year}</span>
              )}
            </div>

            {/* Section */}
            <div className="form-group half-width">
              <label htmlFor="section" className="form-label">
                Section <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Layers size={18} className="input-icon" />
                <input
                  id="section"
                  name="section"
                  type="text"
                  placeholder="e.g. A, B, C or 1"
                  value={formData.section}
                  onChange={onChange}
                  maxLength={5}
                  className={`form-input uppercase ${errors.section ? 'has-error' : ''}`}
                />
              </div>
              {errors.section && (
                <span className="field-error-text">{errors.section}</span>
              )}
            </div>
          </div>
        </div>

        {/* Section: Personal & Contact Information */}
        <div className="form-section">
          <label className="form-section-title">
            <User size={16} />
            <span>Personal & Contact Information</span>
          </label>

          <div className="form-grid">
            {/* Email */}
            <div className="form-group half-width">
              <label htmlFor="email" className="form-label">
                Email Address <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={onChange}
                  className={`form-input ${errors.email ? 'has-error' : ''}`}
                />
              </div>
              {errors.email && (
                <span className="field-error-text">{errors.email}</span>
              )}
            </div>

            {/* Phone */}
            <div className="form-group half-width">
              <label htmlFor="phone" className="form-label">
                Phone Number <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={onChange}
                  className={`form-input ${errors.phone ? 'has-error' : ''}`}
                />
              </div>
              {errors.phone && (
                <span className="field-error-text">{errors.phone}</span>
              )}
            </div>

            {/* Date of Birth */}
            <div className="form-group half-width">
              <label htmlFor="dob" className="form-label">
                Date of Birth <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={onChange}
                  className={`form-input ${errors.dob ? 'has-error' : ''}`}
                />
              </div>
              {errors.dob && (
                <span className="field-error-text">{errors.dob}</span>
              )}
            </div>

            {/* Blood Group */}
            <div className="form-group half-width">
              <label htmlFor="bloodGroup" className="form-label">
                Blood Group <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Heart size={18} className="input-icon text-danger" />
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={onChange}
                  className={`form-select ${errors.bloodGroup ? 'has-error' : ''}`}
                >
                  <option value="">Select Blood Group...</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
              {errors.bloodGroup && (
                <span className="field-error-text">{errors.bloodGroup}</span>
              )}
            </div>

            {/* Address */}
            <div className="form-group full-width">
              <label htmlFor="address" className="form-label">
                Residential Address / City <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon" />
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="e.g. Hyderabad, Telangana"
                  value={formData.address}
                  onChange={onChange}
                  className={`form-input ${errors.address ? 'has-error' : ''}`}
                />
              </div>
              {errors.address && (
                <span className="field-error-text">{errors.address}</span>
              )}
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
