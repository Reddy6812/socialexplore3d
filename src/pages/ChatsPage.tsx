import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useChatData, Chat } from '../hooks/useChatData';

interface ChatsPageProps {
  user: any;
  users: any[];
}

const Container = styled.div`
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
`;

const ChatList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ChatListItem = styled.li`
  margin: 8px 0;
  border-bottom: 1px solid #ccc;
  padding: 8px 0;
`;

const ChatsPage: FC<ChatsPageProps> = ({ user, users }) => {
  const { chats, startChat } = useChatData(user.id);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Container>
      <h2>Chats</h2>
      <div style={{ margin: '16px 0' }}>
        <input
          type="text"
          placeholder="Search contacts or start chat"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
      </div>
      {searchTerm && (
        <div style={{ marginBottom: '16px' }}>
          <h3>Contacts</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {users
              .filter(u => u.id !== user.id && u.label.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(u => {
                const existingChat = chats.find(c => c.participants.includes(u.id));
                return (
                  <li
                    key={u.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0' }}
                  >
                    <span>{u.label}</span>
                    {existingChat ? (
                      <Link to={`/chats/${existingChat.id}`} style={{ fontSize: '12px' }}>
                        Open Chat
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          const cid = startChat(u.id);
                          navigate(`/chats/${cid}`);
                        }}
                        style={{ fontSize: '12px' }}
                      >
                        New Chat
                      </button>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      )}
      <h3>Recent Chats</h3>
      {chats.length === 0 ? (
        <p>No conversations yet.</p>
      ) : (
        <ChatList>
          {chats.map((chat: Chat) => {
            const otherId = chat.participants.find((id: string) => id !== user.id)!;
            const other = users.find(u => u.id === otherId);
            const lastMessage = chat.messages[chat.messages.length - 1];
            return (
              <ChatListItem key={chat.id}>
                <Link to={`/chats/${chat.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <strong>{other?.label || otherId}</strong>:{' '}
                  {lastMessage ? (
                    lastMessage.audioUrl ? (
                      <span>🎙️ Voice Message</span>
                    ) : (
                      <span>{lastMessage.text}</span>
                    )
                  ) : (
                    <span>No messages yet</span>
                  )}
                </Link>
              </ChatListItem>
            );
          })}
        </ChatList>
      )}
    </Container>
  );
};

export default ChatsPage; 