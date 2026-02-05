/**
 * DatePicker - Sélecteur de date
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
  format?: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
}

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function DatePicker({
  value,
  onChange,
  placeholder = 'Sélectionner une date',
  minDate,
  maxDate,
  disabled = false,
  className = '',
  format = 'dd/MM/yyyy',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer le calendrier quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Formater la date
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'MM/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`;
      default:
        return `${day}/${month}/${year}`;
    }
  };

  // Obtenir les jours du mois
  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: (Date | null)[] = [];
    
    // Jours vides avant le premier jour du mois
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Jours du mois
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Vérifier si une date est sélectionnée
  const isSelected = (date: Date): boolean => {
    if (!value) return false;
    return (
      date.getDate() === value.getDate() &&
      date.getMonth() === value.getMonth() &&
      date.getFullYear() === value.getFullYear()
    );
  };

  // Vérifier si une date est aujourd'hui
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Vérifier si une date est désactivée
  const isDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Navigation
  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Sélection d'une date
  const selectDate = (date: Date) => {
    if (!isDisabled(date)) {
      onChange(date);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-[#ffc200]'}
          ${isOpen ? 'border-[#ffc200] ring-2 ring-[#e6af00]' : 'border-gray-300'}
          dark:bg-gray-800 dark:border-gray-700
        `}
      >
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
          {value ? formatDate(value) : placeholder}
        </span>
      </div>

      {/* Calendrier */}
      {isOpen && (
        <div className="absolute z-50 mt-1 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-semibold text-gray-900 dark:text-white">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Jours */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(viewDate).map((date, index) => (
              <div key={index} className="aspect-square">
                {date ? (
                  <button
                    onClick={() => selectDate(date)}
                    disabled={isDisabled(date)}
                    className={`
                      w-full h-full rounded-lg text-sm font-medium
                      transition-colors
                      ${isSelected(date)
                        ? 'bg-[#ffc200] text-white'
                        : isToday(date)
                          ? 'bg-[#fff3cc] text-[#cc9b00] dark:bg-[#3d3200]/30 dark:text-[#e6af00]'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                      }
                      ${isDisabled(date) ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {date.getDate()}
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                onChange(new Date());
                setIsOpen(false);
              }}
              className="text-sm text-[#cc9b00] hover:text-[#5c4d00] font-medium"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Effacer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;


