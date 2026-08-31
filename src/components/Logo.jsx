export default function Logo({ size = "md", inverted = false }) {
  const sizes = {
    sm: { font: "1.05rem", dot: "0.35em" },
    md: { font: "1.6rem", dot: "0.35em" },
    lg: { font: "2.6rem", dot: "0.3em" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: s.font,
        letterSpacing: "-0.02em",
        color: inverted ? "#F1EEE4" : "var(--text)",
        display: "inline-flex",
        alignItems: "baseline",
        whiteSpace: "nowrap",
      }}
    >
      Ahsan
      <span style={{ color: "var(--amber)", fontSize: s.dot }}>.</span>
      <span style={{ fontStyle: "italic", fontWeight: 500 }}>Dev</span>
    </span>
  );
}
