import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState(() => new Set());

  useEffect(() => {
    if (!token || !user) {
      setSocket(null);
      return;
    }

    // Same-origin in production; Vite proxies '/socket.io' to the
    // backend in dev, so no explicit URL is needed either way.
    const nextSocket = io({
      auth: { token },
      transports: ['websocket', 'polling']
    });

    function handlePresence({ userId, online }) {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (online) next.add(userId);
        else next.delete(userId);
        return next;
      });
    }

    nextSocket.on('presence', handlePresence);
    setSocket(nextSocket);

    return () => {
      nextSocket.off('presence', handlePresence);
      nextSocket.disconnect();
    };
  }, [token, user]);

  const value = { socket, onlineUserIds };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
