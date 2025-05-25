import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useEventData, EventData } from '../hooks/useEventData';

interface EventsPageProps {
  user: any;
}

const Container = styled.div`
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
`;

const EventsPage: FC<EventsPageProps> = ({ user }) => {
  const { events, addEvent } = useEventData();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addEvent(name, description || undefined);
    setName('');
    setDescription('');
  };

  return (
    <Container>
      <h2>Events</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Event name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '8px' }}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '8px' }}
        />
        <button type="submit">Create Event</button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {events.map((ev: EventData) => (
          <li key={ev.id} style={{ margin: '8px 0' }}>
            <Link to={`/events/${ev.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              {ev.name}
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
};

export default EventsPage; 