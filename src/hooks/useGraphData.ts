import { useState, useEffect } from 'react';
import { useCollaboration } from './useCollaboration';
import {
  getFriendsApi,
  getPendingRequestsApi,
  sendFriendRequestApi,
  acceptFriendRequestApi,
  declineFriendRequestApi
} from '../api/graphApi';

/** Node data with optional contact info and 3D position */
export interface NodeData {
  id: string;
  label: string;
  phone?: string;
  address?: string;
  position: [number, number, number];
  geo?: [number, number]; // [lat, lng]
}

/** Edge representing a bidirectional friendship between two node IDs */
export interface EdgeData {
  from: string;
  to: string;
}

/** Friend request from one node to another */
export interface FriendRequest {
  id: string;
  from: string;
  to: string;
}

/** Default global node list (mock) */
export const initialNodesGlobal: NodeData[] = [
  { id: '0', label: 'Admin', phone: '', address: '', position: [0, 0, 0] },
  { id: '1', label: 'Alice', phone: '', address: '', position: [2, 1, 0] },
  { id: '2', label: 'Bob', phone: '', address: '', position: [-2, 1, 0] },
  { id: '3', label: 'Carol', phone: '', address: '', position: [0, 2, 0] }
];

/** Default global edge list (mock friendships) */
export const initialEdgesGlobal: EdgeData[] = [
  { from: '1', to: '2' },
  { from: '1', to: '3' }
];

/**
 * Hook to manage graph data. Optionally scopes to a user by ID.
 * @param userId if provided, only include that user's node and direct friends
 */
