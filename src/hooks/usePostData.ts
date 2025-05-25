import { useState, useEffect } from 'react';

export interface Comment {
  id: string;
  authorId: string;
  text: string;
}

export interface Post {
  id: string;
  authorId: string;
  imageUrl: string;
  visibility: 'public' | 'friends' | 'private';
  caption: string;
  tags: string[];
  likes: string[];
  comments: Comment[];
  reactions: Record<string, string[]>;
}

export function usePostData() {
  const [posts, setPosts] = useState<Post[]>(() => {
    const stored = localStorage.getItem('socialexplore3d_posts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any) => ({
            id: p.id,
            authorId: p.authorId,
            imageUrl: p.imageUrl,
            visibility: p.visibility,
            caption: p.caption || '',
            tags: p.tags || [],
            likes: p.likes || [],
            comments: p.comments || [],
            reactions: p.reactions || {}
          }));
        }
      } catch (e) {
        console.error('Failed to parse stored posts', e);
      }
      localStorage.removeItem('socialexplore3d_posts');
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('socialexplore3d_posts', JSON.stringify(posts));
    } catch (e) {
      console.error('Failed to persist posts to localStorage', e);
    }
  }, [posts]);

  /** Add a new post with image URL and visibility */
  const addPost = (
    authorId: string,
    imageUrl: string,
    visibility: Post['visibility'],
    caption: string = '',
    tags: string[] = []
  ) => {
    const id = Date.now().toString();
    setPosts(prev => [...prev, { id, authorId, imageUrl, visibility, caption, tags, likes: [], comments: [], reactions: {} }]);
  };

  /** Delete a post by ID */
  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  /** Toggle like by a user on a post */
  const toggleLike = (postId: string, userId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const hasLiked = p.likes.includes(userId);
      return {
        ...p,
        likes: hasLiked ? p.likes.filter(id => id !== userId) : [...p.likes, userId]
      };
    }));
  };

  /** Add a comment to a post */
  const addComment = (postId: string, authorId: string, text: string) => {
    const id = Date.now().toString();
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: [...p.comments, { id, authorId, text }]
      };
    }));
  };

  /** Toggle reaction emoji for a post */
  const toggleReaction = (postId: string, emoji: string, userId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const users = p.reactions[emoji] || [];
      const has = users.includes(userId);
      const updated = has ? users.filter(u => u !== userId) : [...users, userId];
      return { ...p, reactions: { ...p.reactions, [emoji]: updated } };
    }));
  };

  return { posts, addPost, deletePost, toggleLike, addComment, toggleReaction };
} 