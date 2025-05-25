import React, { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useEventData, EventData, Rsvp } from '../hooks/useEventData';
import { useGraphData, NodeData } from '../hooks/useGraphData';
import GraphCanvas from '../components/GraphCanvas';

interface EventPageProps {
  user: any;
  users: any[];
}

const Container = styled.div`
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
`;

const EventPage: FC<EventPageProps> = ({ user, users }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, rsvps, joinEvent, leaveEvent } = useEventData();
  const graphGlobal = useGraphData(undefined);
  if (!id) return <Container>Event not found.</Container>;
  const ev = events.find((e: EventData) => e.id === id);
  if (!ev) return <Container>Event not found.</Container>;

  // attendees userIds
  const attendees = rsvps.filter((r: Rsvp) => r.eventId === id).map(r => r.userId);
  const isAttendee = attendees.includes(user.id);

  // Build nodes and edges for GraphCanvas
  // event node
  const eventNode: NodeData = { id, label: ev.name, position: [0, 0, 0] };
  // attendee nodes
  const attendeeNodes: NodeData[] = attendees
    .map(uid => graphGlobal.nodes.find(n => n.id === uid))
    .filter((n): n is NodeData => !!n);
  const nodesForCanvas: NodeData[] = [eventNode, ...attendeeNodes];
  // RSVP edges
  const edgesForCanvas = attendees.map(uid => ({ from: id, to: uid }));

  return (
    <Container>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h2>Event: {ev.name}</h2>
      {ev.description && <p>{ev.description}</p>}
      <button onClick={() => {
        if (isAttendee) leaveEvent(id, user.id);
        else joinEvent(id, user.id);
      }} style={{ marginBottom: '16px' }}>
        {isAttendee ? 'Leave Event' : 'Join Event'}
      </button>
      <div style={{ width: '100%', height: '500px' }}>
        <GraphCanvas
          nodes={nodesForCanvas}
          edges={edgesForCanvas}
          currentUserId={id}
          autoRotate={false}
          onNodeClick={n => {
            if (n.id !== id) navigate(`/profile/${n.id}`);
          }}
        />
      </div>
      <h3>Attendees ({attendees.length})</h3>
      <ul>
        {attendees.map(uid => {
          const u = users.find(u => u.id === uid);
          return <li key={uid}>{u?.label || uid}</li>;
        })}
      </ul>
    </Container>
  );
};

export default EventPage; 