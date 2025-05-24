import React, { FC, useState } from 'react';
import GraphCanvas from '../components/GraphCanvas';
import NodeCard from '../components/NodeCard';
import { useGraphData, NodeData, FriendRequest } from '../hooks/useGraphData';
import { usePostData, Post } from '../hooks/usePostData';
import styled from 'styled-components';

interface AdminPageProps {
  user: any;
  users: any[];
  graph: ReturnType<typeof useGraphData>;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const AdminPage: FC<AdminPageProps> = ({ user, users, graph }) => {
  const postData = usePostData();
  const [selected, setSelected] = useState<NodeData | null>(null);

  return (
    <Container>
      <GraphCanvas nodes={graph.nodes} edges={graph.edges} onNodeClick={setSelected} />
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
    </Container>
  );
};

export default AdminPage; 