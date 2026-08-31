import { useState, useRef } from "react";
import { SendIcon } from "./Icons.jsx";

export default function MessageInput({ onSend, onTyping }) {
  const [value, setValue] = useState("");
  const typingTimeout = useRef(null);

  function handleChange(e) {
    setValue(e.target.value);
    onTyping?.(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping?.(false), 1200);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    onTyping?.(false);
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Write something…"
        value={value}
        onChange={handleChange}
        autoComplete="off"
      />
      <button type="submit" className="send-btn" aria-label="Send message">
        <SendIcon />
      </button>
    </form>
  );
}
