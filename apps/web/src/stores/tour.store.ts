import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TourStore {
  dashboardTourCompleted: boolean;
  visitedTools: string[];
  completeDashboardTour: () => void;
  markToolVisited: (href: string) => void;
  hasVisitedTool: (href: string) => boolean;
}

export const useTourStore = create<TourStore>()(
  persist(
    (set, get) => ({
      dashboardTourCompleted: false,
      visitedTools: [],
      completeDashboardTour: () => set({ dashboardTourCompleted: true }),
      markToolVisited: (href) => {
        const current = get().visitedTools;
        if (!current.includes(href)) {
          set({ visitedTools: [...current, href] });
        }
      },
      hasVisitedTool: (href) => get().visitedTools.includes(href),
    }),
    { name: 'bayfiller-tour' }
  )
);
