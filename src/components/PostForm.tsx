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
  onAddPost: (
    authorId: string,
    imageUrl: string,
    visibility: 'public' | 'friends' | 'private',
    caption: string,
    tags: string[]
  ) => void;
}

const PostForm: FC<PostFormProps> = ({ authorId, onAddPost }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [caption, setCaption] = useState('');

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
    // extract tags: words starting with @
    const tagNames = Array.from(new Set(Array.from(caption.match(/@\w+/g) || []).map(t => t.slice(1))));
    // assume global user labels map to ids
    const tagsIds = tagNames.map(name => name.toLowerCase()).map(name => {
      // find user by label case-insensitive
      // placeholder: mapping happens in parent
      return name;
    });
    onAddPost(authorId, preview, visibility, caption, tagsIds);
    setFile(null);
    setPreview(null);
    setVisibility('public');
    setCaption('');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <textarea
        value={caption}
        onChange={e => setCaption(e.target.value)}
        placeholder="Write a caption (use @name to tag)"
        style={{ width: '100%', boxSizing: 'border-box', fontSize: '14px', minHeight: '40px' }}
      />
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