import React, { FC, useState } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const Preview = styled.img`
  max-width: 100%;
  border-radius: 4px;
`;

interface PostFormProps {
  authorId: string;
  onAddPost: (authorId: string, imageUrl: string, visibility: 'public' | 'friends' | 'private') => void;
}

const PostForm: FC<PostFormProps> = ({ authorId, onAddPost }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) return;
    onAddPost(authorId, preview, visibility);
    setFile(null);
    setPreview(null);
    setVisibility('public');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && <Preview src={preview} alt="Preview" />}
      <select value={visibility} onChange={e => setVisibility(e.target.value as any)}>
        <option value="public">Public</option>
        <option value="friends">Friends</option>
        <option value="private">Private</option>
      </select>
      <button type="submit">Post Image</button>
    </Form>
  );
};

export default PostForm; 