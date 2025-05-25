import React, { FC, useState, useRef } from 'react';
import styled from 'styled-components';
import { NodeData, EdgeData, FriendRequest } from '../hooks/useGraphData';
import { Post } from '../hooks/usePostData';
import PostForm from './PostForm';
import { useVoiceNoteData } from '../hooks/useVoiceNoteData';
import { useChatData } from '../hooks/useChatData';
import { useNavigate } from 'react-router-dom';

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
  profileVisibility: 'public' | 'friends' | 'private';
  posts: Post[];
  onAddPost: (
    authorId: string,
    imageUrl: string,
    visibility: Post['visibility'],
    caption: string,
    tags: string[]
  ) => void;
  onDeletePost: (postId: string) => void;
  onToggleLike: (postId: string, userId: string) => void;
  onAddComment: (postId: string, authorId: string, text: string) => void;
}

const NodeCard: FC<Props> = ({ node, onClose, nodes, edges, addEdge, removeEdge, updateNode, userId, isAdmin, friendRequests, sendRequest, approveRequest, declineRequest, profileVisibility, posts, onAddPost, onDeletePost, onToggleLike, onAddComment }) => {
  const { voiceNotes, addVoiceNote, deleteVoiceNote } = useVoiceNoteData();
  const { startChat } = useChatData(userId);
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const otherNodes = nodes.filter(n => n.id !== node.id);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [mutualList, setMutualList] = useState<NodeData[]>([]);
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(node.label);
  const [editPhone, setEditPhone] = useState(node.phone || '');
  const [editAddress, setEditAddress] = useState(node.address || '');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showVoicePanel, setShowVoicePanel] = useState(false);

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

  // Filter notes addressed to this node
  const notesForProfile = voiceNotes.filter(v => v.to === node.id);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      setAudioChunks([]);
      mr.ondataavailable = e => { setAudioChunks(prev => [...prev, e.data]); };
      mr.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        addVoiceNote(userId, node.id, url);
      };
      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied', err);
    }
  };
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <Card>
      <Close onClick={onClose}>×</Close>
      <h3>{node.label}</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        {node.id !== userId && (
          <button
            onClick={() => {
              const chatId = startChat(node.id);
              onClose();
              navigate(`/chats/${chatId}`);
            }}
            title="Message"
          >
            💬
          </button>
        )}
        <button onClick={() => setShowVoicePanel(prev => !prev)} title="Voice Notes">🎙️</button>
        {/* Button to view full profile */}
        <button
          onClick={() => {
            onClose();
            navigate(`/profile/${node.id}`);
          }}
          title="View Profile"
        >
          View Profile
        </button>
      </div>
      <p>ID: {node.id}</p>
      {/* Profile visibility enforcement */}
      {(() => {
        const isFriend = edges.some(
          e => (e.from === node.id && e.to === userId) || (e.from === userId && e.to === node.id)
        );
        const canViewProfile =
          profileVisibility === 'public' ||
          (profileVisibility === 'friends' && isFriend) ||
          (profileVisibility === 'private' && (node.id === userId || isAdmin));
        if (canViewProfile) {
          return (
            <>
              <p>Phone: {node.phone}</p>
              <p>Address: {node.address}</p>
            </>
          );
        }
        return <p>Profile information not visible</p>;
      })()}
      {node.id !== userId && (
        <div>
          <h4>Friendship</h4>
          {edges.some(e => (e.from === node.id && e.to === userId) || (e.from === userId && e.to === node.id)) ? (
            <p>Friends</p>
          ) : friendRequests.some(r => r.from === userId && r.to === node.id) ? (
            <p>Request Sent</p>
          ) : (() => {
            // incoming friend request from this node
            const incoming = friendRequests.find(r => r.from === node.id && r.to === userId);
            if (incoming) {
              return (
                <>
                  <button onClick={() => approveRequest(incoming.id)}>Approve</button>{' '}
                  <button onClick={() => declineRequest(incoming.id)}>Decline</button>
                </>
              );
            }
            // no relation: send a request
            return <button onClick={() => sendRequest(userId, node.id)}>Send Friend Request</button>;
          })()}
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
                      // Geocode address to lat/lng
                      if (editAddress) {
                        fetch(
                          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(editAddress)}`
                        )
                          .then(res => res.json())
                          .then((results: any[]) => {
                            if (results.length > 0) {
                              const { lat, lon } = results[0];
                              updateNode(node.id, { geo: [parseFloat(lat), parseFloat(lon)] });
                            }
                          })
                          .catch(err => console.error('Geocode failed', err));
                      }
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
          <ul style={{ maxHeight: '150px', overflowY: 'auto', padding: 0, margin: 0, listStyle: 'none' }}>
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
              <li key={p.id} style={{ marginBottom: '12px' }}>
                <img src={p.imageUrl} alt="Post" style={{ maxWidth: '100%' }} />
                <p>Visibility: {p.visibility}</p>
                {(userId === node.id || isAdmin) && (
                  <button onClick={() => onDeletePost(p.id)} style={{ marginTop: '4px', fontSize: '12px' }}>
                    Delete
                  </button>
                )}
                <p style={{ margin: '4px 0' }}>{p.likes.length} Likes</p>
                <button onClick={() => onToggleLike(p.id, userId)} style={{ fontSize: '12px' }}>
                  {p.likes.includes(userId) ? 'Unlike' : 'Like'}
                </button>
                <div style={{ marginTop: '8px' }}>
                  <h5 style={{ margin: '4px 0' }}>Comments</h5>
                  <ul style={{ listStyle: 'none', padding: 0, maxHeight: '100px', overflowY: 'auto' }}>
                    {p.comments.map(c => (
                      <li key={c.id} style={{ fontSize: '12px', marginBottom: '4px' }}>
                        <strong>{nodes.find(n => n.id === c.authorId)?.label || c.authorId}:</strong> {c.text}
                      </li>
                    ))}
                  </ul>
                  <input
                    type="text"
                    value={commentInputs[p.id] || ''}
                    placeholder="Add a comment"
                    onChange={e => setCommentInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', fontSize: '12px' }}
                  />
                  <button
                    onClick={() => {
                      const text = commentInputs[p.id];
                      if (text) {
                        onAddComment(p.id, userId, text);
                        setCommentInputs(prev => ({ ...prev, [p.id]: '' }));
                      }
                    }}
                    style={{ marginTop: '4px', fontSize: '12px' }}
                  >
                    Comment
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {showVoicePanel && (
            <>
              <h4>Voice Notes</h4>
              <button onClick={isRecording ? stopRecording : startRecording} style={{ fontSize: '12px', marginBottom: '8px' }}>
                {isRecording ? 'Stop Recording' : 'Record Voice Note'}
              </button>
              <ul style={{ listStyle: 'none', padding: 0, maxHeight: '150px', overflowY: 'auto' }}>
                {notesForProfile.map(note => (
                  <li key={note.id} style={{ marginBottom: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <audio controls src={note.audioUrl} />
                    <button onClick={() => deleteVoiceNote(note.id)} style={{ fontSize: '12px' }}>Delete</button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {/* Button to view all friends */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => { onClose(); navigate('/friends'); }}
              style={{ fontSize: '14px' }}
            >
              View Friends
            </button>
          </div>
        </>
      )}
    </Card>
  );
};

export default NodeCard; 