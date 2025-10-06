import { SVGProps } from 'react';

export const SvgIcons = {
  ConveyorMovement: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6-6 6 6" />
      <path d="M12 3v13.5" />
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
};
