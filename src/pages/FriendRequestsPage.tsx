import React, { FC } from 'react';
import styled from 'styled-components';
import { useGraphData, FriendRequest } from '../hooks/useGraphData';

const Container = styled.div`
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
`;

interface FriendRequestsPageProps {
  user: any;
  users: any[];
  graph: ReturnType<typeof useGraphData>;
}

const FriendRequestsPage: FC<FriendRequestsPageProps> = ({ user, users, graph }) => {
  // requests directed to current user
  const requests: FriendRequest[] = graph.friendRequests.filter(r => r.to === user.id);

  return (
    <Container>
      <h2>Friend Requests</h2>
      {requests.length === 0 ? (
        <p>No pending friend requests.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {requests.map(r => {
            const fromUser = users.find(u => u.id === r.from);
            return (
              <li key={r.id} style={{ margin: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{fromUser?.label || r.from}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => graph.approveFriendRequest(r.id)}>Approve</button>
                  <button onClick={() => graph.declineFriendRequest(r.id)}>Decline</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
};

export default FriendRequestsPage; 