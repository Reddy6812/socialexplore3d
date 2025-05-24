import React, { FC, useState } from 'react';
import styled from 'styled-components';

interface Props {
  onAdd: (node: { id: string; label: string; phone: string; address: string }) => void;
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
  const [id, setId] = useState('');
  const [label, setLabel] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !label.trim()) return;
    onAdd({ id: id.trim(), label: label.trim(), phone: phone.trim(), address: address.trim() });
    setId('');
    setLabel('');
    setPhone('');
    setAddress('');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="ID"
        value={id}
        onChange={e => setId(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Name"
        value={label}
        onChange={e => setLabel(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Address"
        value={address}
        onChange={e => setAddress(e.target.value)}
      />
      <Button type="submit">Add Person</Button>
    </Form>
  );
};

export default AddPersonForm; 