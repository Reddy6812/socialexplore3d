import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface PresenceEvent {
  userId: string;
  nodeId: string | null;
}

export function useCollaboration(currentUserId: string) {
  const [presenceMap, setPresenceMap] = useState<Record<string, string | null>>({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Use env var for server URL (Vite): VITE_COLLAB_SERVER_URL
    const serverUrl = (import.meta as any).env.VITE_COLLAB_SERVER_URL || 'http://localhost:4000';
    const socket = io(serverUrl, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('join', currentUserId);

    socket.on('presence', (ev: PresenceEvent) => {
      setPresenceMap(prev => ({ ...prev, [ev.userId]: ev.nodeId }));
    });

    return () => {
      socket.emit('disconnect');
      socket.disconnect();
    };
  }, [currentUserId]);

  const setPresence = (nodeId: string | null) => {
    socketRef.current?.emit('presence', { userId: currentUserId, nodeId });
    setPresenceMap(prev => ({ ...prev, [currentUserId]: nodeId }));
  };

  return { presenceMap, setPresence };
} 