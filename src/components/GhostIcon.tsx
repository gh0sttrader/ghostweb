import React from 'react';

export function GhostIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 10v3a6 6 0 0 0 12 0v-3" />
      <path d="M12 4a4 4 0 0 1 4 4h-8a4 4 0 0 1 4-4Z" />
      <path d="M10 16a2 2 0 1 0-4 0" />
      <path d="M18 16a2 2 0 1 0-4 0" />
    </svg>
  );
}
