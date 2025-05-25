import React, { useState, FC } from 'react';
import GraphCanvas from '../components/GraphCanvas';
import NodeCard from '../components/NodeCard';
import { useGraphData, NodeData } from '../hooks/useGraphData';
import { usePostData } from '../hooks/usePostData';

interface ExplorerPageProps {
  user: any;
  users: any[];
  graph: ReturnType<typeof useGraphData>;
  postData: ReturnType<typeof usePostData>;
}

const ExplorerPage: FC<ExplorerPageProps> = ({ user, users, graph, postData }) => {
  const [selected, setSelected] = useState<NodeData | null>(null);
  const [centerTrigger, setCenterTrigger] = useState(false);
  const [centerOnMeTrigger, setCenterOnMeTrigger] = useState(0);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <button
        style={{ position: 'absolute', top: 10, left: 10, zIndex: 20 }}
        onClick={() => setCenterTrigger(prev => !prev)}
      >
        Center
      </button>
      <button
        style={{ position: 'absolute', top: 10, left: 80, zIndex: 20 }}
        onClick={() => setCenterOnMeTrigger(prev => prev + 1)}
      >
        Go To Me
      </button>
      <GraphCanvas
        nodes={graph.nodes}
        edges={user.showConnections || user.isAdmin ? graph.edges : []}
        centerTrigger={centerTrigger}
        centerOnMeTrigger={centerOnMeTrigger}
        currentUserId={user.id}
        onNodeClick={setSelected}
      />
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
          profileVisibility={users.find(u => u.id === selected.id)?.profileVisibility ?? 'public'}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default ExplorerPage; 