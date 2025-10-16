import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
}

export function Label({ children, className = '', ...props }: LabelProps) {
  const classes = `form-label ${className}`.trim();
  
  return (
    <label className={classes} {...props}>
      {children}
    </label>
  );
}
