'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import { Intervention } from '@/types';

interface CalendarViewProps {
  interventions: Intervention[];
  onInterventionClick: (intervention: Intervention) => void;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export function CalendarView({ 
  interventions, 
  onInterventionClick, 
  selectedDate, 
  onDateSelect 
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Ajouter les jours du mois précédent pour compléter la première semaine
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getInterventionsForDate = (date: Date) => {
    return interventions.filter(intervention => 
      isSameDay(new Date(intervention.scheduledAtUtc), date)
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header du calendrier */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7">
        {allDays.map((day, dayIdx) => {
          const dayInterventions = getInterventionsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-[120px] p-2 border-r border-b border-gray-200 cursor-pointer
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isToday ? 'bg-blue-50' : ''}
                ${isSelected ? 'bg-blue-100' : ''}
                hover:bg-gray-50 transition-colors
              `}
              onClick={() => onDateSelect?.(day)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`
                  text-sm font-medium
                  ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${isToday ? 'text-blue-600' : ''}
                `}>
                  {format(day, 'd')}
                </span>
                {dayInterventions.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {dayInterventions.length}
                  </span>
                )}
              </div>

              {/* Interventions du jour */}
              <div className="space-y-1">
                {dayInterventions.slice(0, 3).map((intervention) => (
                  <div
                    key={intervention.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onInterventionClick(intervention);
                    }}
                    className={`
                      text-xs p-1 rounded truncate cursor-pointer
                      ${getPriorityColor(intervention.priority)}
                      hover:opacity-80 transition-opacity
                    `}
                    title={intervention.title}
                  >
                    {intervention.title}
                  </div>
                ))}
                {dayInterventions.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayInterventions.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
