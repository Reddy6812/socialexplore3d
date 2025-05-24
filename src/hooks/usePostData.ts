import { useState } from 'react';

export interface Post {
  id: string;
  authorId: string;
  imageUrl: string;
  visibility: 'public' | 'friends' | 'private';
}

export function usePostData() {
  const [posts, setPosts] = useState<Post[]>([]);

  /** Add a new post with image URL and visibility */
  const addPost = (authorId: string, imageUrl: string, visibility: Post['visibility']) => {
    const id = Date.now().toString();
    setPosts(prev => [...prev, { id, authorId, imageUrl, visibility }]);
  };

  return { posts, addPost };
} 