import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client.js";
import { getSocket } from "../api/socket.js";
import { useAuth } from "../context/AuthContext.jsx";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import "../styles/chat.css";

export default function Chat() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineIds, setOnlineIds] = useState(new Set());
  const [typingFrom, setTypingFrom] = useState(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Load contact list once.
  useEffect(() => {
    api
      .getUsers(token)
      .then((data) => setUsers(data.users))
      .catch(() => {});
  }, [token]);

  // Load history whenever the active conversation changes.
  useEffect(() => {
    if (!activeContact) return;
    api
      .getMessages(token, activeContact.id)
      .then((data) => setMessages(data.messages))
      .catch(() => {});
  }, [activeContact, token]);

  // Wire up realtime events once.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleNewMessage(msg) {
      setMessages((prev) => {
        const relevantToOpenChat =
          activeContact &&
          (msg.senderId === activeContact.id || msg.receiverId === activeContact.id);
        if (!relevantToOpenChat) return prev;
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    }

    function handlePresence({ userId, online }) {
      setOnlineIds((prev) => {
        const next = new Set(prev);
        if (online) next.add(userId);
        else next.delete(userId);
        return next;
      });
    }

    function handleTyping({ userId, isTyping }) {
      setTypingFrom((prev) => {
        if (!activeContact || userId !== activeContact.id) return prev;
        return isTyping ? userId : null;
      });
    }

    socket.on("message:new", handleNewMessage);
    socket.on("presence:update", handlePresence);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("presence:update", handlePresence);
      socket.off("typing", handleTyping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeContact]);

  const handleSelectUser = useCallback((u) => {
    setActiveContact(u);
    setTypingFrom(null);
    setMobileShowChat(true);
  }, []);

  const handleSend = useCallback(
    (content) => {
      const socket = getSocket();
      if (!socket || !activeContact) return;
      socket.emit(
        "message:send",
        { receiverId: activeContact.id, content },
        (ack) => {
          if (ack?.error) {
            console.error(ack.error);
          }
        }
      );
    },
    [activeContact]
  );

  const handleTyping = useCallback(
    (isTyping) => {
      const socket = getSocket();
      if (!socket || !activeContact) return;
      socket.emit("typing", { receiverId: activeContact.id, isTyping });
    },
    [activeContact]
  );

  return (
    <div className="chat-page">
      <Sidebar
        users={users}
        activeUserId={activeContact?.id}
        onSelectUser={handleSelectUser}
        onlineIds={onlineIds}
        mobileOpen={!mobileShowChat}
      />
      <div className={`chat-window-wrap${mobileShowChat ? " mobile-open" : ""}`}>
        <ChatWindow
          contact={activeContact}
          messages={messages}
          onSend={handleSend}
          onTyping={handleTyping}
          isTyping={typingFrom === activeContact?.id}
          onBack={() => setMobileShowChat(false)}
        />
      </div>
    </div>
  );
}
