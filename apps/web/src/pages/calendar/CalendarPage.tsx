import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarApi } from '../../services/api';
import {
  ChevronLeft,
  ChevronRight,
  Wand2,
  Download,
  X,
  Calendar,
  Palette,
  Tag,
  Trash2,
  Check,
  Edit3,
  Sparkles,
  Image,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const BEAT_COLORS: Record<string, string> = {
  promo: 'bg-retro-red',
  educational: 'bg-retro-teal',
  engagement: 'bg-retro-mustard',
  seasonal: 'bg-retro-navy',
  community: 'bg-retro-mint',
};

const BEAT_LABELS: Record<string, string> = {
  promo: 'Promotional',
  educational: 'Educational',
  engagement: 'Engagement',
  seasonal: 'Seasonal',
  community: 'Community',
};

const THEME_LABELS: Record<string, string> = {
  'retro-garage': 'Retro Garage',
  'arizona-desert': 'Arizona Desert',
  'neon-nights': 'Neon Nights',
  'classic-mechanic': 'Classic Mechanic',
  'pop-culture-80s': '80s Pop Culture',
  'modern-minimal': 'Modern Minimal',
  'sports-car': 'Sports Car',
  'family-friendly': 'Family Friendly',
};

interface CalendarEvent {
  id: string;
  scheduledDate: string;
  beatType: string;
  suggestedTopic: string;
  suggestedTheme: string;
  status: string;
  notes?: string;
  content?: {
    id: string;
    title: string;
    imageUrl: string;
    thumbnailUrl: string;
    status: string;
  };
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  // Fetch events
  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-events', month, year],
    queryFn: () => calendarApi.getEvents({ month, year }).then(res => res.data),
  });

  // Generate ideas mutation
  const generateMutation = useMutation({
    mutationFn: () => calendarApi.generate({ month, year, count: 20 }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events', month, year] });
      const personalized = res.data?.profilePersonalized;
      toast.success(
        personalized
          ? 'Personalized content ideas generated!'
          : 'Content ideas generated! Add profile info for better results.'
      );
    },
    onError: () => {
      toast.error('Failed to generate ideas');
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => calendarApi.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events', month, year] });
      setSelectedEvent(null);
      toast.success('Event deleted');
    },
    onError: () => {
      toast.error('Failed to delete event');
    },
  });

  // Update event mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      calendarApi.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events', month, year] });
      toast.success('Event updated');
    },
    onError: () => {
      toast.error('Failed to update event');
    },
  });

  // Export calendar
  const handleExport = async (format: 'ical' | 'pdf') => {
    try {
      if (format === 'ical') {
        const response = await calendarApi.exportCalendar('ical', { month, year });
        const blob = new Blob([response.data], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marketing-calendar-${year}-${month}.ics`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Calendar exported!');
      } else {
        toast('PDF export coming soon!');
      }
    } catch {
      toast.error('Failed to export calendar');
    }
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
    setSelectedDay(null);
  };

  // Get event for a specific day
  const getEventsForDay = (day: number): CalendarEvent[] => {
    if (!events) return [];
    return events.filter((event: CalendarEvent) => {
      const eventDate = new Date(event.scheduledDate);
      return eventDate.getDate() === day;
    });
  };

  // Check if day is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() + 1 === month &&
      today.getFullYear() === year
    );
  };

  // Get seasonal tie from notes
  const getSeasonalTie = (event: CalendarEvent) => {
    if (event.notes?.startsWith('Seasonal tie:')) {
      return event.notes.replace('Seasonal tie:', '').trim();
    }
    return null;
  };

  // Total events count
  const totalEvents = events?.length || 0;
  const scheduledEvents = events?.filter((e: CalendarEvent) => e.status === 'scheduled').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="heading-retro">Marketing Calendar</h1>
          <p className="text-gray-600 mt-2">
            {totalEvents > 0
              ? `${totalEvents} ideas planned, ${scheduledEvents} scheduled`
              : 'Generate AI-powered content ideas for your shop'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="btn-retro-primary flex items-center gap-2"
          >
            <Wand2 size={18} />
            {generateMutation.isPending ? 'Generating...' : 'Generate Ideas'}
          </button>
          <div className="relative group">
            <button className="btn-retro-outline flex items-center gap-2">
              <Download size={18} />
              Export
            </button>
            <div className="absolute right-0 mt-1 w-40 bg-white border-2 border-black shadow-retro hidden group-hover:block z-10">
              <button
                onClick={() => handleExport('ical')}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
              >
                iCal (.ics)
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
              >
                PDF (coming soon)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card-retro">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-display text-3xl">
            {MONTHS[month - 1]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-200">
          {Object.entries(BEAT_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-4 h-4 ${color} border border-black`} />
              <span className="text-sm capitalize">{type}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {DAYS.map((day) => (
            <div key={day} className="p-2 text-center font-heading text-sm bg-retro-navy text-white">
              {day}
            </div>
          ))}

          {/* Empty cells for days before first of month */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2 bg-gray-50 min-h-[120px]" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const isSelected = selectedDay === day;

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`p-2 border-2 min-h-[120px] cursor-pointer transition-all ${
                  isToday(day)
                    ? 'border-retro-red bg-retro-red/5'
                    : isSelected
                    ? 'border-retro-navy bg-retro-navy/5'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className={`font-heading text-sm mb-1 ${isToday(day) ? 'text-retro-red' : ''}`}>
                  {day}
                  {isToday(day) && <span className="text-xs ml-1">(Today)</span>}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      className={`w-full text-left text-xs p-1.5 ${
                        BEAT_COLORS[event.beatType] || 'bg-gray-300'
                      } text-white truncate rounded-sm hover:opacity-90 transition-opacity ${
                        event.status === 'scheduled' ? 'ring-2 ring-green-400' : ''
                      }`}
                      title={event.suggestedTopic}
                    >
                      {event.suggestedTopic?.substring(0, 25)}
                      {(event.suggestedTopic?.length || 0) > 25 ? '...' : ''}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {!isLoading && totalEvents === 0 && (
        <div className="card-retro text-center py-12">
          <Sparkles size={48} className="mx-auto mb-4 text-retro-mustard" />
          <h3 className="font-heading text-xl uppercase mb-2">No Content Ideas Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Click "Generate Ideas" to create AI-powered content suggestions personalized to your
            business profile and seasonal events.
          </p>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="btn-retro-primary inline-flex items-center gap-2"
          >
            <Wand2 size={18} />
            {generateMutation.isPending ? 'Generating...' : 'Generate Ideas'}
          </button>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black shadow-retro-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-4 border-b-2 border-black bg-gray-50">
              <div className="flex-1">
                <span
                  className={`inline-block px-2 py-0.5 text-xs text-white ${
                    BEAT_COLORS[selectedEvent.beatType]
                  } mb-2`}
                >
                  {BEAT_LABELS[selectedEvent.beatType] || selectedEvent.beatType}
                </span>
                <h3 className="font-heading text-lg uppercase">{selectedEvent.suggestedTopic}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Date */}
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-500" />
                <span>
                  {new Date(selectedEvent.scheduledDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Theme */}
              {selectedEvent.suggestedTheme && (
                <div className="flex items-center gap-3">
                  <Palette size={18} className="text-gray-500" />
                  <span>
                    Suggested Theme: {THEME_LABELS[selectedEvent.suggestedTheme] || selectedEvent.suggestedTheme}
                  </span>
                </div>
              )}

              {/* Seasonal Tie */}
              {getSeasonalTie(selectedEvent) && (
                <div className="flex items-center gap-3">
                  <Tag size={18} className="text-gray-500" />
                  <span className="text-retro-navy">
                    Tied to: {getSeasonalTie(selectedEvent)}
                  </span>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-sm border-2 border-black ${
                    selectedEvent.status === 'scheduled'
                      ? 'bg-green-100 text-green-800'
                      : selectedEvent.status === 'completed'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {selectedEvent.status === 'suggested'
                    ? 'Suggested'
                    : selectedEvent.status === 'scheduled'
                    ? 'Scheduled'
                    : 'Completed'}
                </span>
              </div>

              {/* Content Preview if linked */}
              {selectedEvent.content && (
                <div className="border-2 border-gray-200 p-3 rounded">
                  <p className="text-sm text-gray-500 mb-2">Linked Content:</p>
                  {selectedEvent.content.imageUrl && (
                    <img
                      src={selectedEvent.content.thumbnailUrl || selectedEvent.content.imageUrl}
                      alt={selectedEvent.content.title}
                      className="w-full h-32 object-cover border border-gray-200 mb-2"
                    />
                  )}
                  <p className="font-medium">{selectedEvent.content.title}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t-2 border-black bg-gray-50 flex flex-wrap gap-2">
              {selectedEvent.status === 'suggested' && (
                <button
                  onClick={() => {
                    updateMutation.mutate({
                      id: selectedEvent.id,
                      data: { status: 'scheduled' },
                    });
                    setSelectedEvent({ ...selectedEvent, status: 'scheduled' });
                  }}
                  className="btn-retro-primary flex items-center gap-2 text-sm"
                >
                  <Check size={16} />
                  Schedule
                </button>
              )}

              {!selectedEvent.content && (
                <Link
                  to={`/tools/promo-flyer?topic=${encodeURIComponent(selectedEvent.suggestedTopic)}&theme=${selectedEvent.suggestedTheme}`}
                  className="btn-retro-secondary flex items-center gap-2 text-sm"
                >
                  <Image size={16} />
                  Create Content
                </Link>
              )}

              <button
                onClick={() => deleteMutation.mutate(selectedEvent.id)}
                disabled={deleteMutation.isPending}
                className="btn-retro-outline flex items-center gap-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day Events Sidebar */}
      {selectedDay && (
        <div className="card-retro">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg uppercase">
              {MONTHS[month - 1]} {selectedDay}
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-1 hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {getEventsForDay(selectedDay).length === 0 ? (
              <p className="text-gray-500 text-sm">No events scheduled for this day.</p>
            ) : (
              getEventsForDay(selectedDay).map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full text-left p-3 border-2 border-gray-200 hover:border-black transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-3 h-3 mt-1 ${BEAT_COLORS[event.beatType]} border border-black flex-shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.suggestedTopic}</p>
                      <p className="text-sm text-gray-500 capitalize">{event.beatType}</p>
                    </div>
                    {event.status === 'scheduled' && (
                      <Check size={16} className="text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
