import React, { FC } from 'react';
import styled from 'styled-components';
import { useGraphData, NodeData } from '../hooks/useGraphData';

const Container = styled.div`
  padding: 16px;
`;

interface FriendsPageProps {
  user: any;
}

const FriendsPage: FC<FriendsPageProps> = ({ user }) => {
  const graph = useGraphData(user.id);
  const friends = graph.nodes.filter((n): n is NodeData => n.id !== user.id);

  return (
    <Container>
      <h2>My Friends</h2>
      {friends.length === 0 ? (
        <p>You have no friends yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {friends.map(f => (
            <li key={f.id} style={{ margin: '8px 0' }}>
              {f.label} (ID: {f.id})
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
};

export default FriendsPage; 