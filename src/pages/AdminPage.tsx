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
  postData: ReturnType<typeof usePostData>;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const RandomButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 11;
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const AdminPage: FC<AdminPageProps> = ({ user, users, graph, postData }) => {
  const { posts, addPost, deletePost, toggleLike, addComment } = postData;
  const [selected, setSelected] = useState<NodeData | null>(null);

  const handleRandomConnect = () => {
    graph.nodes.forEach(n => {
      const others = graph.nodes.filter(m => m.id !== n.id);
      if (others.length > 0) {
        const random = others[Math.floor(Math.random() * others.length)];
        graph.addEdge(n.id, random.id);
      }
    });
  };

  return (
    <Container>
      <RandomButton onClick={handleRandomConnect}>
        Random Connect
      </RandomButton>
      <GraphCanvas
        nodes={graph.nodes}
        edges={graph.edges}
        onNodeClick={setSelected}
        currentUserId={user.id}
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
          posts={posts}
          onAddPost={addPost}
          onDeletePost={deletePost}
          onToggleLike={toggleLike}
          onAddComment={addComment}
          profileVisibility={users.find(u => u.id === selected.id)?.profileVisibility ?? 'public'}
          onClose={() => setSelected(null)}
        />
      )}
    </Container>
  );
};

export default AdminPage; 