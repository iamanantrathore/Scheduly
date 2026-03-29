import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const COLORS = [
  '#0069ff', '#00a2ff', '#7c3aed', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16', '#f97316',
];

const DEFAULT_FORM = {
  name: '',
  duration: 30,
  slug: '',
  description: '',
  color: '#0069ff',
  buffer_before: 0,
  buffer_after: 0,
  custom_questions: [],
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function EventTypeModal({ eventType, onSave, onClose }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventType) {
      setForm({
        name: eventType.name,
        duration: eventType.duration,
        slug: eventType.slug,
        description: eventType.description || '',
        color: eventType.color || '#0069ff',
        buffer_before: eventType.buffer_before || 0,
        buffer_after: eventType.buffer_after || 0,
        custom_questions: eventType.custom_questions ? (typeof eventType.custom_questions === 'string' ? JSON.parse(eventType.custom_questions) : eventType.custom_questions) : [],
      });
      setSlugManuallyEdited(true);
    } else {
      setForm(DEFAULT_FORM);
      setSlugManuallyEdited(false);
    }
  }, [eventType]);

  function handleNameChange(e) {
    const name = e.target.value;
    setForm((f) => ({
      ...f,
      name,
      slug: slugManuallyEdited ? f.slug : slugify(name),
    }));
  }

  function handleSlugChange(e) {
    setSlugManuallyEdited(true);
    setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {eventType ? 'Edit Event Type' : 'New Event Type'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={handleNameChange}
              placeholder="e.g. 30 Minute Meeting"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <select
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))}
              className="input"
            >
              {[15, 20, 30, 45, 60, 90, 120].map((d) => (
                <option key={d} value={d}>{d} minutes</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
              <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-300">
                scheduly.com/
              </span>
              <input
                type="text"
                value={form.slug}
                onChange={handleSlugChange}
                placeholder="30min"
                className="flex-1 px-3 py-2 focus:outline-none text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What is this meeting about?"
              className="input resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Buffer Before (min)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={form.buffer_before}
                onChange={(e) => setForm((f) => ({ ...f, buffer_before: Number(e.target.value) }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Buffer After (min)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={form.buffer_after}
                onChange={(e) => setForm((f) => ({ ...f, buffer_after: Number(e.target.value) }))}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Questions
            </label>
            <div className="space-y-2">
              {form.custom_questions.map((q, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => {
                      const updated = [...form.custom_questions];
                      updated[idx] = e.target.value;
                      setForm((f) => ({ ...f, custom_questions: updated }));
                    }}
                    placeholder="e.g. What is your company?"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => ({
                        ...f,
                        custom_questions: f.custom_questions.filter((_, i) => i !== idx),
                      }));
                    }}
                    className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({
                    ...f,
                    custom_questions: [...f.custom_questions, ''],
                  }));
                }}
                className="text-sm px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors w-full"
              >
                + Add Question
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  style={{ backgroundColor: color, outline: form.color === color ? `3px solid ${color}` : 'none', outlineOffset: '2px' }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : eventType ? 'Save Changes' : 'Create Event Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
