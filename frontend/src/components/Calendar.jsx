import { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast,
  addMonths, subMonths, startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar({ selectedDate, onSelectDate, availableDays = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function isDayAvailable(day) {
    if (isPast(startOfDay(day)) && !isToday(day)) return false;
    return availableDays.includes(day.getDay());
  }

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h3>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, currentMonth);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);
          const available = inMonth && isDayAvailable(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => available && onSelectDate(day)}
              disabled={!available}
              className={`
                relative aspect-square flex items-center justify-center text-sm rounded-lg font-medium transition-colors
                ${!inMonth ? 'text-gray-200 cursor-default' : ''}
                ${inMonth && !available ? 'text-gray-300 cursor-not-allowed' : ''}
                ${available && !selected ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer' : ''}
                ${selected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                ${today && !selected ? 'ring-2 ring-blue-200' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
