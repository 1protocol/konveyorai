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
        <rect x="2" y="7" width="20" height="10" rx="2" ry="2" />
        <circle cx="6" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="18" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    );
  },
};
