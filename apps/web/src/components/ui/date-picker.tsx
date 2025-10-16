'use client';

import { useState } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  min?: string;
  max?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Sélectionner une date',
  disabled = false,
  className = '',
  id,
  min,
  max,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="date"
          id={id}
          value={value || ''}
          onChange={handleDateChange}
          disabled={disabled}
          min={min}
          max={max}
          className="input w-full pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  min?: string;
  max?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Sélectionner une date et heure',
  disabled = false,
  className = '',
  id,
  min,
  max,
}: DateTimePickerProps) {
  const handleDateTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="datetime-local"
          id={id}
          value={value || ''}
          onChange={handleDateTimeChange}
          disabled={disabled}
          min={min}
          max={max}
          className="input w-full pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
