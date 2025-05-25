import React, { FC } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 24px;
`;

interface SettingsPageProps {
  user: any;
  users: any[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
}

const SettingsPage: FC<SettingsPageProps> = ({ user, users, setUsers, setCurrentUser }) => {
  const toggleConnections = () => {
    const updated = { ...user, showConnections: !user.showConnections };
    setUsers(prev => prev.map(u => (u.id === user.id ? updated : u)));
    setCurrentUser(updated);
  };
  const changeProfileVisibility = (pv: 'public' | 'friends' | 'private') => {
    const updated = { ...user, profileVisibility: pv };
    setUsers(prev => prev.map(u => (u.id === user.id ? updated : u)));
    setCurrentUser(updated);
  };
  return (
    <Container>
      <h2>Settings</h2>
      <div>
        <label>
          <input type="checkbox" checked={user.showConnections} onChange={toggleConnections} />{' '}
          Allow others to see my connections
        </label>
      </div>
      <div>
        <label>
          Profile Visibility:{' '}
          <select value={user.profileVisibility} onChange={e => changeProfileVisibility(e.target.value as any)}>
            <option value="public">Public</option>
            <option value="friends">Friends</option>
            <option value="private">Private</option>
          </select>
        </label>
      </div>
    </Container>
  );
};

export default SettingsPage; 