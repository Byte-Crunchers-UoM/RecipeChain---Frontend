import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes cleanly
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  icon?: LucideIcon;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, icon: Icon, isLoading, children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-[#16a34a] text-white shadow-md hover:bg-[#15803d] shadow-green-600/10 hover:shadow-green-600/20",
      outline: "bg-transparent border-2 border-green-200 text-[#16a34a] hover:bg-green-50",
      ghost: "bg-transparent text-slate-600 hover:bg-slate-100"
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3.5 text-base",
      lg: "px-8 py-5 text-lg"
    };

    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none group",
      variants[variant],
      sizes[size],
      className
    );

    const content = (
      <>
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {children}
            {Icon && <Icon size={20} className="transition-transform group-hover:translate-x-1" />}
          </>
        )}
      </>
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";