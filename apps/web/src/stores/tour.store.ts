import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TourStore {
  dashboardTourCompleted: boolean;
  visitedTools: string[];
  recentTools: string[];
  completeDashboardTour: () => void;
  markToolVisited: (href: string) => void;
  hasVisitedTool: (href: string) => boolean;
  addRecentTool: (href: string) => void;
}

export const useTourStore = create<TourStore>()(
  persist(
    (set, get) => ({
      dashboardTourCompleted: false,
      visitedTools: [],
      recentTools: [],
      completeDashboardTour: () => set({ dashboardTourCompleted: true }),
      markToolVisited: (href) => {
        const current = get().visitedTools;
        if (!current.includes(href)) {
          set({ visitedTools: [...current, href] });
        }
      },
      hasVisitedTool: (href) => get().visitedTools.includes(href),
      addRecentTool: (href) => {
        const current = (get().recentTools || []).filter((h) => h !== href);
        set({ recentTools: [href, ...current].slice(0, 5) });
      },
    }),
    { name: 'bayfiller-tour' }
  )
);
