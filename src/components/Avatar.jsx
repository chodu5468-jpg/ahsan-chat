export default function Avatar({ username, color, size = 40 }) {
  const initial = (username || "?").charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color || "var(--amber)",
        color: "#241c0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: size * 0.42,
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
