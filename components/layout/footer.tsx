'use client';

import { useEffect, useState } from 'react';
import { mockTasks } from '@/lib/mock-data';

export function Footer() {
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    const runningTasks = mockTasks.filter((t) => t.status === 'running').length;
    const reviewTasks = mockTasks.filter((t) => t.status === 'review').length;
    
    const parts = [];
    if (runningTasks > 0) parts.push(`${runningTasks} task${runningTasks > 1 ? 's' : ''} running`);
    if (reviewTasks > 0) parts.push(`${reviewTasks} task${reviewTasks > 1 ? 's' : ''} pending review`);
    
    setStatusText(parts.length > 0 ? `Status: ${parts.join(' • ')}` : 'All tasks up to date');
  }, []);

  return (
    <footer className="h-8 border-t bg-muted/30 flex items-center px-4">
      <p className="text-caption text-muted-foreground">{statusText}</p>
    </footer>
  );
}
