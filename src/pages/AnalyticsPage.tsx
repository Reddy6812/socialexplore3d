import React, { FC } from 'react';
import styled from 'styled-components';
import { initialNodesGlobal, initialEdgesGlobal } from '../hooks/useGraphData';

interface AnalyticsPageProps {
  user: any;
}

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
`;

const AnalyticsPage: FC<AnalyticsPageProps> = ({ user }) => {
  // Build degree map
  const degreeMap: Record<string, number> = {};
  initialNodesGlobal.forEach(n => { degreeMap[n.id] = 0; });
  initialEdgesGlobal.forEach(e => {
    degreeMap[e.from]++;
    degreeMap[e.to]++;
  });

  // Top 5 most connected nodes
  const top5 = [...initialNodesGlobal]
    .sort((a, b) => degreeMap[b.id] - degreeMap[a.id])
    .slice(0, 5);

  // Clustering coefficient for current user
  const neighbors = initialEdgesGlobal
    .filter(e => e.from === user.id || e.to === user.id)
    .map(e => (e.from === user.id ? e.to : e.from));
  const k = neighbors.length;
  let E = 0;
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const a = neighbors[i], b = neighbors[j];
      if (initialEdgesGlobal.some(e =>
        (e.from === a && e.to === b) || (e.from === b && e.to === a)
      )) {
        E++;
      }
    }
  }
  const clustering = k > 1 ? (2 * E) / (k * (k - 1)) : 0;

  // Closeness centrality for current user
  const adjacency: Record<string, string[]> = {};
  initialNodesGlobal.forEach(n => { adjacency[n.id] = []; });
  initialEdgesGlobal.forEach(e => {
    adjacency[e.from].push(e.to);
    adjacency[e.to].push(e.from);
  });
  // BFS distances
  const dist: Record<string, number> = {};
  initialNodesGlobal.forEach(n => { dist[n.id] = Infinity; });
  dist[user.id] = 0;
  const queue = [user.id];
  while (queue.length) {
    const u = queue.shift()!;
    adjacency[u].forEach(v => {
      if (dist[v] === Infinity) {
        dist[v] = dist[u] + 1;
        queue.push(v);
      }
    });
  }
  const sumDist = Object.entries(dist)
    .filter(([id]) => id !== user.id)
    .reduce((sum, [_, d]) => sum + (d === Infinity ? 0 : d), 0);
  const closeness = sumDist > 0 ? (initialNodesGlobal.length - 1) / sumDist : 0;

  return (
    <Container>
      <h2>Network Analytics</h2>
      <div>
        <h3>Top 5 Most Connected</h3>
        <ol>
          {top5.map(n => (
            <li key={n.id}>{n.label} ({degreeMap[n.id]} connections)</li>
          ))}
        </ol>
      </div>
      <div>
        <h3>Clustering Coefficient</h3>
        <p>{clustering.toFixed(2)}</p>
      </div>
      <div>
        <h3>Closeness Centrality</h3>
        <p>{closeness.toFixed(2)}</p>
      </div>
    </Container>
  );
};

export default AnalyticsPage; 