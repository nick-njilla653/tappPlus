'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from './input';
import { Button } from './button';
import { Select } from './select';

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterOption[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
  onClearFilters,
  placeholder = 'Rechercher...',
  className = '',
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = Object.values(filterValues).some(value => value !== '');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barre de recherche */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <FunnelIcon className="h-4 w-4" />
          Filtres
          {hasActiveFilters && (
            <span className="bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {Object.values(filterValues).filter(v => v !== '').length}
            </span>
          )}
        </Button>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Filtres</h4>
            {hasActiveFilters && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onClearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                {filter.type === 'select' && filter.options ? (
                  <Select
                    value={filterValues[filter.key] || ''}
                    onValueChange={(value) => onFilterChange(filter.key, value)}
                    placeholder={filter.placeholder}
                    options={filter.options}
                  />
                ) : filter.type === 'date' ? (
                  <Input
                    type="date"
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => onFilterChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder}
                  />
                ) : (
                  <Input
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => onFilterChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
