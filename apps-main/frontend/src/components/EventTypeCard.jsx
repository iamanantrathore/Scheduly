import { Clock, ExternalLink, Edit2, Trash2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function EventTypeCard({ eventType, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);
  const bookingUrl = `${window.location.origin}/${eventType.slug}`;

  function copyLink() {
    navigator.clipboard.writeText(bookingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      {/* Color bar */}
      <div
        className="w-full h-1 rounded-full mb-4"
        style={{ backgroundColor: eventType.color || '#0069ff' }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg">{eventType.name}</h3>
          {eventType.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{eventType.description}</p>
          )}
          <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
            <Clock size={14} />
            <span>{eventType.duration} minutes</span>
          </div>
        </div>
      </div>

      {/* Booking link */}
      <div className="mt-4 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
        <span className="text-xs text-gray-500 truncate flex-1">/{eventType.slug}</span>
        <button
          onClick={copyLink}
          className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
          title="Copy link"
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
        </button>
        <a
          href={`/${eventType.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
          title="Open booking page"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => onEdit(eventType)}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
        >
          <Edit2 size={14} />
          Edit
        </button>
        <button
          onClick={() => onDelete(eventType)}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 ml-auto"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
}
