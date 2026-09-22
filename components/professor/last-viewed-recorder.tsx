'use client';

import { useEffect } from 'react';
import { recordLastViewed } from '@/actions/professors';

// Fire-and-forget: remembers the professor for the dashboard "resume" card.
export function LastViewedRecorder({ professorId }: { professorId: string }) {
  useEffect(() => {
    void recordLastViewed(professorId);
  }, [professorId]);
  return null;
}
