import React, { FC, useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useChatData, Chat } from '../hooks/useChatData';
import { useVideoCall } from '../hooks/useVideoCall';
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';
import DeleteIcon from '@mui/icons-material/Delete';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

interface ChatPageProps {
  user: any;
  users: any[];
}

const Container = styled.div`
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
`;

const MessagesContainer = styled.div`
  max-height: 60vh;
  overflow-y: auto;
  margin-bottom: 12px;
`;

const ChatPage: FC<ChatPageProps> = ({ user, users }) => {
  const { chatId } = useParams<{ chatId: string }>();
  const { chats, sendMessage, deleteMessage } = useChatData(user.id);
  const { startCall, endCall, localStream, remoteStream } = useVideoCall(user.id, chatId!);
  const chat = chats.find((c: Chat) => c.id === chatId);

  if (!chat) {
    return <Container>Chat not found.</Container>;
  }

  const otherId = chat.participants.find((id: string) => id !== user.id)!;
  const other = users.find(u => u.id === otherId);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [inCall, setInCall] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <Container>
      <h2>Chat with {other?.label || otherId}</h2>
      {inCall && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 2000 }}>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '60%', height: 'auto', margin: 'auto', display: 'block' }} />
          <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '20%', height: 'auto', position: 'absolute', bottom: '10px', right: '10px', border: '2px solid white' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
            <IconButton onClick={() => {
              if (localStream) {
                localStream.getAudioTracks().forEach(track => track.enabled = muted);
                setMuted(prev => !prev);
              }
            }} color="inherit">
              {muted ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            <button
              onClick={() => { endCall(); setInCall(false); }}
              style={{ background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}
            />
          </div>
        </div>
      )}
      <MessagesContainer>
        {chat.messages.map(msg => {
          const sender = users.find(u => u.id === msg.senderId);
          return (
            <div key={msg.id} style={{ textAlign: msg.senderId === user.id ? 'right' : 'left', marginBottom: '8px' }}>
              <strong>{sender?.label || msg.senderId}:</strong>{' '}
              {msg.audioUrl ? (
                <>
                  <audio controls src={msg.audioUrl} />
                  <IconButton size="small" onClick={() => deleteMessage(chat.id, msg.id)} title="Delete">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <span>{msg.text}</span>
              )}
            </div>
          );
        })}
      </MessagesContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        {/* Voice recorder button */}
        <button
          onClick={async () => {
            if (isRecording) {
              mediaRecorderRef.current?.stop();
              setIsRecording(false);
            } else {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mr = new MediaRecorder(stream);
                mediaRecorderRef.current = mr;
                const chunks: Blob[] = [];
                mr.ondataavailable = e => chunks.push(e.data);
                mr.onstop = () => {
                  const blob = new Blob(chunks, { type: 'audio/webm' });
                  const url = URL.createObjectURL(blob);
                  sendMessage(chat.id, user.id, undefined, url);
                };
                mr.start();
                setIsRecording(true);
              } catch (err) {
                console.error('Audio recording failed', err);
              }
            }
          }}
          style={{ fontSize: '12px' }}
        >
          {isRecording ? 'Stop Rec' : 'Record Voice'}
        </button>
        {/* Video call button */}
        <IconButton
          onClick={() => {
            if (!inCall) { startCall(); setInCall(true); } else { endCall(); setInCall(false); }
          }}
          size="small"
          title="Video Call"
        >
          <VideocamIcon fontSize="small" />
        </IconButton>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (input.trim()) {
                sendMessage(chat.id, user.id, input.trim());
                setInput('');
              }
            }
          }}
        />
        <button
          onClick={() => {
            if (input.trim()) {
              sendMessage(chat.id, user.id, input.trim());
              setInput('');
            }
          }}
          style={{ marginTop: '8px' }}
        >
          Send
        </button>
      </div>
    </Container>
  );
};

export default ChatPage; 