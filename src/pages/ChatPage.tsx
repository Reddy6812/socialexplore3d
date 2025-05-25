import React, { FC, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useChatData, Chat } from '../hooks/useChatData';
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';

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
  const { chats, sendMessage } = useChatData(user.id);
  const chat = chats.find((c: Chat) => c.id === chatId);

  if (!chat) {
    return <Container>Chat not found.</Container>;
  }

  const otherId = chat.participants.find((id: string) => id !== user.id)!;
  const other = users.find(u => u.id === otherId);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  return (
    <Container>
      <h2>Chat with {other?.label || otherId}</h2>
      <MessagesContainer>
        {chat.messages.map(msg => {
          const sender = users.find(u => u.id === msg.senderId);
          return (
            <div key={msg.id} style={{ textAlign: msg.senderId === user.id ? 'right' : 'left', marginBottom: '8px' }}>
              <strong>{sender?.label || msg.senderId}:</strong>{' '}
              {msg.audioUrl ? (
                <audio controls src={msg.audioUrl} />
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
          onClick={() => { console.log('Initiate video call to chat', chat?.id); }}
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