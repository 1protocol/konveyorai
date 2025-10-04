import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export const Icons = {
  logo: ({ className, ...props }: SVGProps<SVGSVGElement> & { status?: 'NORMAL' | 'ANOMALİ' | 'KALİBRE EDİLİYOR' }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('text-primary', className)}
        {...props}
      >
        <path d="M2 12h2.25" />
        <path d="M19.75 12h2.25" />
        <path d="M4.25 12a7.75 7.75 0 0 1 15.5 0" />
        <path d="M4.25 12a7.75 7.75 0 0 0 15.5 0" />
        <circle 
            cx="8" 
            cy="12" 
            r="1.5" 
            className="fill-green-500 animate-opacity-pulse"
            stroke="none"
        />
        <circle 
            cx="16" 
            cy="12" 
            r="1.5" 
            className="fill-red-500 animate-opacity-pulse [animation-delay:750ms]"
            stroke="none" 
        />
      </svg>
    );
  },
};
