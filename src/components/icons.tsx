import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export const Icons = {
  logo: ({ className, ...props }: SVGProps<SVGSVGElement>) => {
    return (
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
        className={cn('text-primary', className)}
        {...props}
      >
        {/* Triangle Ruler (Set Square) Icon */}
        <path d="M21.7 3.3a1 1 0 0 0-1.4 0L3.3 20.3a1 1 0 0 0 0 1.4l.4.4a1 1 0 0 0 1.4 0L21.7 4.7a1 1 0 0 0 0-1.4l-.4-.4Z" />
        <path d="M16 9h-2" />
        <path d="M13 12H9" />
        <path d="M10 15H8" />
        <path d="M7 18H5" />
      </svg>
    );
  },
};
