import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary';
  className?: string;
}

export function Badge({ 
  variant = 'default', 
  children, 
  className = '' 
}: BadgeProps) {
  const baseClasses = 'badge';
  
  const variantClasses = {
    default: 'badge-primary',
    outline: 'badge-outline',
    destructive: 'badge-danger',
    secondary: 'badge-secondary'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();
  
  return (
    <span className={classes}>
      {children}
    </span>
  );
}
