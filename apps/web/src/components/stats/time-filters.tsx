'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { 
  CalendarIcon,
  ClockIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface TimeFiltersProps {
  onFiltersChange: (filters: TimeFilterData) => void;
  initialFilters?: TimeFilterData;
}

interface TimeFilterData {
  period: '7d' | '30d' | '90d' | '1y' | 'custom';
  startDate?: string;
  endDate?: string;
  compareWith?: 'previous' | 'same_period_last_year' | 'none';
  granularity: 'day' | 'week' | 'month' | 'quarter';
  timezone: string;
}

const defaultFilters: TimeFilterData = {
  period: '30d',
  compareWith: 'previous',
  granularity: 'day',
  timezone: 'Europe/Paris'
};

export function TimeFilters({ onFiltersChange, initialFilters = defaultFilters }: TimeFiltersProps) {
  const [filters, setFilters] = useState<TimeFilterData>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof TimeFilterData, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d': return '7 derniers jours';
      case '30d': return '30 derniers jours';
      case '90d': return '90 derniers jours';
      case '1y': return '1 an';
      case 'custom': return 'Période personnalisée';
      default: return period;
    }
  };

  const getGranularityLabel = (granularity: string) => {
    switch (granularity) {
      case 'day': return 'Jour';
      case 'week': return 'Semaine';
      case 'month': return 'Mois';
      case 'quarter': return 'Trimestre';
      default: return granularity;
    }
  };

  const getCompareLabel = (compare: string) => {
    switch (compare) {
      case 'previous': return 'Période précédente';
      case 'same_period_last_year': return 'Même période l\'année dernière';
      case 'none': return 'Aucune comparaison';
      default: return compare;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filtres temporels
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Simple' : 'Avancé'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtres de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="period">Période</Label>
              <Select
                id="period"
                value={filters.period}
                onValueChange={(value) => handleFilterChange('period', value)}
                options={[
                  { value: '7d', label: '7 derniers jours' },
                  { value: '30d', label: '30 derniers jours' },
                  { value: '90d', label: '90 derniers jours' },
                  { value: '1y', label: '1 an' },
                  { value: 'custom', label: 'Période personnalisée' },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="granularity">Granularité</Label>
              <Select
                id="granularity"
                value={filters.granularity}
                onValueChange={(value) => handleFilterChange('granularity', value)}
                options={[
                  { value: 'day', label: 'Jour' },
                  { value: 'week', label: 'Semaine' },
                  { value: 'month', label: 'Mois' },
                  { value: 'quarter', label: 'Trimestre' },
                ]}
              />
            </div>
          </div>

          {/* Période personnalisée */}
          {filters.period === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Filtres avancés */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900">Options avancées</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="compareWith">Comparaison</Label>
                  <Select
                    id="compareWith"
                    value={filters.compareWith}
                    onValueChange={(value) => handleFilterChange('compareWith', value)}
                    options={[
                      { value: 'none', label: 'Aucune comparaison' },
                      { value: 'previous', label: 'Période précédente' },
                      { value: 'same_period_last_year', label: 'Même période l\'année dernière' },
                    ]}
                  />
                </div>

                <div>
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select
                    id="timezone"
                    value={filters.timezone}
                    onValueChange={(value) => handleFilterChange('timezone', value)}
                    options={[
                      { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
                      { value: 'UTC', label: 'UTC' },
                      { value: 'America/New_York', label: 'America/New_York (EST)' },
                      { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Résumé des filtres actifs */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Filtres actifs</h4>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {getPeriodLabel(filters.period)}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <ClockIcon className="h-3 w-3 mr-1" />
                {getGranularityLabel(filters.granularity)}
              </span>
              {filters.compareWith && filters.compareWith !== 'none' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Comparaison: {getCompareLabel(filters.compareWith)}
                </span>
              )}
              {filters.period === 'custom' && filters.startDate && filters.endDate && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {new Date(filters.startDate!).toLocaleDateString('fr-FR')} - {new Date(filters.endDate!).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
