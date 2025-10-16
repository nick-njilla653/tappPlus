import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  error?: boolean;
}

export function Textarea({ 
  className = '', 
  error = false, 
  ...props 
}: TextareaProps) {
  const baseClasses = 'input min-h-[80px] resize-y';
  const errorClasses = error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : '';
  
  return (
    <textarea
      className={`${baseClasses} ${errorClasses} ${className}`}
      {...props}
    />
  );
}
