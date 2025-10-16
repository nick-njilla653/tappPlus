import React from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function Switch({ checked, onCheckedChange, className = '' }: SwitchProps) {
  const classes = `form-check-input ${className}`.trim();
  
  return (
    <input
      type="checkbox"
      className={classes}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  );
}
