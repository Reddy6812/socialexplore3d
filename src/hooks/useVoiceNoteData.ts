import { useState, useEffect } from 'react';

export interface VoiceNote {
  id: string;
  from: string;
  to: string;
  audioUrl: string;
}

export function useVoiceNoteData() {
  const key = 'socialexplore3d_voiceNotes';
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed as VoiceNote[];
        }
      } catch {
        // ignore parse errors
      }
      localStorage.removeItem(key);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(voiceNotes));
    } catch (e) {
      console.error('Failed to persist voice notes', e);
    }
  }, [voiceNotes]);

  /** Send a voice note from one user to another */
  const addVoiceNote = (from: string, to: string, audioUrl: string) => {
    const id = Date.now().toString();
    const note: VoiceNote = { id, from, to, audioUrl };
    setVoiceNotes(prev => [...prev, note]);
  };

  /** Delete a voice note by ID */
  const deleteVoiceNote = (noteId: string) => {
    setVoiceNotes(prev => prev.filter(n => n.id !== noteId));
  };

  return { voiceNotes, addVoiceNote, deleteVoiceNote };
} 