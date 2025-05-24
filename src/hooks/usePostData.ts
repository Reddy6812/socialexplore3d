import { useState, useEffect } from 'react';

export interface Post {
  id: string;
  authorId: string;
  imageUrl: string;
  visibility: 'public' | 'friends' | 'private';
}

export function usePostData() {
  const [posts, setPosts] = useState<Post[]>(() => {
    const stored = localStorage.getItem('socialexplore3d_posts');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('socialexplore3d_posts', JSON.stringify(posts));
  }, [posts]);

  /** Add a new post with image URL and visibility */
  const addPost = (authorId: string, imageUrl: string, visibility: Post['visibility']) => {
    const id = Date.now().toString();
    setPosts(prev => [...prev, { id, authorId, imageUrl, visibility }]);
  };

  /** Delete a post by ID */
  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return { posts, addPost, deletePost };
} 