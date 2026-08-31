function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function MessageBubble({ content, createdAt, mine }) {
  return (
    <div className={`bubble-row${mine ? " mine" : ""}`}>
      <div className={`bubble${mine ? " mine" : ""}`}>
        <p>{content}</p>
        <span className="bubble-time">{formatTime(createdAt)}</span>
      </div>
    </div>
  );
}
