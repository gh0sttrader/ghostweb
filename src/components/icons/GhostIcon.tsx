import * as React from "react";

export const GhostIcon = ({ className }: { className?: string }) => (
  <span className={className}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 256 256"
    >
      <path d="M128,24A104,104,0,0,0,24,128v88a16,16,0,0,0,16,16H80a16,16,0,0,0,16-16V216a16,16,0,0,1,16-16h48a16,16,0,0,1,16,16v8a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V128A104,104,0,0,0,128,24Zm40,120a16,16,0,1,1,16-16A16,16,0,0,1,168,144Zm-64,0a16,16,0,1,1,16-16A16,16,0,0,1,104,144Z" />
    </svg>
  </span>
);