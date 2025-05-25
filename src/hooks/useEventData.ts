import { useState, useEffect } from 'react';

export interface EventData {
  id: string;
  name: string;
  description?: string;
}

export interface Rsvp {
  id: string;
  eventId: string;
  userId: string;
}

export function useEventData() {
  const eventsKey = 'socialexplore3d_events';
  const rsvpsKey = 'socialexplore3d_rsvps';

  const [events, setEvents] = useState<EventData[]>(() => {
    try {
      const stored = localStorage.getItem(eventsKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      localStorage.removeItem(eventsKey);
      return [];
    }
  });

  const [rsvps, setRsvps] = useState<Rsvp[]>(() => {
    try {
      const stored = localStorage.getItem(rsvpsKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      localStorage.removeItem(rsvpsKey);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(eventsKey, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to persist events', e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(rsvpsKey, JSON.stringify(rsvps));
    } catch (e) {
      console.error('Failed to persist rsvps', e);
    }
  }, [rsvps]);

  const addEvent = (name: string, description?: string): string => {
    const id = Date.now().toString();
    setEvents(prev => [...prev, { id, name, description }]);
    return id;
  };

  const joinEvent = (eventId: string, userId: string) => {
    // prevent duplicate
    if (rsvps.some(r => r.eventId === eventId && r.userId === userId)) return;
    const id = Date.now().toString();
    setRsvps(prev => [...prev, { id, eventId, userId }]);
  };

  const leaveEvent = (eventId: string, userId: string) => {
    setRsvps(prev => prev.filter(r => !(r.eventId === eventId && r.userId === userId)));
  };

  return { events, rsvps, addEvent, joinEvent, leaveEvent };
} 