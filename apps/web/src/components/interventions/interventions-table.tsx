'use client';

import { useState } from 'react';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Intervention } from '@/types';

interface InterventionsTableProps {
  interventions: Intervention[];
  onView: (intervention: Intervention) => void;
  onEdit: (intervention: Intervention) => void;
  onDelete: (intervention: Intervention) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

type SortField = 'title' | 'scheduledAtUtc' | 'priority' | 'status' | 'person.fullName';
type SortDirection = 'asc' | 'desc';

export function InterventionsTable({
  interventions,
  onView,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: InterventionsTableProps) {
  const [sortField, setSortField] = useState<SortField>('scheduledAtUtc');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUpIcon className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="h-4 w-4 text-gray-600" /> : 
      <ChevronDownIcon className="h-4 w-4 text-gray-600" />;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'NORMAL':
        return <Badge variant="default">Normal</Badge>;
      case 'LOW':
        return <Badge variant="secondary">Faible</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return <Badge variant="default" className="bg-blue-500 hover:bg-blue-500">Planifiée</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="default" className="bg-purple-500 hover:bg-purple-500">En cours</Badge>;
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-500">Terminée</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Titre</span>
                    {getSortIcon('title')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('person.fullName')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Patient</span>
                    {getSortIcon('person.fullName')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('scheduledAtUtc')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Date</span>
                    {getSortIcon('scheduledAtUtc')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('priority')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Priorité</span>
                    {getSortIcon('priority')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Statut</span>
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lieu
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {interventions.map((intervention) => (
                <tr key={intervention.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {intervention.title}
                    </div>
                    {intervention.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {intervention.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {intervention.person?.fullName || 'Non spécifié'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {format(parseISO(intervention.scheduledAtUtc), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(intervention.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(intervention.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {intervention.location || 'Non spécifié'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onView(intervention)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      {intervention.status !== 'DONE' && intervention.status !== 'CANCELED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onEdit(intervention)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(intervention)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}
