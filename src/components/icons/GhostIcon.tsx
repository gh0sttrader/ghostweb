
import * as React from "react";

export const GhostIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="16"
    viewBox="0 0 256 256"
    {...props}
  >
    <path d="M96,128a16,16,0,1,1,16-16A16,16,0,0,1,96,128Zm64,0a16,16,0,1,0-16-16A16,16,0,0,0,160,128Zm-32-8a104,104,0,0,0-88,48v40a8,8,0,0,0,8,8h40v-8a16,16,0,0,1,16-16h48a16,16,0,0,1,16,16v8h40a8,8,0,0,0,8-8v-40A104,104,0,0,0,128,120Z" />
  </svg>
);
