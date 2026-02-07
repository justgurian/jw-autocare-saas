import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { useFavoritesStore } from '../../stores/favorites.store';
import {
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Pin,
  PinOff,
  Search,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import ThemeToggle from '../features/ThemeToggle';
import { useTourStore } from '../../stores/tour.store';
import { allNavItems, navigationGroups } from '../../data/nav-items';

// Navigation data imported from standalone module (avoids circular deps)
// allNavItems and navigationGroups are imported at the top from ../../data/nav-items

const SIDEBAR_GROUPS_KEY = 'bayfiller-sidebar-groups';
const DEFAULT_EXPANDED = ['home', 'flyers'];

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_GROUPS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_EXPANDED;
    } catch {
      return DEFAULT_EXPANDED;
    }
  });

  // Persist expanded groups
  useEffect(() => {
    localStorage.setItem(SIDEBAR_GROUPS_KEY, JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  // Sidebar search
  const [sidebarSearch, setSidebarSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered search results (flat list)
  const searchResults = useMemo(() => {
    if (!sidebarSearch.trim()) return [];
    const query = sidebarSearch.toLowerCase();
    return allNavItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [sidebarSearch]);

  // "New" badge: shows on tools user hasn't visited yet
  const { hasVisitedTool, markToolVisited, addRecentTool } = useTourStore();
  const isNewTool = (href: string) => !hasVisitedTool(href);

  const handleNavClick = (href: string) => {
    setSidebarOpen(false);
    markToolVisited(href);
    addRecentTool(href);
    setSidebarSearch('');
  };

  const handleLogout = async () => {
    await logout();
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const isItemActive = (href: string) => location.pathname === href;
  const isGroupActive = (items: typeof navigationGroups[0]['items']) =>
    items.some((item) => location.pathname === item.href);

  // Resolve favorite items from flat list
  const favoriteItems = favorites
    .map((href) => allNavItems.find((item) => item.href === href))
    .filter(Boolean) as typeof allNavItems;

  return (
    <div className="min-h-screen bg-retro-cream">
      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-retro-navy text-white border border-black shadow-retro rounded-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full bg-retro-navy text-white border-r border-black/20 flex flex-col overflow-hidden">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link to="/dashboard" className="block">
              <img
                src="/bayfiller-logo.png"
                alt="Bayfiller"
                className="w-full max-w-[220px] h-auto mx-auto"
              />
              <p className="font-heading text-white text-base text-center -mt-16 uppercase tracking-wide">We Keep Your Bays Full</p>
            </Link>
          </div>

          {/* Sidebar Search */}
          <div className="px-4 pt-3 pb-1">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Find a tool... (⌘K)"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm pl-9 pr-3 py-2 focus:outline-none focus:border-retro-mustard transition-colors"
              />
              {sidebarSearch && (
                <button
                  onClick={() => setSidebarSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav data-tour="sidebar-nav" className="flex-1 overflow-y-auto py-2">
            {/* Search Results (flat list) */}
            {sidebarSearch.trim() ? (
              <div className="py-1">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={`flex items-center gap-3 px-5 py-2.5 transition-all ${
                        isItemActive(item.href)
                          ? 'bg-retro-red text-white'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <item.icon size={16} className="shrink-0 text-retro-mustard" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm block leading-tight">{item.name}</span>
                        <p className="text-[10px] text-gray-500 leading-tight truncate">{item.description}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-5 py-6 text-center">
                    <p className="text-sm text-gray-400">No tools matching "{sidebarSearch}"</p>
                  </div>
                )}
              </div>
            ) : (
            <>
            {/* Favorites Section */}
            {favoriteItems.length > 0 && (
              <div className="mb-1">
                <div className="px-5 py-2 flex items-center gap-2">
                  <Pin size={14} className="text-retro-mustard" />
                  <span className="font-heading text-xs uppercase tracking-wider text-retro-mustard">
                    Favorites
                  </span>
                </div>
                <div className="py-1">
                  {favoriteItems.map((item) => (
                    <div key={item.href} className="group relative flex items-center">
                      <Link
                        to={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={`flex-1 flex items-center gap-3 px-5 py-2 pl-10 transition-all ${
                          isItemActive(item.href)
                            ? 'bg-retro-red text-white border-l-4 border-retro-mustard'
                            : 'hover:bg-white/10 border-l-4 border-transparent'
                        }`}
                      >
                        <item.icon size={16} />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                      <button
                        onClick={() => removeFavorite(item.href)}
                        className="px-2 py-1 mr-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity"
                        title="Remove from favorites"
                      >
                        <PinOff size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mx-5 border-b border-white/10 mb-1" />
              </div>
            )}

            {/* Navigation Groups */}
            {navigationGroups.map((group) => (
              <div key={group.id} className="mb-0.5">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-5 py-2.5 text-left transition-all ${
                    isGroupActive(group.items) ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <group.icon size={18} className="text-retro-mustard" />
                    <div>
                      <span className="font-heading text-xs uppercase tracking-wide">
                        {group.name}
                      </span>
                      <p className="text-[10px] text-gray-500 font-normal normal-case leading-tight">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  {expandedGroups.includes(group.id) ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </button>

                {/* Group Items */}
                {expandedGroups.includes(group.id) && (
                  <div className="bg-black/20 py-0.5">
                    {group.items.map((item) => (
                      <div key={item.href} className="group relative flex items-center">
                        <Link
                          to={item.href}
                          onClick={() => handleNavClick(item.href)}
                          className={`flex-1 flex items-center gap-3 px-5 py-2 pl-11 transition-all ${
                            isItemActive(item.href)
                              ? 'bg-retro-red text-white border-l-4 border-retro-mustard'
                              : 'hover:bg-white/10 border-l-4 border-transparent'
                          }`}
                        >
                          <item.icon size={16} className="shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="text-sm block leading-tight">{item.name}</span>
                            <p className="text-[10px] text-gray-500 leading-tight truncate">{item.description}</p>
                          </div>
                          {isNewTool(item.href) && (
                            <span className="ml-auto shrink-0 px-1.5 py-0.5 text-[9px] font-bold bg-retro-red text-white rounded-full uppercase">
                              New
                            </span>
                          )}
                        </Link>

                        {/* Pin/unpin button */}
                        <button
                          onClick={() =>
                            isFavorite(item.href)
                              ? removeFavorite(item.href)
                              : addFavorite(item.href)
                          }
                          className={`px-2 py-1 mr-2 transition-opacity shrink-0 ${
                            isFavorite(item.href)
                              ? 'text-retro-mustard opacity-100'
                              : 'text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white'
                          }`}
                          title={isFavorite(item.href) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {isFavorite(item.href) ? <PinOff size={14} /> : <Pin size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            </>
            )}
          </nav>

          {/* User info, theme toggle & logout */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="mb-3">
              <p className="font-heading text-sm truncate">{user?.tenant.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <div className="mb-3">
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-retro-red hover:bg-red-700 transition-colors rounded-lg text-sm font-medium"
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
