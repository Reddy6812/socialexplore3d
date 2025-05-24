import React, { useState } from 'react';
import styled from 'styled-components';
import GraphCanvas from './components/GraphCanvas';
import NodeCard from './components/NodeCard';
import { NodeData } from './hooks/useGraphData';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;

export default function App() {
  const [selected, setSelected] = useState<NodeData | null>(null);

  return (
    <Container>
      <GraphCanvas onNodeClick={setSelected} />
      {selected && <NodeCard node={selected} onClose={() => setSelected(null)} />}
    </Container>
  );
} 