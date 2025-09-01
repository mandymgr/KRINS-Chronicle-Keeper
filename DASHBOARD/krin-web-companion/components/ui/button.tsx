import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-base font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        accent:
          'bg-accent text-accent-ink shadow hover:opacity-95 rounded-md',
        ghost:
          'bg-transparent text-ink hover:bg-stone-100 rounded-md',
        outline:
          'bg-transparent text-ink border border-stone-200 hover:border-ink hover:bg-stone-100 rounded-md',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-600/90 rounded-md',
        secondary:
          'bg-stone-100 text-ink shadow-sm hover:bg-stone-200 rounded-md',
        link: 'text-accent underline-offset-4 hover:underline',
        success:
          'bg-ai-active text-white shadow hover:bg-ai-active/90 rounded-md',
      },
      size: {
        default: 'px-4 py-2',
        sm: 'px-3 py-1.5 text-sm',
        lg: 'px-6 py-3 text-lg',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'accent',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };