import React, { FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useGraphData } from '../hooks/useGraphData';
import { usePostData } from '../hooks/usePostData';
import { useChatData } from '../hooks/useChatData';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
`;

const PostItem = styled.div`
  margin-bottom: 24px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  background: white;
`;

interface ProfilePageProps {
  user: any;
  users: any[];
  graph: ReturnType<typeof useGraphData>;
  postData: ReturnType<typeof usePostData>;
}

const ProfilePage: FC<ProfilePageProps> = ({ user, users, graph, postData }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <Container>User not found.</Container>;

  const profileUser = users.find(u => u.id === id);
  if (!profileUser) return <Container>User not found.</Container>;

  // Determine friendship
  const isFriend = graph.edges.some(
    e => (e.from === user.id && e.to === id) || (e.from === id && e.to === user.id)
  );

  // Profile visibility guard
  const canViewProfile =
    profileUser.profileVisibility === 'public' ||
    (profileUser.profileVisibility === 'friends' && isFriend) ||
    (profileUser.profileVisibility === 'private' && (id === user.id || user.isAdmin));

  if (!canViewProfile) {
    return <Container>Profile not visible.</Container>;
  }

  const chatData = useChatData(user.id);
  const { posts, deletePost, toggleLike, addComment } = postData;
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);

  // Filter this user's posts by visibility
  const profilePosts = posts.filter(p => {
    if (p.authorId !== id) return false;
    if (p.visibility === 'public') return true;
    if (p.visibility === 'friends') return isFriend || id === user.id || user.isAdmin;
    if (p.visibility === 'private') return id === user.id || user.isAdmin;
    return false;
  });
  const sortedPosts = [...profilePosts].sort((a, b) => Number(b.id) - Number(a.id));

  return (
    <Container>
      <h2>{profileUser.label}'s Profile</h2>
      <p>ID: {profileUser.id}</p>
      {profileUser.id !== user.id && (
        <button
          onClick={() => {
            const cid = chatData.startChat(profileUser.id);
            navigate(`/chats/${cid}`);
          }}
          style={{ marginBottom: '16px' }}
        >
          Message
        </button>
      )}
      <h3>Posts</h3>
      {sortedPosts.length === 0 ? (
        <p>No posts to show.</p>
      ) : (
        sortedPosts.map(p => (
          <PostItem key={p.id}>
            <img src={p.imageUrl} alt="Post" style={{ maxWidth: '100%' }} />
            {(user.id === p.authorId || user.isAdmin) && (
              <button onClick={() => deletePost(p.id)} style={{ marginTop: '8px' }}>
                Delete
              </button>
            )}
            <p style={{ margin: '8px 0' }}>{p.likes.length} Likes</p>
            <button onClick={() => toggleLike(p.id, user.id)} style={{ fontSize: '12px' }}>
              {p.likes.includes(user.id) ? 'Unlike' : 'Like'}
            </button>
            <button
              onClick={() => setOpenCommentsPostId(p.id)}
              style={{ fontSize: '12px', marginLeft: '8px' }}
            >
              Comments
            </button>
            {openCommentsPostId === p.id && (
              <div style={{ position: 'relative', border: '1px solid #aaa', borderRadius: '8px', padding: '8px', marginTop: '8px', background: '#f9f9f9' }}>
                <button
                  onClick={() => setOpenCommentsPostId(null)}
                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer' }}
                >
                  ×
                </button>
                <ul style={{ listStyle: 'none', padding: 0, maxHeight: '150px', overflowY: 'auto' }}>
                  {p.comments.map(c => (
                    <li key={c.id} style={{ fontSize: '12px', marginBottom: '4px' }}>
                      <strong>{users.find(u => u.id === c.authorId)?.label || c.authorId}:</strong> {c.text}
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
                      addComment(p.id, user.id, text);
                      setCommentInputs(prev => ({ ...prev, [p.id]: '' }));
                    }
                  }}
                  style={{ marginTop: '4px', fontSize: '12px' }}
                >
                  Comment
                </button>
              </div>
            )}
          </PostItem>
        ))
      )}
    </Container>
  );
};

export default ProfilePage; 