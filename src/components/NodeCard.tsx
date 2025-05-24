import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { NodeData, EdgeData, FriendRequest } from '../hooks/useGraphData';
import { Post } from '../hooks/usePostData';
import PostForm from './PostForm';

const Card = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  width: 200px;
`;

const Close = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
`;

interface Props {
  node: NodeData;
  onClose: () => void;
  nodes: NodeData[];
  edges: EdgeData[];
  addEdge: (from: string, to: string) => void;
  removeEdge: (from: string, to: string) => void;
  updateNode: (id: string, data: Partial<Omit<NodeData, 'id' | 'position'>>) => void;
  userId: string;
  isAdmin: boolean;
  friendRequests: FriendRequest[];
  sendRequest: (from: string, to: string) => void;
  approveRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
  posts: Post[];
  onAddPost: (authorId: string, imageUrl: string, visibility: Post['visibility']) => void;
}

const NodeCard: FC<Props> = ({ node, onClose, nodes, edges, addEdge, removeEdge, updateNode, userId, isAdmin, friendRequests, sendRequest, approveRequest, declineRequest, posts, onAddPost }) => {
  const otherNodes = nodes.filter(n => n.id !== node.id);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [mutualList, setMutualList] = useState<NodeData[]>([]);
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(node.label);
  const [editPhone, setEditPhone] = useState(node.phone || '');
  const [editAddress, setEditAddress] = useState(node.address || '');

  const findMutual = () => {
    const otherId = selectedFriend;
    const neighbors1 = edges
      .filter(e => e.from === node.id || e.to === node.id)
      .map(e => (e.from === node.id ? e.to : e.from));
    const neighbors2 = edges
      .filter(e => e.from === otherId || e.to === otherId)
      .map(e => (e.from === otherId ? e.to : e.from));
    const mutualIds = neighbors1.filter(id => neighbors2.includes(id));
    setMutualList(nodes.filter(n => mutualIds.includes(n.id)));
  };

  return (
    <Card>
      <Close onClick={onClose}>×</Close>
      <h3>{node.label}</h3>
      <p>ID: {node.id}</p>
      <p>Phone: {node.phone}</p>
      <p>Address: {node.address}</p>
      {node.id !== userId && (
        <div>
          <h4>Friendship</h4>
          {edges.some(e => (e.from === node.id && e.to === userId) || (e.from === userId && e.to === node.id)) ? (
            <p>Friends</p>
          ) : friendRequests.some(r => r.from === userId && r.to === node.id) ? (
            <p>Request Sent</p>
          ) : (
            <button onClick={() => sendRequest(userId, node.id)}>Send Friend Request</button>
          )}
        </div>
      )}
      {node.id === userId && (
        <div>
          <h4>Incoming Friend Requests</h4>
          <ul>
            {friendRequests.filter(r => r.to === node.id).map(r => {
              const fromNode = nodes.find(n => n.id === r.from);
              return (
                <li key={r.id}>
                  {fromNode?.label} ({r.from}){' '}
                  <button onClick={() => approveRequest(r.id)}>Approve</button>{' '}
                  <button onClick={() => declineRequest(r.id)}>Decline</button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {(node.id === userId || isAdmin) && (
        <>
          {node.id === userId && (
            <div>
              {editing ? (
                <div>
                  <h4>Edit Profile</h4>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                  />
                  <input
                    type="text"
                    value={editPhone}
                    placeholder="Phone"
                    onChange={e => setEditPhone(e.target.value)}
                  />
                  <input
                    type="text"
                    value={editAddress}
                    placeholder="Address"
                    onChange={e => setEditAddress(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      updateNode(node.id, { label: editLabel, phone: editPhone, address: editAddress });
                      setEditing(false);
                    }}
                  >
                    Save
                  </button>
                  <button onClick={() => setEditing(false)}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setEditing(true)}>Edit Profile</button>
              )}
            </div>
          )}
          {node.id === userId && (
            <div>
              <h4>New Post</h4>
              <PostForm authorId={node.id} onAddPost={onAddPost} />
            </div>
          )}
          <h4>Posts</h4>
          <ul>
            {posts.filter(p => {
              if (p.authorId !== node.id) return false;
              // owner or admin always sees
              if (userId === node.id || isAdmin) return true;
              // public posts visible to all
              if (p.visibility === 'public') return true;
              // friends-only: check connection
              if (p.visibility === 'friends') {
                return edges.some(
                  e => (e.from === node.id && e.to === userId) || (e.from === userId && e.to === node.id)
                );
              }
              // private posts only owner/admin
              return false;
            }).map(p => (
              <li key={p.id}>
                <img src={p.imageUrl} alt="Post" style={{ maxWidth: '100%' }} />
                <p>Visibility: {p.visibility}</p>
              </li>
            ))}
          </ul>
          <h4>Connections</h4>
          <ul>
            {otherNodes.map(other => {
              const isConnected = edges.some(
                e => (e.from === node.id && e.to === other.id) || (e.from === other.id && e.to === node.id)
              );
              return (
                <li key={other.id}>
                  {other.label}{' '}
                  {isConnected ? (
                    <button onClick={() => removeEdge(node.id, other.id)}>Remove Friend</button>
                  ) : (
                    <button onClick={() => addEdge(node.id, other.id)}>Add Friend</button>
                  )}
                </li>
              );
            })}
          </ul>
          <h4>Find Mutual Friends</h4>
          <div>
            {(() => {
              const friendIds = edges
                .filter(e => e.from === node.id || e.to === node.id)
                .map(e => (e.from === node.id ? e.to : e.from));
              const friends = nodes.filter(n => friendIds.includes(n.id));
              if (friends.length === 0) {
                return <p>No friends to select</p>;
              }
              return (
                <>
                  <select value={selectedFriend} onChange={e => setSelectedFriend(e.target.value)}>
                    <option value="" disabled>Select friend</option>
                    {friends.map(f => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                  <button onClick={findMutual} disabled={!selectedFriend}>Show Mutual</button>
                </>
              );
            })()}
          </div>
          {mutualList.length > 0 && (
            <ul>
              {mutualList.map(m => (
                <li key={m.id}>{m.label} ({m.id})</li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
};

export default NodeCard; 