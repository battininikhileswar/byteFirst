import React from 'react';
import { Palette, Layout, RotateCw, Check } from 'lucide-react';
import { CARD_THEMES, CARD_ORIENTATIONS } from '../data/themes';

export default function ThemeSelector({
  selectedTheme,
  onThemeChange,
  orientation,
  onOrientationChange,
  isFlipped,
  onToggleFlip
}) {
  return (
    <div className="theme-selector-card w-full min-w-0">
      <div className="selector-section">
        <div className="selector-title">
          <Palette size={16} />
          <span>Card Color Theme</span>
        </div>
        <div className="theme-swatches-grid">
          {CARD_THEMES.map((theme) => {
            const isSelected = selectedTheme.id === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                className={`theme-swatch-btn ${isSelected ? 'is-active' : ''}`}
                onClick={() => onThemeChange(theme)}
                title={theme.name}
              >
                <span
                  className="swatch-circle"
                  style={{ background: theme.headerBg }}
                >
                  {isSelected && <Check size={14} className="swatch-check" />}
                </span>
                <span className="swatch-label">{theme.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="selector-divider"></div>

      <div className="selector-row">
        {/* Orientation Switcher */}
        <div className="selector-col">
          <div className="selector-title">
            <Layout size={16} />
            <span>Orientation</span>
          </div>
          <div className="orientation-toggle-group">
            {CARD_ORIENTATIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`toggle-pill ${orientation === opt.id ? 'is-active' : ''}`}
                onClick={() => onOrientationChange(opt.id)}
              >
                <span>{opt.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Card Face Flip Button */}
        <div className="selector-col">
          <div className="selector-title">
            <RotateCw size={16} />
            <span>Card Face</span>
          </div>
          <button
            type="button"
            className={`btn btn-secondary btn-sm flip-card-btn ${isFlipped ? 'btn-active' : ''}`}
            onClick={onToggleFlip}
          >
            <RotateCw size={15} className={isFlipped ? 'spin-180' : ''} />
            <span>{isFlipped ? 'Viewing Back (Flip)' : 'Viewing Front (Flip)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
