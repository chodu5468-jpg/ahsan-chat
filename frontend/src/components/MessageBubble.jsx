function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`bubble-row ${isOwn ? 'bubble-row--own' : ''}`}>
      <div className={`bubble ${isOwn ? 'bubble--own' : 'bubble--other'}`}>
        <p className="bubble__text">{message.content}</p>
        <span className="bubble__time">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
