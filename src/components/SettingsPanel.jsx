import { useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { SunIcon, MoonIcon, GearIcon, ImageIcon, CloseIcon } from "./Icons.jsx";

const SWATCHES = [
  { label: "Default", value: "" },
  { label: "Moss", value: "#2f3a32" },
  { label: "Clay", value: "#4a2f26" },
  { label: "Linen", value: "#e8e0cc" },
  { label: "Ink", value: "#14181a" },
];

export default function SettingsPanel() {
  const { mode, toggleMode, background, setBackground, DEFAULT_BACKGROUND } = useTheme();
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(background.type === "image" ? background.value : "");

  function applyColor(value) {
    if (!value) {
      setBackground(DEFAULT_BACKGROUND);
    } else {
      setBackground({ type: "color", value });
    }
  }

  function applyImage(e) {
    e.preventDefault();
    if (imageUrl.trim()) {
      setBackground({ type: "image", value: imageUrl.trim() });
    }
  }

  return (
    <div className="settings-wrap">
      <button
        className="icon-btn"
        onClick={() => setOpen((o) => !o)}
        title="Chat settings"
        type="button"
        aria-expanded={open}
      >
        <GearIcon />
      </button>

      {open && (
        <div className="settings-panel">
          <div className="settings-panel-head">
            <span>Chat settings</span>
            <button className="icon-btn" onClick={() => setOpen(false)} type="button" aria-label="Close">
              <CloseIcon />
            </button>
          </div>

          <div className="settings-section">
            <span className="settings-label">Appearance</span>
            <button className="theme-toggle" onClick={toggleMode} type="button">
              {mode === "light" ? <MoonIcon /> : <SunIcon />}
              Switch to {mode === "light" ? "dark" : "light"} mode
            </button>
          </div>

          <div className="settings-section">
            <span className="settings-label">Background</span>
            <div className="swatch-row">
              {SWATCHES.map((s) => (
                <button
                  key={s.label}
                  className={`swatch${
                    background.type === "color" && background.value === s.value
                      ? " active"
                      : !s.value && background.type === "default"
                      ? " active"
                      : ""
                  }`}
                  style={{ background: s.value || "var(--bg-sunken)" }}
                  title={s.label}
                  onClick={() => applyColor(s.value)}
                  type="button"
                />
              ))}
            </div>

            <form className="bg-url-form" onSubmit={applyImage}>
              <ImageIcon />
              <input
                type="url"
                placeholder="Paste an image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button type="submit">Set</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
