
import * as React from "react";

export const GhostIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="currentColor"
    viewBox="0 0 256 256"
    {...props}
  >
    <path d="M128,24A104,104,0,0,0,24,128v88a16,16,0,0,0,16,16H80a16,16,0,0,0,16-16V216a16,16,0,0,0-16-16H40V128a88,88,0,0,1,176,0v64a16,16,0,0,0-16,16v16a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V128A104,104,0,0,0,128,24Zm40,88a24,24,0,1,1-24-24A24,24,0,0,1,168,112Zm-80,0a24,24,0,1,1-24-24A24,24,0,0,1,88,112Z"></path>
  </svg>
);
