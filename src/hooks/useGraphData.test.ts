import { useGraphData } from './useGraphData';

describe('useGraphData', () => {
  it('returns default nodes and edges', () => {
    const { nodes, edges } = useGraphData();
    expect(nodes).toHaveLength(3);
    expect(edges).toHaveLength(2);
    expect(nodes[0]).toMatchObject({ id: '1', label: 'Alice' });
  });
}); 