import { useState, useEffect } from 'react';
import { useCollaboration } from './useCollaboration';

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  audioUrl?: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
}

export function useChatData(currentUserId: string) {
  const { socket } = useCollaboration(currentUserId);
  const storageKey = 'socialexplore3d_chats';
  const [chats, setChats] = useState<Chat[]>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed as Chat[];
        }
      } catch {
        // ignore parse errors
      }
      localStorage.removeItem(storageKey);
    }
    return [];
  });

  // Subscribe to real-time incoming messages
  useEffect(() => {
    if (!socket) return;
    const handler = (msg: { chatId: string; id: string; senderId: string; text?: string; audioUrl?: string; timestamp: number }) => {
      setChats(prev => {
        const exists = prev.find(c => c.id === msg.chatId);
        if (exists) {
          return prev.map(c =>
            c.id === msg.chatId
              ? { ...c, messages: [...c.messages, { id: msg.id, senderId: msg.senderId, text: msg.text, audioUrl: msg.audioUrl, timestamp: msg.timestamp }] }
              : c
          );
        }
        // create new chat for incoming message
        return [
          ...prev,
          { id: msg.chatId, participants: [currentUserId, msg.senderId], messages: [{ id: msg.id, senderId: msg.senderId, text: msg.text, audioUrl: msg.audioUrl, timestamp: msg.timestamp }] }
        ];
      });
    };
    socket.on('chatMessage', handler);
    return () => { socket.off('chatMessage', handler); };
  }, [socket]);

  // Join chat-specific rooms so private messages are scoped correctly
  useEffect(() => {
    if (!socket) return;
    chats.forEach(c => {
      socket.emit('joinChat', c.id);
    });
  }, [socket, chats]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(chats));
    } catch (e) {
      console.error('Failed to persist chats', e);
    }
  }, [chats]);

  // Chats involving the current user
  const userChats = chats.filter(c => c.participants.includes(currentUserId));

  /** Start a chat with another user or return existing chat id */
  const startChat = (otherId: string): string => {
    // deterministic chat ID for a peer-to-peer chat (same for both sides)
    const participants = [currentUserId, otherId].sort();
    const chatId = participants.join('-');
    const existing = chats.find(c => c.id === chatId);
    if (existing) return existing.id;
    const newChat: Chat = { id: chatId, participants, messages: [] };
    setChats(prev => [...prev, newChat]);
    // join the new chat room on the socket immediately
    socket?.emit('joinChat', chatId);
    return chatId;
  };

  /** Send a message in a chat */
  const sendMessage = (chatId: string, senderId: string, text?: string, audioUrl?: string) => {
    const timestamp = Date.now();
    const newMessage: Message = { id: timestamp.toString(), senderId, text, audioUrl, timestamp };
    setChats(prev =>
      prev.map(c => (c.id === chatId ? { ...c, messages: [...c.messages, newMessage] } : c))
    );
    // Broadcast to other clients
    socket?.emit('chatMessage', { chatId, ...newMessage });
  };

  return { chats: userChats, startChat, sendMessage };
} 