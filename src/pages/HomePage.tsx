import React, { FC } from 'react';
import styled from 'styled-components';
import { useGraphData } from '../hooks/useGraphData';
import { Post, usePostData } from '../hooks/usePostData';

const FeedContainer = styled.div`
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

interface HomePageProps {
  user: any;
  users: any[];
  postData: ReturnType<typeof usePostData>;
  graph: ReturnType<typeof useGraphData>;
}

const HomePage: FC<HomePageProps> = ({ user, users, postData, graph }) => {
  const { posts, deletePost, toggleLike, addComment } = postData;
  // Track new comment text per post
  const [commentInputs, setCommentInputs] = React.useState<Record<string, string>>({});
  // Track which post's comments are open
  const [openCommentsPostId, setOpenCommentsPostId] = React.useState<string | null>(null);
  // Include public posts, friend-only posts if viewer is a friend, and private posts for owner/admin
  const feedPosts = posts.filter(p => {
    if (p.visibility === 'public') return true;
    if (p.visibility === 'friends') {
      return graph.edges.some(
        e =>
          (e.from === p.authorId && e.to === user.id) ||
          (e.from === user.id && e.to === p.authorId)
      );
    }
    if (p.visibility === 'private') {
      return p.authorId === user.id || user.isAdmin;
    }
    return false;
  });
  const sortedPosts = [...feedPosts].sort((a, b) => Number(b.id) - Number(a.id));

  return (
    <FeedContainer>
      <h2>Home Feed</h2>
      {sortedPosts.map(p => {
        const author = users.find(u => u.id === p.authorId);
        return (
          <PostItem key={p.id}>
            <p><strong>{author?.label ?? p.authorId}</strong></p>
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
            <button onClick={() => setOpenCommentsPostId(p.id)} style={{ fontSize: '12px', marginLeft: '8px' }}>
              Comments
            </button>
            {/* Comments popup card */}
            {openCommentsPostId === p.id && (
              <div style={{ position: 'relative', border: '1px solid #aaa', borderRadius: '8px', padding: '8px', marginTop: '8px', background: '#f9f9f9' }}>
                <button
                  onClick={() => setOpenCommentsPostId(null)}
                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer' }}
                >
                  ×
                </button>
                <h5 style={{ margin: '4px 0' }}>Comments</h5>
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
        );
      })}
    </FeedContainer>
  );
};

export default HomePage; 