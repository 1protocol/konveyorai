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
        <path d="M3 3v4" />
        <path d="M19 3v4" />
        <path d="M3 5h18" />
        <path d="M3 21v-4" />
        <path d="M19 21v-4" />
        <path d="M3 19h18" />
        <path d="M7 5v14" />
        <path d="M12 5v14" />
        <path d="M17 5v14" />
      </svg>
    );
  },
};
