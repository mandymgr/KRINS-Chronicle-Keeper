/**
 * 🔽 Select Component
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  children: React.ReactNode;
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

export interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

export interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  className?: string;
  children: React.ReactNode;
}

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

// Basic Select implementation - can be enhanced with Radix UI later
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <button
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);

export const SelectContent: React.FC<SelectContentProps> = ({ className = '', children }) => {
  return (
    <div className={`relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md ${className}`}>
      {children}
    </div>
  );
};

export const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <option
        className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </option>
    );
  }
);

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className = '' }) => {
  return (
    <span className={`block truncate ${className}`}>
      {placeholder}
    </span>
  );
};

Select.displayName = 'Select';
SelectTrigger.displayName = 'SelectTrigger';
SelectContent.displayName = 'SelectContent';
SelectItem.displayName = 'SelectItem';
SelectValue.displayName = 'SelectValue';