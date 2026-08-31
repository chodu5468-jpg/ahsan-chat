import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import ConversationView from '../components/ConversationView';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import '../styles/chat.css';

export default function ChatPage() {
  const { user } = useAuth();
  const { socket, onlineUserIds } = useSocket();

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [activeUserId, setActiveUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typingActive, setTypingActive] = useState(false);
  const [mobileShowConversation, setMobileShowConversation] = useState(false);

  const activeContact = users.find((u) => u.id === activeUserId) || null;

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data } = await api.get('/users', { params: { search } });
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to load contacts', err);
    } finally {
      setUsersLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!activeUserId) return;
    let cancelled = false;
    setMessagesLoading(true);
    api
      .get(`/messages/${activeUserId}`)
      .then(({ data }) => {
        if (!cancelled) setMessages(data.messages);
      })
      .catch((err) => console.error('Failed to load messages', err))
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });

    // Clear the unread badge for this contact locally right away.
    setUsers((prev) => prev.map((u) => (u.id === activeUserId ? { ...u, unreadCount: 0 } : u)));

    return () => {
      cancelled = true;
    };
  }, [activeUserId]);

  useEffect(() => {
    if (!socket) return;

    function handleReceive(message) {
      const otherPartyId = message.senderId === user.id ? message.receiverId : message.senderId;
      const isForOpenConversation = activeUserId !== null && otherPartyId === activeUserId;

      if (isForOpenConversation) {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      }

      setUsers((prev) => {
        const exists = prev.some((u) => u.id === otherPartyId);
        if (!exists) {
          // Message from/about someone not yet in the list (e.g. their
          // first message to us) — refresh the contact list from the server.
          loadUsers();
          return prev;
        }
        return prev
          .map((u) =>
            u.id === otherPartyId
              ? {
                  ...u,
                  lastMessageAt: message.createdAt,
                  unreadCount:
                    isForOpenConversation || message.senderId === user.id
                      ? u.unreadCount
                      : u.unreadCount + 1
                }
              : u
          )
          .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      });
    }

    function handleTyping({ userId, isTyping }) {
      if (userId === activeUserId) setTypingActive(isTyping);
    }

    socket.on('receive_message', handleReceive);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('typing', handleTyping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, activeUserId, user.id]);

  function selectContact(id) {
    setActiveUserId(id);
    setTypingActive(false);
    setMobileShowConversation(true);
  }

  return (
    <div className="chat-page">
      <Sidebar
        users={users}
        loading={usersLoading}
        search={search}
        onSearchChange={setSearch}
        activeUserId={activeUserId}
        onSelect={selectContact}
        className={mobileShowConversation ? 'sidebar--hidden-mobile' : ''}
      />
      <ConversationView
        contact={activeContact}
        messages={messages}
        loading={messagesLoading}
        isTyping={typingActive}
        isOnline={activeContact ? onlineUserIds.has(activeContact.id) : false}
        onBack={() => setMobileShowConversation(false)}
        className={mobileShowConversation ? '' : 'conversation--hidden-mobile'}
      />
    </div>
  );
}
