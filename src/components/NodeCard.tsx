import React, { FC } from 'react';
import styled from 'styled-components';
import { NodeData, EdgeData } from '../hooks/useGraphData';

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
  nodes: NodeData[];
  edges: EdgeData[];
  addEdge: (from: string, to: string) => void;
  removeEdge: (from: string, to: string) => void;
}

const NodeCard: FC<Props> = ({ node, onClose, nodes, edges, addEdge, removeEdge }) => {
  const otherNodes = nodes.filter(n => n.id !== node.id);
  return (
    <Card>
      <Close onClick={onClose}>×</Close>
      <h3>{node.label}</h3>
      <p>ID: {node.id}</p>
      <h4>Connections</h4>
      <ul>
        {otherNodes.map(other => {
          const isConnected = edges.some(
            e => (e.from === node.id && e.to === other.id) || (e.from === other.id && e.to === node.id)
          );
          return (
            <li key={other.id}>
              {other.label}{' '}
              {isConnected ? (
                <button onClick={() => removeEdge(node.id, other.id)}>Remove Friend</button>
              ) : (
                <button onClick={() => addEdge(node.id, other.id)}>Add Friend</button>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

export default NodeCard; 