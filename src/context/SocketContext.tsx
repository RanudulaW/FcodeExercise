"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { useNotification } from './NotificationContext';

interface SocketContextType {
  socket: Socket | null;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  unreadCount: 0,
  setUnreadCount: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user) return;
    
    const userId = (session.user as any).id;
    const socketIo = io('http://localhost:3001');

    socketIo.on('connect', () => {
      socketIo.emit('register', userId);
    });

    socketIo.on('new_notification', (data) => {
      setUnreadCount(prev => prev + 1);
      
      let message = "New notification";
      if (data.type === 'like') message = `${data.senderName} liked your post.`;
      if (data.type === 'comment') message = `${data.senderName} commented on your post.`;
      if (data.type === 'connection_request') message = `${data.senderName} wants to connect.`;
      if (data.type === 'connection_accepted') message = `${data.senderName} accepted your request.`;
      
      showNotification(message, "info");
    });

    // NOTE: In a full app, you might want a global message listener here 
    // to increment an unread messages badge on the MessageIcon.

    setSocket(socketIo);

    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const unread = data.data.filter((n: any) => !n.isRead).length;
          setUnreadCount(unread);
        }
      });

    return () => {
      socketIo.disconnect();
    };
  }, [session]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};
