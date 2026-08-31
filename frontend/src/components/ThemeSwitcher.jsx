import { useState } from 'react';
import { useTheme, ACCENT_PRESETS, BACKGROUND_PRESETS } from '../context/ThemeContext';

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <line x1="8" y1="0.5" x2="8" y2="2.3" />
        <line x1="8" y1="13.7" x2="8" y2="15.5" />
        <line x1="0.5" y1="8" x2="2.3" y2="8" />
        <line x1="13.7" y1="8" x2="15.5" y2="8" />
        <line x1="2.6" y1="2.6" x2="3.9" y2="3.9" />
        <line x1="12.1" y1="12.1" x2="13.4" y2="13.4" />
        <line x1="2.6" y1="13.4" x2="3.9" y2="12.1" />
        <line x1="12.1" y1="3.9" x2="13.4" y2="2.6" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.8 9.9A6 6 0 1 1 6.1 2.2a6.6 6.6 0 1 0 7.7 7.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function ThemeSwitcher({ align = 'right' }) {
  const { mode, toggleMode, accent, setAccent, background, setBackground } = useTheme();
  const [open, setOpen] = useState(false);
  const bgPresets = BACKGROUND_PRESETS[mode];

  return (
    <div className={`theme-switcher theme-switcher--${align}`}>
      <button
        type="button"
        className="theme-switcher__toggle"
        onClick={() => toggleMode()}
        aria-label={mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        title={mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      >
        {mode === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>

      <button
        type="button"
        className="theme-switcher__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Customize colors"
        title="Customize colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="8" cy="8" r="2.1" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div className="theme-panel" role="dialog" aria-label="Theme options">
          <div className="theme-panel__group">
            <span className="theme-panel__label">Accent</span>
            <div className="theme-panel__swatches">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`swatch ${accent === preset.value ? 'swatch--active' : ''}`}
                  style={{ background: preset.value }}
                  title={preset.name}
                  aria-label={`Accent: ${preset.name}`}
                  onClick={() => setAccent(preset.value)}
                />
              ))}
            </div>
          </div>

          <div className="theme-panel__group">
            <span className="theme-panel__label">Background</span>
            <div className="theme-panel__swatches">
              {bgPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`swatch ${background === preset.value ? 'swatch--active' : ''}`}
                  style={{ background: preset.value }}
                  title={preset.name}
                  aria-label={`Background: ${preset.name}`}
                  onClick={() => setBackground(preset.value)}
                />
              ))}
              <label className="swatch swatch--custom" title="Custom background color">
                <input
                  type="color"
                  value={background || '#f1eee6'}
                  onChange={(e) => setBackground(e.target.value)}
                  aria-label="Custom background color"
                />
              </label>
            </div>
          </div>

          <button
            type="button"
            className="theme-panel__reset"
            onClick={() => {
              setAccent('');
              setBackground('');
            }}
          >
            Reset to default
          </button>
        </div>
      )}
    </div>
  );
}
