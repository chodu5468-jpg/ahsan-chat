import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M2 9L15.5 2.5L11 16L8 10L2 9Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M8 10L15.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M11 3.5L4.5 9L11 14.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

let typingTimeout = null;

export default function ConversationView({
  contact,
  messages,
  loading,
  isTyping,
  onBack,
  isOnline,
  className = ''
}) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  function notifyTyping(active) {
    if (!socket || !contact) return;
    socket.emit('typing', { receiverId: contact.id, isTyping: active });
  }

  function handleChange(e) {
    setDraft(e.target.value);
    notifyTyping(true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => notifyTyping(false), 1500);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !socket || !contact) return;

    socket.emit('send_message', { receiverId: contact.id, content }, (response) => {
      if (response && response.error) {
        setError(response.error);
      }
    });

    setDraft('');
    clearTimeout(typingTimeout);
    notifyTyping(false);
  }

  if (!contact) {
    return (
      <section className={`conversation conversation--empty ${className}`}>
        <p>Pick a friend on the left to start chatting.</p>
      </section>
    );
  }

  return (
    <section className={`conversation ${className}`}>
      <header className="conversation__header">
        <button type="button" className="conversation__back" onClick={onBack} aria-label="Back to contacts">
          <BackIcon />
        </button>
        <div>
          <h2 className="conversation__name">{contact.username}</h2>
          <span className="conversation__status">
            {isTyping ? 'Typing…' : isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </header>

      <div className="conversation__list" ref={listRef}>
        {loading && <p className="conversation__empty">Loading conversation&hellip;</p>}
        {!loading && messages.length === 0 && (
          <p className="conversation__empty">Say hello to {contact.username}.</p>
        )}
        {!loading &&
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} isOwn={message.senderId === user.id} />
          ))}
      </div>

      <form className="conversation__composer" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          onChange={handleChange}
          placeholder={`Message ${contact.username}`}
          maxLength={2000}
          aria-label="Message"
        />
        <button type="submit" className="conversation__send" disabled={!draft.trim()} aria-label="Send message">
          <SendIcon />
        </button>
      </form>
      {error && <p className="conversation__error">{error}</p>}
    </section>
  );
}
