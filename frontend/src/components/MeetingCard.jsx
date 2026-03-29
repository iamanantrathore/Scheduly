import { format, parseISO } from 'date-fns';
import { Calendar, Clock, Mail, Pencil, X } from 'lucide-react';

export default function MeetingCard({ meeting, onEdit, onCancel }) {
  const startDate = parseISO(meeting.start_time);
  const endDate = parseISO(meeting.end_time);
  const isPast = new Date() > startDate;

  return (
    <div className="card p-5 hover:shadow-lg transition-all duration-200 border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
            style={{ backgroundColor: meeting.color || '#0069ff' }}
          >
            {meeting.invitee_name?.trim()?.[0]?.toUpperCase() || 'M'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900">{meeting.invitee_name}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                style={{ backgroundColor: meeting.color || '#0069ff' }}
              >
                {meeting.event_type_name}
              </span>
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={13} className="flex-shrink-0" />
                <span>{meeting.invitee_email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={13} className="flex-shrink-0" />
                <span>{format(startDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={13} className="flex-shrink-0" />
                <span>
                  {format(startDate, 'h:mm a')} – {format(endDate, 'h:mm a')}
                  <span className="text-gray-400 ml-1">({meeting.duration} min)</span>
                </span>
              </div>
            </div>

            {meeting.notes && (
              <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                "{meeting.notes}"
              </p>
            )}
          </div>
        </div>

        {!isPast && (
          <div className="flex-shrink-0 flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(meeting)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
            {onCancel && (
              <button
                onClick={() => onCancel(meeting)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <X size={14} />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
