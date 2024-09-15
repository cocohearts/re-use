import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-0 transition-all disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-pine-950 dark:focus-visible:ring-pine-300',
  {
    variants: {
      variant: {
        default:
          'border border-pine-900 bg-white hover:bg-pine-900 hover:text-pine-50 dark:border-pine-800 dark:bg-pine-950 dark:hover:bg-pine-800 dark:hover:text-pine-50',
        destructive:
          'bg-red-500 text-pine-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-pine-50 dark:hover:bg-red-900/90',
        filled:
          'bg-pine-900 text-pine-50 hover:bg-pine-900/90 dark:bg-pine-50 dark:text-pine-900 dark:hover:bg-pine-50/90',
        secondary:
          'bg-pine-100 text-pine-900 hover:bg-pine-100/80 dark:bg-pine-800 dark:text-pine-50 dark:hover:bg-pine-800/80',
        ghost:
          'hover:bg-pine-100 hover:text-pine-900 dark:hover:bg-pine-800 dark:hover:text-pine-50 border-none',
        link: 'text-pine-900 underline-offset-4 hover:underline dark:text-pine-50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
