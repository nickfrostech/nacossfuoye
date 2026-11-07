'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
   Search,
   SlidersHorizontal,
   X,
   ChevronDown,
   RotateCcw
} from 'lucide-react';
import { Announcement } from '@esvigy/react';
import MemoCard from '@/components/MemoCard';
import PageHeader from '@/components/PageHeader';

function Loading() {
   return (
      <div className="flex justify-center items-center h-64">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
   );
}

const CATEGORIES = [
   { id: 'all', label: 'All Memos' },
   { id: 'executive', label: 'Executive' },
   { id: 'src', label: 'SRC' },
   { id: 'elecom', label: 'Electoral Committee' },
   { id: 'president', label: 'President' },
];

export default function MemosList() {
   const [fetchError, setFetchError] = useState(null);
   const [data, setData] = useState(null);
   const [order, setOrder] = useState(false);
   const [loading, setLoading] = useState(true);
   const [filterType, setFilterType] = useState('all');
   const [searchQuery, setSearchQuery] = useState('');
   const [isFilterOpen, setIsFilterOpen] = useState(false);

   const filterRef = useRef(null);
   const supabase = createClient();

   // Click outside and Escape key handler for Filter dropdown
   useEffect(() => {
      const handleClickOutside = (event) => {
         if (filterRef.current && !filterRef.current.contains(event.target)) {
            setIsFilterOpen(false);
         }
      };

      const handleKeyDown = (event) => {
         if (event.key === 'Escape') {
            setIsFilterOpen(false);
         }
      };

      if (isFilterOpen) {
         document.addEventListener('mousedown', handleClickOutside);
         document.addEventListener('keydown', handleKeyDown);
      }

      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
         document.removeEventListener('keydown', handleKeyDown);
      };
   }, [isFilterOpen]);

   useEffect(() => {
      let isMounted = true;
      const fetchData = async () => {
         const { data: fetchedData, error } = await supabase
            .from('memo')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: order });

         if (!isMounted) return;

         if (error) {
            setFetchError('Could not fetch memos');
            setData(null);
         } else {
            setData(fetchedData);
            setFetchError(null);
         }
      };

      fetchData();
      const timer = setTimeout(() => {
         if (isMounted) setLoading(false);
      }, 800);

      const channel = supabase
         .channel('memo-changes')
         .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'memo' },
            () => {
               if (isMounted) fetchData();
            }
         )
         .subscribe();

      return () => {
         isMounted = false;
         clearTimeout(timer);
         supabase.removeChannel(channel);
      };
   }, [order, supabase]);

   // Calculate active filters count (excluding default state: 'all' category and Newest order)
   const activeFilterCount = (filterType !== 'all' ? 1 : 0) + (order ? 1 : 0);

   const handleResetFilters = () => {
      setFilterType('all');
      setOrder(false);
      setSearchQuery('');
   };

   // Filter memos by category and search query
   const filteredData = data
      ? data.filter((item) => {
         // Category filter
         const matchesCategory = filterType === 'all' || item.type === filterType;
         if (!matchesCategory) return false;

         // Search query filter
         if (!searchQuery.trim()) return true;
         const q = searchQuery.toLowerCase().trim();
         const headMatch = item.head?.toLowerCase().includes(q);
         const refMatch = item.reference?.toLowerCase().includes(q);
         const contentMatch = typeof item.content === 'string' && item.content.toLowerCase().includes(q);
         const typeMatch = item.type?.toLowerCase().includes(q);
         const postMatch = item.post?.toLowerCase().includes(q);

         return headMatch || refMatch || contentMatch || typeMatch || postMatch;
      })
      : [];

   return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
         {/* Page Header: Title on Left, Search & Filter beside on Desktop, breaks below on Mobile */}
         <PageHeader
            title="Official Memos"
            description="View the latest updates and announcements."
         >
            {/* Search & Filter Toolbar beside the title */}
            <div className="flex items-center gap-2 w-full md:w-auto">
               {/* Search Bar */}
               <div className="relative flex-1 md:w-64 lg:w-72 flex items-center">
                  <div className="relative flex-1">
                     <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        size={15}
                     />
                     <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search memos..."
                        aria-label="Search memos"
                        className="w-full pl-8.5 pr-7 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
                     />
                     {searchQuery && (
                        <button
                           type="button"
                           onClick={() => setSearchQuery('')}
                           className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                           aria-label="Clear search"
                        >
                           <X size={13} />
                        </button>
                     )}
                  </div>

                  <button
                     type="button"
                     className="ml-1.5 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs transition-colors shrink-0 active:scale-95"
                  >
                     <Search size={14} />
                     <span className="hidden sm:inline">Search</span>
                  </button>
               </div>

               {/* Filter Dropdown (like "Do Something" dropdown in header) */}
               <div className="relative" ref={filterRef}>
                  <button
                     type="button"
                     onClick={() => setIsFilterOpen((prev) => !prev)}
                     aria-expanded={isFilterOpen}
                     aria-haspopup="true"
                     className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs border transition-all shrink-0 active:scale-95 ${isFilterOpen || activeFilterCount > 0
                           ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                           : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                        }`}
                  >
                     <SlidersHorizontal size={14} />
                     <span>Filter</span>
                     {activeFilterCount > 0 && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">
                           {activeFilterCount}
                        </span>
                     )}
                     <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}
                     />
                  </button>

                  {/* Floating Dropdown Menu Over All Elements (Does not shift content) */}
                  <div
                     role="menu"
                     aria-hidden={!isFilterOpen}
                     className={`absolute top-full right-0 mt-2.5 w-72 sm:w-80 p-4 bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-200/90 shadow-2xl z-50 origin-top-right transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${isFilterOpen
                           ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible'
                           : 'opacity-0 scale-95 -translate-y-2 pointer-events-none invisible'
                        }`}
                  >
                     <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                           Filter & Sort
                        </span>
                        {(activeFilterCount > 0 || searchQuery) && (
                           <button
                              type="button"
                              onClick={handleResetFilters}
                              className="text-[11px] font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                           >
                              <RotateCcw size={11} />
                              <span>Reset</span>
                           </button>
                        )}
                     </div>

                     <div className="space-y-3">
                        {/* Category Selection */}
                        <div>
                           <label htmlFor="dropdown-category" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                              Category
                           </label>
                           <div className="relative">
                              <select
                                 id="dropdown-category"
                                 value={filterType}
                                 onChange={(e) => setFilterType(e.target.value)}
                                 className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer pr-8"
                              >
                                 {CATEGORIES.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                       {cat.label}
                                    </option>
                                 ))}
                              </select>
                              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                           </div>
                        </div>

                        {/* Sort Order */}
                        <div>
                           <label htmlFor="dropdown-sort" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                              Sort Order
                           </label>
                           <div className="relative">
                              <select
                                 id="dropdown-sort"
                                 value={order ? "true" : "false"}
                                 onChange={(e) => setOrder(e.target.value === "true")}
                                 className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer pr-8"
                              >
                                 <option value="false">Newest First</option>
                                 <option value="true">Oldest First</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                           </div>
                        </div>
                     </div>

                     {/* Done / Close Button */}
                     <button
                        type="button"
                        onClick={() => setIsFilterOpen(false)}
                        className="w-full mt-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors text-center shadow-xs"
                     >
                        Done
                     </button>
                  </div>
               </div>
            </div>
         </PageHeader>

         {/* Active Filter Badges */}
         {(activeFilterCount > 0 || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
               <span className="text-slate-400 font-medium">Active filters:</span>
               {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                     <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                     <button
                        onClick={() => setSearchQuery('')}
                        className="hover:text-red-500 ml-0.5 p-0.5"
                        aria-label="Remove search filter"
                     >
                        <X size={12} />
                     </button>
                  </span>
               )}
               {filterType !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                     <span>Category: {CATEGORIES.find(c => c.id === filterType)?.label || filterType}</span>
                     <button
                        onClick={() => setFilterType('all')}
                        className="hover:text-red-500 ml-0.5 p-0.5"
                        aria-label="Remove category filter"
                     >
                        <X size={12} />
                     </button>
                  </span>
               )}
               {order && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                     <span>Sort: Oldest First</span>
                     <button
                        onClick={() => setOrder(false)}
                        className="hover:text-red-500 ml-0.5 p-0.5"
                        aria-label="Remove sort filter"
                     >
                        <X size={12} />
                     </button>
                  </span>
               )}
               <button
                  onClick={handleResetFilters}
                  className="text-xs text-slate-500 hover:text-red-600 font-semibold underline underline-offset-2 ml-1"
               >
                  Clear all
               </button>
            </div>
         )}

         {/* Content Area */}
         {loading ? (
            <Loading />
         ) : fetchError ? (
            <div className="rounded-xl bg-red-50 p-6 border border-red-100">
               <h3 className="text-sm font-medium text-red-800">{fetchError}</h3>
            </div>
         ) : filteredData && filteredData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredData.map(item => (
                  <MemoCard
                     key={item.id}
                     {...item}
                     isAdminView={false}
                     href={item.authStatus ? `/admin/edit/${encodeURIComponent(item.reference)}` : `/${encodeURIComponent(item.reference)}`}
                  />
               ))}
            </div>
         ) : (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
               <Announcement
                  animated={true}
                  color="#039133"
                  secondaryColor="rgba(3,145,51,0.08)"
                  className="w-36 h-36 mb-4 filter drop-shadow-sm"
               />
               <h3 className="text-xl font-bold text-slate-800 mb-1">No Memos Found</h3>
               <p className="text-slate-500 font-medium max-w-sm text-sm mb-6">
                  {searchQuery
                     ? `No memos matching "${searchQuery}"${filterType !== 'all' ? ` under "${filterType}"` : ''}.`
                     : `There are currently no official memos published under the "${filterType}" category.`}
               </p>
               {(activeFilterCount > 0 || searchQuery) && (
                  <button
                     onClick={handleResetFilters}
                     className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
                  >
                     Reset All Filters
                  </button>
               )}
            </div>
         )}
      </main>
   );
}
