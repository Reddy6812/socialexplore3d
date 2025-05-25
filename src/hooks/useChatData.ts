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
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? (JSON.parse(stored) as Chat[]) : [];
    } catch {
      localStorage.removeItem(storageKey);
      return [];
    }
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
    const existing = chats.find(
      c => c.participants.includes(currentUserId) && c.participants.includes(otherId)
    );
    if (existing) return existing.id;
    const id = Date.now().toString();
    const newChat: Chat = { id, participants: [currentUserId, otherId], messages: [] };
    setChats(prev => [...prev, newChat]);
    return id;
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