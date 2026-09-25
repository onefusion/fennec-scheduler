'use client';

import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  startOfDay,
  addDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  minNoticeHours?: number;
  maxFutureDays?: number;
}

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  maxFutureDays = 30,
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const today = startOfDay(new Date());
  const maxAllowedDate = addDays(today, maxFutureDays);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-sm">
      {/* Month Header & Navigation */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-100 dark:border-stone-800">
        <h3 className="text-base font-semibold text-stone-800 dark:text-stone-100">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrevMonth}
            disabled={isSameMonth(currentMonth, today) || isBefore(currentMonth, today)}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-400 dark:text-stone-500 mb-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, today);
          const isDisabled =
            isBefore(day, today) || isAfter(day, maxAllowedDate) || !isCurrentMonth;

          return (
            <button
              key={day.toISOString()}
              disabled={isDisabled}
              onClick={() => onSelectDate(day)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all duration-150 relative
                ${
                  isDisabled
                    ? 'text-stone-300 dark:text-stone-700 cursor-not-allowed'
                    : isSelected
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-105 font-bold'
                    : 'text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-400'
                }
              `}
            >
              <span>{format(day, 'd')}</span>
              {isToday && !isSelected && (
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full absolute bottom-1.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
