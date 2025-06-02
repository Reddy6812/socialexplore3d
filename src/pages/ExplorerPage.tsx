import React, { useState, useEffect, FC } from 'react';
import GraphCanvas from '../components/GraphCanvas';
import MapView from '../components/MapView';
import { useGraphData, NodeData, EdgeData } from '../hooks/useGraphData';
import { usePostData } from '../hooks/usePostData';
import { useCollaboration } from '../hooks/useCollaboration';
import { useCompanyData } from '../hooks/useCompanyData';
import ApplicantsModal from '../components/ApplicantsModal';
import { useChatData } from '../hooks/useChatData';
import { useNavigate } from 'react-router-dom';
import NodeCard from '../components/NodeCard';
import CompanyCard from '../components/CompanyCard';
import { JobRepository } from '../services/jobRepository';
import { JobUseCases } from '../services/companyUseCases';

interface ExplorerPageProps {
  user: any;
  users: any[];
  graph: ReturnType<typeof useGraphData>;
  postData: ReturnType<typeof usePostData>;
}

const ExplorerPage: FC<ExplorerPageProps> = ({ user, users, graph, postData }) => {
  const [selected, setSelected] = useState<NodeData | null>(null);
  const [mode, setMode] = useState<'people' | 'company'>('people');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const companyData = useCompanyData();
  const jobRepo = new JobRepository();
  const jobUseCases = new JobUseCases(jobRepo);
  const chatData = useChatData(user.id);
  const navigate = useNavigate();
  const [viewingApplicantsJob, setViewingApplicantsJob] = useState<string | null>(null);
  const [currentApplicants, setCurrentApplicants] = useState<{ id: string; name: string }[]>([]);
  const companyNodes: NodeData[] = companyData.companies.map(c => ({ id: c.id, label: c.name, position: [0, 0, 0] as [number, number, number] }));
  const companyEdges: EdgeData[] = [];
  const { presenceMap, setPresence } = useCollaboration(user.id);
  const [autoRotate, setAutoRotate] = useState(false);
  const [pathMode, setPathMode] = useState(false);
  const [pathEndpoints, setPathEndpoints] = useState<string[]>([]);
  const [highlightNodeIds, setHighlightNodeIds] = useState<string[]>([]);
  const [highlightEdgePairs, setHighlightEdgePairs] = useState<[string,string][]>([]);
  const [degree, setDegree] = useState(1);
  // Toggle display of controls
  const [showControls, setShowControls] = useState(true);

  // Load jobs and employees when a company is selected
  useEffect(() => {
    if (selectedCompanyId) {
      companyData.loadJobs(selectedCompanyId);
      companyData.loadEmployees(selectedCompanyId);
    }
  }, [selectedCompanyId]);

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
        // guard adjacency in case it's undefined
        (adjacency[id] || []).forEach(neigh => {
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
  // If admin, show entire graph; otherwise restrict by degree
  const reachable = user.isAdmin
    ? new Set(graph.nodes.map(n => n.id))
    : computeReachable(user.id, degree);

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
      {/* World mode toggle (People or Company) */}
      <div style={{ position: 'absolute', top: 5, right: 5, zIndex: 20 }}>
        <button
          disabled={mode === 'people'}
          onClick={() => { setMode('people'); setSelected(null); setSelectedCompanyId(null); }}
        >
          People World
        </button>
        {user.role !== 'general' && (
          <button
            disabled={mode === 'company'}
            onClick={() => { setMode('company'); setSelected(null); setSelectedCompanyId(null); }}
            style={{ marginLeft: '8px' }}
          >
            Company World
          </button>
        )}
      </div>
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <div style={{ flex: 2, position: 'relative' }}>
          {mode === 'people' ? (
            <>
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
            </>
          ) : (
            <>
              <GraphCanvas
                nodes={companyNodes}
                edges={companyEdges}
                currentUserId={user.id}
                onNodeClick={n => setSelectedCompanyId(prev => (prev === n.id ? null : n.id))}
              />
              {selectedCompanyId && (() => {
                const company = companyData.companies.find(c => c.id === selectedCompanyId)!;
                const jobs = companyData.jobs;
                const employees = graph.nodes.filter(n =>
                  companyData.employees.some(e => e.id === n.id)
                );
                return (
                  <>
                    <CompanyCard
                      company={company}
                      jobs={jobs}
                      employees={employees}
                      userRole={user.role}
                      onApply={jobId => companyData.applyToJob(jobId, user.id)}
                      onConnect={empId => graph.sendFriendRequest(user.id, empId)}
                      onAddJob={job => companyData.addJob(company.id, job.title, job.description, job.location)}
                      onRemoveJob={jobId => companyData.removeJob(jobId)}
                      onViewApplicants={async jobId => {
                        const apps = await jobUseCases.listApplicants(jobId);
                        setCurrentApplicants(apps);
                        setViewingApplicantsJob(jobId);
                      }}
                      onClose={() => setSelectedCompanyId(null)}
                    />
                    {viewingApplicantsJob && (
                      <ApplicantsModal
                        applicants={currentApplicants}
                        onClose={() => setViewingApplicantsJob(null)}
                        onConnect={empId => graph.sendFriendRequest(user.id, empId)}
                        onMessage={empId => {
                          const cid = chatData.startChat(empId);
                          navigate(`/chats/${cid}`);
                        }}
                      />
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
        <div style={{ flex: 1, borderLeft: '1px solid #444' }}>
          {mode === 'people' && (
            <MapView
              nodes={graph.nodes}
              onMarkerClick={n => setSelected(n)}
              selectedNodeId={selected?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorerPage; 