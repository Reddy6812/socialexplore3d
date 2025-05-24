import React, { FC, useState } from 'react';
import styled from 'styled-components';

interface Props {
  onAdd: (label: string) => void;
}

const Form = styled.form`
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border-radius: 4px;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Input = styled.input`
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 4px 8px;
  background: #00aaff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const AddPersonForm: FC<Props> = ({ onAdd }) => {
  const [label, setLabel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onAdd(label.trim());
    setLabel('');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Name"
        value={label}
        onChange={e => setLabel(e.target.value)}
      />
      <Button type="submit">Add Person</Button>
    </Form>
  );
};

export default AddPersonForm; 