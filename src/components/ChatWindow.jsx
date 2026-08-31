import { useEffect, useRef } from "react";
import Avatar from "./Avatar.jsx";
import MessageBubble from "./MessageBubble.jsx";
import MessageInput from "./MessageInput.jsx";
import SettingsPanel from "./SettingsPanel.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ChatWindow({ contact, messages, onSend, onTyping, isTyping, onBack }) {
  const { background } = useTheme();
  const { user } = useAuth();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const bgStyle =
    background.type === "color"
      ? { background: background.value }
      : background.type === "image"
      ? {
          backgroundImage: `url(${background.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {};

  if (!contact) {
    return (
      <div className="chat-window chat-window-empty">
        <p>Pick someone from the list to start talking.</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <header className="chat-header">
        <button className="icon-btn back-btn" onClick={onBack} type="button" aria-label="Back to contacts">
          ←
        </button>
        <Avatar username={contact.username} color={contact.avatarColor} size={38} />
        <div className="chat-header-meta">
          <span className="chat-header-name">{contact.username}</span>
          <span className="chat-header-status">{isTyping ? "Typing…" : "\u00A0"}</span>
        </div>
        <div className="chat-header-actions">
          <SettingsPanel />
        </div>
      </header>

      <div className="chat-messages" ref={scrollRef} style={bgStyle}>
        {messages.length === 0 && (
          <p className="chat-messages-empty">
            This is the start of your conversation with {contact.username}.
          </p>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            content={m.content}
            createdAt={m.createdAt}
            mine={m.senderId === user.id}
          />
        ))}
      </div>

      <MessageInput onSend={onSend} onTyping={onTyping} />
    </div>
  );
}
