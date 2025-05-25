import React, { FC, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 16px;
  color: white;
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
  users: { id: string; label: string }[];
}

const SearchPage: FC<SearchPageProps> = ({ users }) => {
  const [term, setTerm] = useState('');
  const filtered = users.filter(u => u.label.toLowerCase().includes(term.toLowerCase()));

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
          <ListItem key={u.id}>
            {u.label} (ID: {u.id})
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default SearchPage; 