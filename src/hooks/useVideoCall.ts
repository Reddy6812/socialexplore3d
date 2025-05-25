import { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { useCollaboration } from './useCollaboration';

export function useVideoCall(currentUserId: string, chatId: string) {
  const { socket } = useCollaboration(currentUserId);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    if (!socket) return;
    const handleSignal = (data: { chatId: string; signal: any }) => {
      if (data.chatId === chatId) {
        peerRef.current?.signal(data.signal);
      }
    };
    socket.on('video-signal', handleSignal);
    return () => {
      socket.off('video-signal', handleSignal);
    };
  }, [socket, chatId]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      const peer = new Peer({ initiator: true, trickle: false, stream });
      peerRef.current = peer;
      peer.on('signal', signal => {
        socket?.emit('video-signal', { chatId, signal });
      });
      peer.on('stream', remote => {
        setRemoteStream(remote);
      });
    } catch (error) {
      console.error('Failed to get local stream', error);
    }
  };

  const endCall = () => {
    peerRef.current?.destroy();
    peerRef.current = null;
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    socket?.emit('end-call', { chatId });
  };

  return { startCall, endCall, localStream, remoteStream };
} 