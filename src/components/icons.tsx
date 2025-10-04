import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export const Icons = {
  logo: ({ className, ...props }: SVGProps<SVGSVGElement> & { status?: 'NORMAL' | 'ANOMALİ' | 'KALİBRE EDİLİYOR' }) => {
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
        <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4l2.6-2.6c1-1 2.5-1 3.4 0l2.6 2.6Z" />
        <path d="m14.3 11.3 2.6 2.6" />
        <path d="M21.3 1.3a2.4 2.4 0 0 1 0 3.4l-8 8" />
        <path d="m3.3 12.7 8-8" />
        <path d="m12.7 21.7 8-8" />
      </svg>
    );
  },
};
