import React, { FC } from 'react';
import styled from 'styled-components';
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
}

const HomePage: FC<HomePageProps> = ({ user, users, postData }) => {
  const { posts, deletePost } = postData;
  const publicPosts = [...posts]
    .filter(p => p.visibility === 'public')
    .sort((a, b) => Number(b.id) - Number(a.id));

  return (
    <FeedContainer>
      <h2>Home Feed</h2>
      {publicPosts.map(p => {
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