export function useGraphData(userId?: string) {
  const { socket } = useCollaboration(userId!);
  // Determine initial nodes/edges based on logged-in user
  let initNodes = initialNodesGlobal;
  let initEdges = initialEdgesGlobal;
  if (userId) {
    // filter edges to those involving the user
    const userEdges = initialEdgesGlobal.filter(
      e => e.from === userId || e.to === userId
    );
    // determine neighbor IDs
    const neighborIds = new Set<string>(
      userEdges.map(e => (e.from === userId ? e.to : e.from))
    );
    initNodes = initialNodesGlobal.filter(
      n => n.id === userId || neighborIds.has(n.id)
    );
    initEdges = userEdges;
  }
  // Persist nodes per user or globally for admin
  const nodesKey = userId ? `socialexplore3d_nodes_${userId}` : 'socialexplore3d_nodes_global';
  const [nodes, setNodes] = useState<NodeData[]>(() => {
    if (nodesKey) {
      try {
        const stored = localStorage.getItem(nodesKey);
        if (stored) {
          const parsed = JSON.parse(stored) as NodeData[];
          return parsed.filter(n => n && typeof n.id === 'string');
        }
      } catch (e) {
        console.error('Failed to parse stored nodes', e);
        localStorage.removeItem(nodesKey);
      }
      return initNodes;
    }
    // admin case: always use initial nodes
    return initNodes;
  });
  // Persist nodes on change
  useEffect(() => {
    if (!nodesKey) return;
    try {
      localStorage.setItem(nodesKey, JSON.stringify(nodes));
    } catch (e) {
      console.error('Failed to persist nodes', e);
    }
  }, [nodesKey, nodes]);
  // Persist edges per user or globally for admin
  const edgesKey = userId ? `socialexplore3d_edges_${userId}` : 'socialexplore3d_edges_global';
  const [edges, setEdges] = useState<EdgeData[]>(() => {
    if (edgesKey) {
      const stored = localStorage.getItem(edgesKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed as EdgeData[];
          }
        } catch (e) {
          console.error('Failed to parse stored edges', e);
        }
        localStorage.removeItem(edgesKey);
      }
    }
    return initEdges;
  });
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  // Persist edges on change so connections survive reload
  useEffect(() => {
    if (edgesKey) {
      try {
        localStorage.setItem(edgesKey, JSON.stringify(edges));
      } catch (e) {
        console.error('Failed to persist edges', e);
      }
    }
  }, [edgesKey, edges]);

  // Load initial data from server
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        // fetch friendships
        const friends = await getFriendsApi(userId);
        setEdges(friends.map(f => ({ from: userId, to: f.id })));
        // ensure nodes exist for each friend
        setNodes(prev => {
          const existing = new Set(prev.map(n => n.id));
          const newNodes = friends
            .filter(f => !existing.has(f.id))
            .map(f => ({ id: f.id, label: f.name, position: [0, 0, 0] as [number, number, number] }));
          return [...prev, ...newNodes];
        });
        // fetch pending requests
        const pending = await getPendingRequestsApi(userId);
        setFriendRequests(pending.map(u => ({ id: `${u.id}-${userId}`, from: u.id, to: userId })));
      } catch (err) {
        console.error('Failed to load graph data', err);
      }
    })();
  }, [userId]);

  // Subscribe to real-time friend request and approval events
  useEffect(() => {
    if (!socket) return;
    const handler = (req: any) => {
      if (req.approved) {
        // friend request approved: add friendship and remove pending request
        setFriendRequests(prev => prev.filter(r => r.id !== req.id));
        setEdges(prev => {
          if (prev.some(e => (e.from === req.from && e.to === req.to) || (e.from === req.to && e.to === req.from))) return prev;
          return [...prev, { from: req.from, to: req.to }];
        });
      } else if (req.declined) {
        // friend request declined: remove pending request
        setFriendRequests(prev => prev.filter(r => r.id !== req.id));
      } else {
        // new friend request: only show to recipient
        if (req.to === userId) setFriendRequests(prev => [...prev, req]);
      }
    };
    socket.on('friendRequest', handler);
    return () => { socket.off('friendRequest', handler); };
  }, [socket, userId]);

  // Subscribe to real-time friend removal events
  useEffect(() => {
    if (!socket) return;
    const handler = (upd: { from: string; to: string }) => {
      setEdges(prev => prev.filter(e =>
        !((e.from === upd.from && e.to === upd.to) || (e.from === upd.to && e.to === upd.from))
      ));
    };
    socket.on('friendRemove', handler);
    return () => { socket.off('friendRemove', handler); };
  }, [socket]);

  /** Add a new node (friend) with auto-generated unique ID */
  const addNode = (node: Omit<NodeData, 'id' | 'position'>) => {
    const id = Date.now().toString();
    const position: [number, number, number] = [
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
      0
    ];
    setNodes(prev => [...prev, { id, ...node, position }]);
  };

  /** Add a friendship edge if not already present */
  const addEdge = (from: string, to: string) => {
    setEdges(prev => {
      if (prev.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))) {
        return prev;
      }
      return [...prev, { from, to }];
    });
  };

  const removeEdge = (from: string, to: string) => {
    setEdges(prev =>
      prev.filter(e => !((e.from === from && e.to === to) || (e.from === to && e.to === from)))
    );
    // broadcast removal to other clients
    socket?.emit('friendRemove', { from, to });
  };

  /** Send a friend request from one node to another */
  const sendFriendRequest = async (from: string, to: string) => {
    if (from === to) return;
    // don't send if already friends
    if (edges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))) {
      return;
    }
    // don't send duplicate request
    if (friendRequests.some(r => r.from === from && r.to === to)) {
      return;
    }
    try {
      await sendFriendRequestApi(from, to);
    } catch (err) {
      console.error('API friend request failed', err);
    }
    const id = `${from}-${to}`;
    setFriendRequests(prev => [...prev, { id, from, to }]);
    // notify other clients
    socket?.emit('friendRequest', { id, from, to });
  };

  /** Approve a pending friend request */
  const approveFriendRequest = async (requestId: string) => {
    const req = friendRequests.find(r => r.id === requestId);
    if (!req) return;
    try {
      await acceptFriendRequestApi(req.from, req.to);
    } catch (err) {
      console.error('API accept request failed', err);
    }
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    addEdge(req.from, req.to);
    // notify other clients
    socket?.emit('friendRequest', { id: req.id, from: req.from, to: req.to, approved: true });
  };

  /** Decline a friend request */
  const declineFriendRequest = async (requestId: string) => {
    const req = friendRequests.find(r => r.id === requestId);
    if (!req) return;
    try {
      await declineFriendRequestApi(req.from, req.to);
    } catch (err) {
      console.error('API decline request failed', err);
    }
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    // notify other clients
    socket?.emit('friendRequest', { id: req.id, from: req.from, to: req.to, declined: true });
  };

  /** Update node data by id */
  const updateNode = (id: string, data: Partial<Omit<NodeData, 'id' | 'position'>>) => {
    setNodes(prev =>
      prev.map(n => (n.id === id ? { ...n, ...data } : n))
    );
  };

  return { nodes, edges, friendRequests, addNode, addEdge, removeEdge, updateNode, sendFriendRequest, approveFriendRequest, declineFriendRequest };
} 