import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-lg border border-nordic-light-gray bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-nordic-charcoal placeholder:text-nordic-medium-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nordic-ocean focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-nordic-medium-gray dark:file:text-nordic-off-white dark:placeholder:text-nordic-medium-gray',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };