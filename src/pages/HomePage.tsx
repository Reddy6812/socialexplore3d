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
  const { posts, deletePost } = postData;
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
          </PostItem>
        );
      })}
    </FeedContainer>
  );
};

export default HomePage; 