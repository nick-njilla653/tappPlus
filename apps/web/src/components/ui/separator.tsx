import React from 'react';

interface SeparatorProps {
  className?: string;
}

export function Separator({ className = '' }: SeparatorProps) {
  const classes = `border-t border-gray-200 my-4 ${className}`.trim();
  
  return (
    <hr className={classes} />
  );
}
