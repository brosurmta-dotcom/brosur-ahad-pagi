'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, ChevronRight, ChevronDown, Menu, X, Loader2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [brosurList, setBrosurList] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});

  const activeSlug = pathname.replace(/^\//, '').split('?')[0];
  const activeBrosur = brosurList.find(b => b.slug === activeSlug);

  // Hide sidebar on specific routes
  const isHideSidebarRoute = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/dashboard');

  // Initialize expanded years when list loads or changes
  useEffect(() => {
    if (brosurList.length > 0 && Object.keys(expandedYears).length === 0 && !searchQuery) {
      if (activeBrosur) {
        setExpandedYears({ [activeBrosur.tahun]: true });
      } else {
        const latestYear = Math.max(...brosurList.map(b => b.tahun));
        setExpandedYears({ [latestYear]: true });
      }
    } else if (searchQuery) {
      // auto-expand all when searching
      const all: Record<string, boolean> = {};
      brosurList.forEach(b => { all[b.tahun] = true; });
      setExpandedYears(all);
    }
  }, [brosurList, searchQuery]);

  const toggleYear = (year: string) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  // Expand active year if user navigates directly or clicks a link
  useEffect(() => {
    if (activeBrosur && !expandedYears[activeBrosur.tahun] && !searchQuery) {
      setExpandedYears(prev => ({ ...prev, [activeBrosur.tahun]: true }));
    }
  }, [activeBrosur, searchQuery]);

  // Scroll active item into view
  useEffect(() => {
    if (activeSlug && isSidebarOpen) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`link-${activeSlug}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350); // wait for accordion animation
      return () => clearTimeout(timer);
    }
  }, [activeSlug, isSidebarOpen, expandedYears]);

  // Fetch when searchQuery changes (triggered by Enter/Submit)
  useEffect(() => {
    const performSearch = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setBrosurList(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };
    performSearch();
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue);
  };

  // Auto-reset search when input is completely cleared
  useEffect(() => {
    if (inputValue === '') {
      setSearchQuery('');
    }
  }, [inputValue]);

  // Group by year
  const groupedByYear = brosurList.reduce((acc, b) => {
    if (!acc[b.tahun]) acc[b.tahun] = [];
    acc[b.tahun].push(b);
    return acc;
  }, {} as Record<number, any[]>);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  if (isHideSidebarRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 overflow-hidden transition-colors duration-300">
      {/* Mobile & Hidden Desktop Sidebar Overlay */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-6 left-6 z-50 p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm hidden md:flex items-center gap-2 font-medium"
          title="Buka Sidebar"
        >
          <PanelLeftOpen size={20} />
        </button>
      )}

      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed bottom-6 right-6 z-50 p-4 rounded-full bg-accent text-white shadow-xl"
        >
          <Menu />
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-full md:w-[320px] h-full glass border-r border-black/5 dark:border-white/5 flex flex-col absolute md:relative z-40 bg-[#fafafa] dark:bg-[#0a0a0a]"
          >
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
              <Link href="/">
                <h1 className="font-bold text-xl tracking-tight flex items-center gap-2">
                  <BookOpen className="text-accent shrink-0" />
                  <span className="truncate">Brosur Ahad Pagi</span>
                </h1>
                <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Digital Archive</p>
              </Link>
              <div className="flex items-center gap-2">
                <button 
                  className="hidden md:flex p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500" 
                  onClick={() => setIsSidebarOpen(false)}
                  title="Sembunyikan Sidebar"
                >
                  <PanelLeftClose size={18} />
                </button>
                <button className="md:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5" onClick={() => setIsSidebarOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-black/5 dark:border-white/5">
              <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
                <div className="relative flex-1">
                  {isSearching ? (
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-accent animate-spin" size={16} />
                  ) : (
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  )}
                  <input 
                    type="text"
                    placeholder="Cari kata atau tema..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-accent text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-accent/80 transition-colors"
                >
                  Cari
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {Object.entries(groupedByYear).sort(([a], [b]) => Number(b) - Number(a)).map(([year, brosurs]) => {
                const isExpanded = !!expandedYears[year];
                return (
                  <div key={year} className="space-y-1">
                    <button 
                      onClick={() => toggleYear(year)}
                      className="w-full flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest py-2 px-1 hover:text-accent transition-colors"
                    >
                      Tahun {year}
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-1"
                        >
                          {(brosurs as any[]).map((b: any) => (
                            <Link
                              key={b.id}
                              id={`link-${b.slug}`}
                              href={`/${b.slug}${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
                              className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 flex flex-col group relative ${
                                activeSlug === b.slug 
                                  ? 'bg-transparent text-accent font-semibold' 
                                  : 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={`text-sm line-clamp-2 pr-4 ${activeSlug === b.slug ? 'font-bold text-accent' : 'font-medium'}`}>{b.judul}</span>
                                {activeSlug === b.slug && <ChevronRight size={16} className="shrink-0 text-accent" />}
                              </div>
                              {b.snippet && (
                                <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${activeSlug === b.slug ? 'text-zinc-700 dark:text-zinc-300 font-medium' : 'text-zinc-500'}`}>
                                  {/* Bold the searched text in snippet (naive rendering for simple highlight in sidebar) */}
                                  <span dangerouslySetInnerHTML={{ 
                                    __html: b.snippet.replace(new RegExp(searchQuery, 'gi'), (match: string) => `<strong>${match}</strong>`)
                                  }} />
                                </p>
                              )}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              
              {!isSearching && brosurList.length === 0 && (
                <div className="text-center text-zinc-500 text-sm mt-10">
                  Tidak ada hasil ditemukan.
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-white dark:bg-[#0f0f0f]">
        {children}
      </main>
    </div>
  );
}
