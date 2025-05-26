import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { useGraphData, NodeData } from '../hooks/useGraphData';
import { useChatData } from '../hooks/useChatData';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ChatIcon from '@mui/icons-material/Chat';

const Container = styled.div`
  padding: 16px;
`;

interface FriendsPageProps {
  user: any;
}

const FriendsPage: FC<FriendsPageProps> = ({ user }) => {
  const graph = useGraphData(user.id);
  const { startChat } = useChatData(user.id);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  // Compute filtered friends list
  const friends = graph.nodes.filter((n): n is NodeData => n.id !== user.id);
  const filteredFriends = friends.filter(f =>
    f.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <h2>My Friends</h2>
      <input
        type="text"
        placeholder="Search friends..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '16px',
          boxSizing: 'border-box'
        }}
      />
      {filteredFriends.length === 0 ? (
        <p>No friends{searchTerm ? ` matching "${searchTerm}"` : ''}.</p>
      ) : (
        <ol style={{ paddingLeft: '20px' }}>
          {filteredFriends.map(f => (
            <li key={f.id} style={{ margin: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link to={`/profile/${f.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {f.label} (ID: {f.id})
              </Link>
              <IconButton
                onClick={() => {
                  const chatId = startChat(f.id);
                  navigate(`/chats/${chatId}`);
                }}
                title="Message"
                size="small"
                sx={{ marginLeft: '8px' }}
              >
                <ChatIcon fontSize="small" />
              </IconButton>
            </li>
          ))}
        </ol>
      )}
    </Container>
  );
};

export default FriendsPage; 