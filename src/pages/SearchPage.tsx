import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { EdgeData } from '../hooks/useGraphData';
import { useChatData } from '../hooks/useChatData';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ChatIcon from '@mui/icons-material/Chat';

const Container = styled.div`
  padding: 16px;
  color: #fff;
  background: #111;
  min-height: calc(100vh - 64px);
`;

const Input = styled.input`
  padding: 8px;
  width: 300px;
  margin-bottom: 12px;
  border-radius: 4px;
  border: 1px solid #444;
  background: #222;
  color: #fff;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  margin: 8px 0;
`;

interface SearchPageProps {
  users: { id: string; label: string; profileVisibility: 'public' | 'friends' | 'private'; isAdmin: boolean }[];
  graphEdges: EdgeData[];
  currentUserId: string;
}

const SearchPage: FC<SearchPageProps> = ({ users, graphEdges, currentUserId }) => {
  const [term, setTerm] = useState('');
  const { startChat } = useChatData(currentUserId);
  const navigate = useNavigate();
  const filtered = users.filter(u => {
    if (!u.label.toLowerCase().includes(term.toLowerCase())) return false;
    const vis = u.profileVisibility;
    // Public profiles always visible
    if (vis === 'public') return true;
    // Private: only self or admin
    if (vis === 'private') return u.id === currentUserId || u.isAdmin;
    // Friends: direct edge or self or admin
    if (vis === 'friends') {
      if (u.id === currentUserId || u.isAdmin) return true;
      return graphEdges.some(e =>
        (e.from === currentUserId && e.to === u.id) ||
        (e.from === u.id && e.to === currentUserId)
      );
    }
    return false;
  });

  return (
    <Container>
      <h2>Find Friends</h2>
      <Input
        placeholder="Type a name to search..."
        value={term}
        onChange={e => setTerm(e.target.value)}
      />
      <List>
        {filtered.map(u => (
          <ListItem
            key={u.id}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span>{u.label} (ID: {u.id})</span>
            <IconButton
              onClick={() => {
                const chatId = startChat(u.id);
                navigate(`/chats/${chatId}`);
              }}
              title="Message"
              size="small"
              sx={{ marginLeft: '8px' }}
            >
              <ChatIcon fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default SearchPage; 