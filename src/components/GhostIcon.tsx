
import { SVGProps } from 'react';

export const GhostIcon = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M96 128a16 16 0 1116 16 16 16 0 01-16-16zm64-16a16 16 0 1016 16 16 16 0 00-16-16z" />
    <path d="M128 32a96 96 0 00-96 96v56l40 32 40-32V160h32v56l40 32 40-32v-56a96 96 0 00-96-96z" />
  </svg>
);
