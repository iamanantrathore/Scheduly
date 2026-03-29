import { format, parse } from 'date-fns';

export default function TimeSlots({ slots, selectedSlot, onSelectSlot, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">No available slots for this date.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {slots.map((slot) => {
        const time = parse(slot, 'HH:mm', new Date());
        const label = format(time, 'h:mm a');
        const isSelected = selectedSlot === slot;

        return (
          <button
            key={slot}
            onClick={() => onSelectSlot(slot)}
            className={`
              py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors
              ${isSelected
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-400'
              }
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
