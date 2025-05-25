import React, { FC, useState } from 'react';
import styled from 'styled-components';

interface SnapPageProps {
  user: any;
}

const Container = styled.div`
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const Card = styled.div<{selected: boolean}>`
  background: ${props => props.selected ? '#ddd' : '#f4f4f4'};
  border: ${props => props.selected ? '2px solid #007bff' : '1px solid #ccc'};
  border-radius: 8px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  &:hover { background: #e0e0e0; }
`;

const Footer = styled.div`
  margin-top: 24px;
  text-align: center;
`;

const SnapPage: FC<SnapPageProps> = ({ user }) => {
  // Example template list
  const templates = [
    { id: 't1', label: 'Birthday' },
    { id: 't2', label: 'Holiday' },
    { id: 't3', label: 'Funny' },
    { id: 't4', label: 'Heart' },
    { id: 't5', label: 'Cool' }
  ];
  const [selected, setSelected] = useState<string | null>(null);

  const handleCapture = () => {
    console.log('Capture snap with template', selected);
    // TODO: integrate camera & capture logic
  };

  return (
    <Container>
      <h2>Snap</h2>
      <p>Select a template:</p>
      <Grid>
        {templates.map(t => (
          <Card
            key={t.id}
            selected={selected === t.id}
            onClick={() => setSelected(t.id)}
          >
            {t.label}
          </Card>
        ))}
      </Grid>
      <Footer>
        <button
          onClick={handleCapture}
          disabled={!selected}
          style={{ padding: '8px 16px', fontSize: '16px', cursor: selected ? 'pointer' : 'not-allowed' }}
        >
          Capture Snap
        </button>
      </Footer>
    </Container>
  );
};

export default SnapPage; 