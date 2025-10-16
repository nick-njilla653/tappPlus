import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className = '', ...props }: InputProps) {
  const classes = `form-control ${className}`.trim();
  
  return (
    <input className={classes} {...props} />
  );
}
