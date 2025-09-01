import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-nordic-ocean text-nordic-off-white hover:bg-nordic-ocean/80 dark:bg-nordic-ocean dark:text-nordic-off-white',
        secondary:
          'border-transparent bg-nordic-light-gray text-nordic-charcoal hover:bg-nordic-light-gray/80 dark:bg-nordic-medium-gray dark:text-nordic-off-white',
        destructive:
          'border-transparent bg-nordic-error text-nordic-off-white hover:bg-nordic-error/80 dark:bg-nordic-error dark:text-nordic-off-white',
        success:
          'border-transparent bg-nordic-success text-nordic-off-white hover:bg-nordic-success/80 dark:bg-nordic-success dark:text-nordic-off-white',
        warning:
          'border-transparent bg-nordic-warning text-nordic-off-white hover:bg-nordic-warning/80 dark:bg-nordic-warning dark:text-nordic-black',
        outline:
          'border-nordic-medium-gray text-nordic-charcoal hover:bg-nordic-light-gray dark:border-nordic-medium-gray dark:text-nordic-off-white',
        sage:
          'border-transparent bg-nordic-sage text-nordic-off-white hover:bg-nordic-sage/80 dark:bg-nordic-sage dark:text-nordic-off-white',
        stone:
          'border-transparent bg-nordic-stone text-nordic-off-white hover:bg-nordic-stone/80 dark:bg-nordic-stone dark:text-nordic-off-white',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };