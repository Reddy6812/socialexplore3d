import React, { useState, FC } from 'react';
import GraphCanvas from '../components/GraphCanvas';
import MapView from '../components/MapView';
import { useGraphData, NodeData } from '../hooks/useGraphData';
import { usePostData } from '../hooks/usePostData';
import { useCollaboration } from '../hooks/useCollaboration';
import NodeCard from '../components/NodeCard';

interface ExplorerPageProps {
  user: any;
  users: any[];
  graph: ReturnType<typeof useGraphData>;
  postData: ReturnType<typeof usePostData>;
}

const ExplorerPage: FC<ExplorerPageProps> = ({ user, users, graph, postData }) => {
  const [selected, setSelected] = useState<NodeData | null>(null);
  const { presenceMap, setPresence } = useCollaboration(user.id);
  const [autoRotate, setAutoRotate] = useState(false);
  const [pathMode, setPathMode] = useState(false);
  const [pathEndpoints, setPathEndpoints] = useState<string[]>([]);
  const [highlightNodeIds, setHighlightNodeIds] = useState<string[]>([]);
  const [highlightEdgePairs, setHighlightEdgePairs] = useState<[string,string][]>([]);
  const [degree, setDegree] = useState(1);
  // Toggle display of controls
  const [showControls, setShowControls] = useState(true);

  // Compute adjacency map from dynamic graph edges
  const allEdges = graph.edges;
  const adjacency: Record<string, string[]> = {};
  // Build node ID set from graph nodes
  const allNodeIds = new Set<string>(graph.nodes.map(n => n.id));
  allNodeIds.forEach(id => { adjacency[id] = []; });
  allEdges.forEach(e => {
    adjacency[e.from].push(e.to);
    adjacency[e.to].push(e.from);
  });

  // BFS up to selected degree
  const computeReachable = (rootId: string, maxDist: number) => {
    const visited = new Set<string>([rootId]);
    let current = new Set<string>([rootId]);
    for (let d = 1; d <= maxDist; d++) {
      const next = new Set<string>();
      current.forEach(id => {
        adjacency[id].forEach(neigh => {
          if (!visited.has(neigh)) {
            visited.add(neigh);
            next.add(neigh);
          }
        });
      });
      current = next;
    }
    return visited;
  };
  const reachable = computeReachable(user.id, degree);

  // Nodes and edges for GraphCanvas: filter graph data by reachability
  const nodesForCanvas = graph.nodes.filter(n => reachable.has(n.id));
  const edgesForCanvas = allEdges.filter(e => reachable.has(e.from) && reachable.has(e.to));

  // Gather tags from current user's posts
  const taggedNodeIds = Array.from(new Set(
    postData.posts
      .filter(p => p.authorId === user.id)
      .flatMap(p => p.tags)
  ));

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Split view: 3D graph and map */}
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <div style={{ flex: 2, position: 'relative' }}>
          {/* Show/hide controls toggle */}
          <button
            style={{ position: 'absolute', top: 5, left: 5, zIndex: 20 }}
            onClick={() => setShowControls(prev => !prev)}
          >
            {showControls ? 'Hide Controls' : 'Show Controls'}
          </button>
          {/* Controls: only visible when showControls is true */}
          {showControls && (
            <>
              {/* Degree slider */}
              <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 20, background: 'rgba(255,255,255,0.8)', padding: '8px', borderRadius: '4px' }}>
                <label>
                  Degree: {degree}
                  <input
                    type="range"
                    min={1}
                    max={3}
                    value={degree}
                    onChange={e => setDegree(Number(e.target.value))}
                    style={{ marginLeft: '8px' }}
                  />
                </label>
              </div>
              {/* OrbitControls toggle */}
              <button
                style={{ position: 'absolute', top: 35, left: 5, zIndex: 20 }}
                onClick={() => setAutoRotate(prev => !prev)}
              >
                {autoRotate ? 'Stop Rotation' : 'Start Rotation'}
              </button>
              {/* Path mode toggle */}
              <button
                style={{ position: 'absolute', top: 65, left: 5, zIndex: 20 }}
                onClick={() => {
                  setPathMode(prev => !prev);
                  setPathEndpoints([]);
                  setHighlightNodeIds([]);
                  setHighlightEdgePairs([]);
                  setSelected(null);
                }}
              >
                {pathMode ? 'Exit Path Mode' : 'Path Mode'}
              </button>
            </>
          )}
          <GraphCanvas
            nodes={nodesForCanvas}
            edges={edgesForCanvas}
            currentUserId={user.id}
            autoRotate={autoRotate}
            showAllEdges={true}
            taggedNodeIds={taggedNodeIds}
            highlightNodeIds={highlightNodeIds}
            highlightEdgePairs={highlightEdgePairs}
            presenceMap={presenceMap}
            friendRequests={graph.friendRequests}
            onNodeClick={n => {
              if (pathMode) {
                setPathEndpoints(prev => {
                  const next = prev.length === 2 ? [n.id] : [...prev, n.id];
                  if (next.length === 2) {
                    // BFS to find shortest path
                    const [start, end] = next;
                    const queue = [start];
                    const prevMap: Record<string, string | null> = { [start]: null };
                    let found = false;
                    while (queue.length && !found) {
                      const u = queue.shift()!;
                      for (const v of adjacency[u] || []) {
                        if (!(v in prevMap)) {
                          prevMap[v] = u;
                          if (v === end) { found = true; break; }
                          queue.push(v);
                        }
                      }
                    }
                    // reconstruct path
                    const path: string[] = [];
                    if (found) {
                      let cur: string | null = end;
                      while (cur) { path.unshift(cur); cur = prevMap[cur]; }
                    }
                    // set highlights
                    setHighlightNodeIds(path);
                    const edgesPath: [string,string][] = [];
                    path.forEach((id, idx) => {
                      if (idx > 0) edgesPath.push([path[idx-1], id]);
                    });
                    setHighlightEdgePairs(edgesPath);
                  } else {
                    setHighlightNodeIds([]);
                    setHighlightEdgePairs([]);
                  }
                  return next;
                });
              } else {
                setSelected(prev => (prev?.id === n.id ? null : n));
                // broadcast presence on this node
                setPresence(n.id);
              }
            }}
          />
          {/* Profile card overlay within graph pane */}
          {selected && (
            <NodeCard
              node={selected}
              nodes={graph.nodes}
              edges={graph.edges}
              friendRequests={graph.friendRequests}
              sendRequest={graph.sendFriendRequest}
              approveRequest={graph.approveFriendRequest}
              declineRequest={graph.declineFriendRequest}
              addEdge={graph.addEdge}
              removeEdge={graph.removeEdge}
              updateNode={graph.updateNode}
              userId={user.id}
              isAdmin={user.isAdmin}
              posts={postData.posts}
              onAddPost={postData.addPost}
              onDeletePost={postData.deletePost}
              onToggleLike={postData.toggleLike}
              onAddComment={postData.addComment}
              profileVisibility={users.find(u => u.id === selected.id)?.profileVisibility ?? 'public'}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
        <div style={{ flex: 1, borderLeft: '1px solid #444' }}>
          {/* Show all friends' addresses on the map: pass full graph.nodes */}
          <MapView
            nodes={graph.nodes}
            onMarkerClick={n => setSelected(n)}
            selectedNodeId={selected?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default ExplorerPage; 