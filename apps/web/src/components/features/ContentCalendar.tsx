import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { promoFlyerApi, downloadApi } from '../../services/api';
import { Calendar, Download, Share2, RefreshCw, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import ShareModal from './ShareModal';
import FlyerFeedback from './FlyerFeedback';
import RetroLoadingStage from '../garage/RetroLoadingStage';
import { useFileDownload } from '../../hooks/useFileDownload';

interface CalendarFlyer {
  id: string;
  imageUrl: string;
  caption: string;
  title: string;
  theme: string;
  themeName: string;
  status: string;
}

interface DayPlan {
  dayIndex: number;
  themeId: string;
  themeName: string;
  familyId: string;
  familyName: string;
  emoji: string;
  previewImage?: string;
}

type DayStatus = 'pending' | 'generating' | 'done' | 'error';

interface DayState {
  plan: DayPlan;
  status: DayStatus;
  flyer: CalendarFlyer | null;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ContentCalendar() {
  const [dayStates, setDayStates] = useState<DayState[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareFlyer, setShareFlyer] = useState<CalendarFlyer | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const download = useFileDownload();

  const completedCount = dayStates.filter(d => d.status === 'done').length;
  const totalCount = dayStates.length;

  // Generate a single day's flyer
  const generateDay = useCallback(async (dayIndex: number, themeId: string): Promise<CalendarFlyer | null> => {
    try {
      const res = await promoFlyerApi.instantThemed(themeId);
      const flyer: CalendarFlyer = {
        id: res.data.id,
        imageUrl: res.data.imageUrl,
        caption: res.data.caption,
        title: res.data.title,
        theme: res.data.theme,
        themeName: res.data.themeName,
        status: res.data.status,
      };
      return flyer;
    } catch {
      return null;
    }
  }, []);

  // Main generation flow: fetch plan, then generate all 7 progressively
  const generateWeek = useCallback(async () => {
    setIsGenerating(true);
    setSelectedDay(null);

    try {
      // Step 1: Get the week plan (instant - just theme selections)
      const planRes = await promoFlyerApi.getWeekPlan();
      const days: DayPlan[] = planRes.data.days;

      // Step 2: Initialize day states with plans (shows skeleton grid immediately)
      const initialStates: DayState[] = days.map(plan => ({
        plan,
        status: 'generating' as DayStatus,
        flyer: null,
      }));
      setDayStates(initialStates);

      // Step 3: Fire all 7 generation requests in parallel
      const promises = days.map(async (day) => {
        const flyer = await generateDay(day.dayIndex, day.themeId);

        // Update this specific day's state as soon as it completes
        setDayStates(prev => prev.map((state, idx) =>
          idx === day.dayIndex
            ? { ...state, status: flyer ? 'done' : 'error', flyer }
            : state
        ));

        // Auto-select first completed day
        if (day.dayIndex === 0 && flyer) {
          setSelectedDay(0);
        }

        return flyer;
      });

      await Promise.allSettled(promises);
      toast.success('Your week of content is ready!');
    } catch {
      toast.error('Failed to generate week plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [generateDay]);

  // Regenerate a single day
  const regenerateDay = useCallback(async (dayIndex: number) => {
    const dayState = dayStates[dayIndex];
    if (!dayState) return;

    setDayStates(prev => prev.map((state, idx) =>
      idx === dayIndex ? { ...state, status: 'generating', flyer: null } : state
    ));

    const flyer = await generateDay(dayIndex, dayState.plan.themeId);
    setDayStates(prev => prev.map((state, idx) =>
      idx === dayIndex ? { ...state, status: flyer ? 'done' : 'error', flyer } : state
    ));

    if (flyer) {
      toast.success(`${DAYS[dayIndex]}'s flyer refreshed!`);
    }
  }, [dayStates, generateDay]);

  const handleDownloadAll = async () => {
    const completedFlyers = dayStates.filter(d => d.flyer).map(d => d.flyer!);
    for (const flyer of completedFlyers) {
      await download(flyer.id, flyer.title || `day-${dayStates.indexOf(dayStates.find(d => d.flyer === flyer)!) + 1}`);
    }
    toast.success('All downloads started!');
  };

  const handleShare = (flyer: CalendarFlyer) => {
    setShareFlyer(flyer);
    setShowShareModal(true);
  };

  const selectedState = selectedDay !== null ? dayStates[selectedDay] : null;
  const selectedFlyer = selectedState?.flyer || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-heading text-2xl uppercase flex items-center justify-center gap-2">
          <Calendar size={24} />
          Content Calendar
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Generate a full week of unique flyers with one click
        </p>
      </div>

      {/* Empty state */}
      {dayStates.length === 0 && !isGenerating && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-retro-navy/10 rounded-full mb-4">
            <Calendar size={36} className="text-retro-navy" />
          </div>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Generate 7 unique flyers — one for each day of the week.
            Smart rotation ensures each day has a different style.
          </p>
          <button
            onClick={generateWeek}
            className="btn-retro-primary text-lg px-8 py-4 flex items-center justify-center gap-3 mx-auto"
          >
            <Calendar size={22} />
            Generate My Week
          </button>
        </div>
      )}

      {/* Loading state with progress (shown when no days have completed yet) */}
      {isGenerating && completedCount === 0 && dayStates.length === 0 && (
        <RetroLoadingStage
          isLoading={true}
          estimatedDuration={5000}
          size="md"
          showExhaust={true}
          phaseMessages={{
            0: ['Planning your week...', 'Consulting the calendar...'],
            1: ['Picking the perfect themes...', 'Matching styles to days...'],
            2: ['Almost ready to create...', 'Setting up the design stations...'],
            3: ['Ready to roll!', 'Here we go...'],
          }}
        />
      )}

      {/* Calendar Grid - shows immediately once plan is received */}
      {dayStates.length > 0 && (
        <>
          {/* Progress indicator during generation */}
          {isGenerating && completedCount < totalCount && (
            <RetroLoadingStage
              isLoading={true}
              estimatedDuration={25000}
              size="sm"
              showExhaust={false}
              progress={{ completed: completedCount, total: totalCount }}
              phaseMessages={{
                0: ['Firing up the batch press...', 'Loading the design templates...'],
                1: ['Each flyer gets its own style...', 'Your AI team is hard at work...'],
                2: ['Mixing unique color palettes...', 'Adding your brand\'s signature touch...'],
                3: ['Final quality checks...', 'Almost there — just a few more...'],
              }}
            />
          )}

          {/* Day selector strip */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {dayStates.map((dayState, index) => (
              <button
                key={index}
                onClick={() => dayState.flyer && setSelectedDay(index)}
                disabled={!dayState.flyer}
                className={`
                  flex flex-col items-center p-2 md:p-3 border-2 transition-all relative
                  ${selectedDay === index
                    ? 'border-retro-teal bg-retro-teal/10 shadow-retro-sm'
                    : dayState.flyer
                    ? 'border-gray-200 hover:border-gray-400 cursor-pointer'
                    : 'border-gray-100 cursor-default'
                  }
                `}
              >
                <span className="text-xs font-heading uppercase text-gray-500">
                  {SHORT_DAYS[index]}
                </span>

                {/* Thumbnail area */}
                <div className="w-full aspect-square mt-1 overflow-hidden border border-gray-200 relative">
                  {dayState.status === 'done' && dayState.flyer ? (
                    <>
                      <img
                        src={dayState.flyer.imageUrl}
                        alt={dayState.flyer.title}
                        className="w-full h-full object-cover animate-reveal-wipe"
                      />
                      {/* Done checkmark */}
                      <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    </>
                  ) : dayState.status === 'generating' ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center gap-1">
                      <div className="w-5 h-5 border-2 border-retro-teal border-t-transparent rounded-full animate-spin" />
                      <span className="text-[8px] text-gray-400">{dayState.plan.emoji}</span>
                    </div>
                  ) : dayState.status === 'error' ? (
                    <div className="w-full h-full bg-red-50 flex items-center justify-center">
                      <span className="text-xs text-red-400">retry</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-50" />
                  )}
                </div>

                <span className="text-[10px] text-gray-400 mt-1 truncate w-full text-center">
                  {dayState.plan.familyName}
                </span>
              </button>
            ))}
          </div>

          {/* Selected day detail */}
          {selectedFlyer && selectedDay !== null && (
            <div className="card-retro animate-fade-in">
              {/* Day header with nav */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    // Find previous day with a completed flyer
                    for (let i = selectedDay - 1; i >= 0; i--) {
                      if (dayStates[i]?.flyer) { setSelectedDay(i); return; }
                    }
                  }}
                  disabled={!dayStates.slice(0, selectedDay).some(d => d.flyer)}
                  className="p-2 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                  <p className="font-heading text-lg uppercase">{DAYS[selectedDay]}</p>
                  <p className="text-xs text-gray-500">{selectedFlyer.themeName}</p>
                </div>
                <button
                  onClick={() => {
                    // Find next day with a completed flyer
                    for (let i = selectedDay + 1; i < dayStates.length; i++) {
                      if (dayStates[i]?.flyer) { setSelectedDay(i); return; }
                    }
                  }}
                  disabled={!dayStates.slice(selectedDay + 1).some(d => d.flyer)}
                  className="p-2 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Flyer preview */}
              <div className="aspect-[4/5] bg-gray-100 border-2 border-black shadow-retro overflow-hidden mb-4">
                <img
                  src={selectedFlyer.imageUrl}
                  alt={selectedFlyer.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Caption */}
              <div className="bg-gray-50 p-3 border border-gray-200 mb-4">
                <p className="text-sm text-gray-700">{selectedFlyer.caption}</p>
              </div>

              {/* Feedback */}
              <FlyerFeedback contentId={selectedFlyer.id} />

              {/* Actions */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <button
                  onClick={() => download(selectedFlyer.id, selectedFlyer.title || `day-${selectedDay + 1}`)}
                  className="btn-retro-primary flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={() => handleShare(selectedFlyer)}
                  className="btn-retro-outline flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  Share
                </button>
                <button
                  onClick={() => regenerateDay(selectedDay)}
                  disabled={dayStates[selectedDay]?.status === 'generating'}
                  className="btn-retro-outline flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} className={dayStates[selectedDay]?.status === 'generating' ? 'animate-spin' : ''} />
                  Redo
                </button>
              </div>
            </div>
          )}

          {/* Bulk actions */}
          {completedCount > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleDownloadAll}
                className="flex-1 btn-retro-primary flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download All {completedCount}
              </button>
              <button
                onClick={() => {
                  setDayStates([]);
                  setSelectedDay(null);
                  generateWeek();
                }}
                disabled={isGenerating}
                className="btn-retro-outline flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                New Week
              </button>
            </div>
          )}
        </>
      )}

      {/* Share Modal */}
      {shareFlyer && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setShareFlyer(null);
          }}
          content={{
            id: shareFlyer.id,
            title: shareFlyer.title,
            imageUrl: shareFlyer.imageUrl,
            caption: shareFlyer.caption,
          }}
        />
      )}
    </div>
  );
}
