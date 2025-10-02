import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 12h2.25" />
      <path d="M19.75 12h2.25" />
      <path d="M4.25 12a7.75 7.75 0 0 1 15.5 0" />
      <path d="M4.25 12a7.75 7.75 0 0 0 15.5 0" />
      <path d="M12 4.25V2" />
      <path d="M12 22v-2.25" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  ),
};
