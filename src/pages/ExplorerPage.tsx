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

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <GraphCanvas
        nodes={graph.nodes}
        edges={user.showConnections || user.isAdmin ? graph.edges : []}
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
          profileVisibility={users.find(u => u.id === selected.id)?.profileVisibility ?? 'public'}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default ExplorerPage; 