import React, { FC } from 'react';
import styled from 'styled-components';
import { NodeData } from '../hooks/useGraphData';

const Card = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  width: 200px;
`;

const Close = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
`;

interface Props {
  node: NodeData;
  onClose: () => void;
}

const NodeCard: FC<Props> = ({ node, onClose }) => (
  <Card>
    <Close onClick={onClose}>×</Close>
    <h3>{node.label}</h3>
    <p>ID: {node.id}</p>
    {/* TODO: add chat, stickers, stats here */}
  </Card>
);

export default NodeCard; 