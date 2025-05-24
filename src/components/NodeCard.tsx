import React, { FC, useState } from 'react';
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
  const [otherId, setOtherId] = useState('');
  const [mutualList, setMutualList] = useState<NodeData[]>([]);

  const findMutual = () => {
    const neighbors1 = edges.filter(e => e.from === node.id || e.to === node.id)
      .map(e => (e.from === node.id ? e.to : e.from));
    const neighbors2 = edges.filter(e => e.from === otherId || e.to === otherId)
      .map(e => (e.from === otherId ? e.to : e.from));
    const mutualIds = neighbors1.filter(id => neighbors2.includes(id));
    setMutualList(nodes.filter(n => mutualIds.includes(n.id)));
  };

  return (
    <Card>
      <Close onClick={onClose}>×</Close>
      <h3>{node.label}</h3>
      <p>ID: {node.id}</p>
      <p>Phone: {node.phone}</p>
      <p>Address: {node.address}</p>
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
      <h4>Find Mutual Friends</h4>
      <div>
        <input
          type="text"
          placeholder="Other ID"
          value={otherId}
          onChange={e => setOtherId(e.target.value)}
        />
        <button onClick={findMutual}>Show Mutual</button>
      </div>
      {mutualList.length > 0 && (
        <ul>
          {mutualList.map(m => (
            <li key={m.id}>{m.label} ({m.id})</li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default NodeCard; 