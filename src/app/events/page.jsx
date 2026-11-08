'use client';

import { useState, useEffect } from 'react';
import {
   ArrowRight,
   Calendar,
   MapPin,
   Clock,
   ExternalLink,
   Trophy,
   Loader2,
} from 'lucide-react';
import { GroupBrainstorming } from '@esvigy/react';
import { createClient } from '@/utils/supabase/client';

const PRO_WHATSAPP_NUMBER = '2348055986730';
const EVENT_SUBMISSION_MSG = encodeURIComponent(
   `Hello P.R.O, I would like to submit a student tech event / study circle for listing on the NACOSS FUOYE Events Board.\n\n` +
   `• Event Title: \n` +
   `• Organizer / Club: \n` +
   `• Date & Time: \n` +
   `• Venue (Physical / Virtual): \n` +
   `• Brief Description: \n` +
   `• Registration Link / Flyer: `
);
const SUBMIT_EVENT_URL = `https://wa.me/${PRO_WHATSAPP_NUMBER}?text=${EVENT_SUBMISSION_MSG}`;

export default function EventsPage() {
   const [activeTab, setActiveTab] = useState('events'); // 'events' | 'hackathons'
   const [events, setEvents] = useState([]);
   const [hackathons, setHackathons] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const supabase = createClient();
      let isMounted = true;

      async function fetchPublishedRecords() {
         try {
            const [eventsRes, hackRes] = await Promise.allSettled([
               supabase
                  .from('events')
                  .select('*')
                  .eq('is_published', true)
                  .order('created_at', { ascending: false }),
               supabase
                  .from('hackathons')
                  .select('*')
                  .eq('is_published', true)
                  .order('created_at', { ascending: false }),
            ]);

            if (isMounted) {
               if (eventsRes.status === 'fulfilled' && eventsRes.value.data) {
                  setEvents(eventsRes.value.data);
               }
               if (hackRes.status === 'fulfilled' && hackRes.value.data) {
                  setHackathons(hackRes.value.data);
               }
            }
         } catch (err) {
            console.error('Error fetching events from Supabase:', err);
         } finally {
            if (isMounted) {
               setLoading(false);
            }
         }
      }

      fetchPublishedRecords();
      return () => { isMounted = false; };
   }, []);

   return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
         {/* Events & Hackathons Hero Section (solid bg-amber-700 with GroupBrainstorming watermark) */}
         <section className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-amber-700 p-6 sm:p-10 md:p-14 mb-10 text-white">
            {/* Background Watermark GroupBrainstorming SVG */}
            <div className="absolute -right-8 -bottom-12 sm:-right-12 sm:-bottom-16 md:-right-16 md:-bottom-20 lg:-right-12 lg:-bottom-16 w-72 h-72 sm:w-96 sm:h-96 md:w-120 md:h-120 lg:w-xl lg:h-144 opacity-20 pointer-events-none select-none">
               <GroupBrainstorming
                  animated={true}
                  color="#ffffff"
                  secondaryColor="rgba(255,255,255,0.2)"
                  className="w-full h-full"
               />
            </div>

            {/* Foreground Details & Call to Action */}
            <div className="relative z-10 max-w-3xl space-y-5 text-center sm:text-left">
               <p className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white/90">
                  Department of Computer Science &bull; FUOYE
               </p>

               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                  Events & <br />
                  <span className="text-white">
                     Hackathon Arena
                  </span>
               </h1>

               <p className="text-amber-100 text-base sm:text-lg leading-relaxed max-w-xl mx-auto sm:mx-0 font-medium">
                  Stay updated with upcoming departmental workshops, technical symposiums, and curated national and international hackathons open for application.
               </p>

               {/* Call to Action Buttons */}
               <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3.5">
                  <button
                     type="button"
                     onClick={() => {
                        setActiveTab('events');
                        document.getElementById('events-board')?.scrollIntoView({ behavior: 'smooth' });
                     }}
                     className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-amber-800 font-bold text-sm shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                     <span>Departmental Events</span>
                     <ArrowRight size={18} />
                  </button>

                  <button
                     type="button"
                     onClick={() => {
                        setActiveTab('hackathons');
                        document.getElementById('events-board')?.scrollIntoView({ behavior: 'smooth' });
                     }}
                     className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/20 backdrop-blur-xs transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                     <Trophy size={16} className="text-white" />
                     <span>Hackathons to Apply For</span>
                  </button>
               </div>
            </div>
         </section>

         {/* Navigation Tabs */}
         <div id="events-board" className="scroll-mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="w-full sm:w-auto p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
               <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5">
                  <button
                     type="button"
                     onClick={() => setActiveTab('events')}
                     className={`w-full sm:w-auto px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.98] ${activeTab === 'events'
                           ? 'bg-amber-700 text-white shadow-xs'
                           : 'text-slate-600 hover:text-amber-800'
                        }`}
                  >
                     <Calendar size={16} className="shrink-0" />
                     <span className="sm:hidden">Events ({events.length})</span>
                     <span className="hidden sm:inline">Upcoming Events ({events.length})</span>
                  </button>

                  <button
                     type="button"
                     onClick={() => setActiveTab('hackathons')}
                     className={`w-full sm:w-auto px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.98] ${activeTab === 'hackathons'
                           ? 'bg-amber-700 text-white shadow-xs'
                           : 'text-slate-600 hover:text-amber-800'
                        }`}
                  >
                     <Trophy size={16} className="shrink-0" />
                     <span className="sm:hidden">Hackathons ({hackathons.length})</span>
                     <span className="hidden sm:inline">Hackathons to Apply For ({hackathons.length})</span>
                  </button>
               </div>
            </div>
         </div>

         {/* Loading Indicator */}
         {loading && (
            <div className="py-20 text-center">
               <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-700" />
               <p className="text-xs text-slate-500 mt-2 font-medium">Loading events and hackathons from Supabase...</p>
            </div>
         )}

         {/* TAB 1: UPCOMING DEPARTMENTAL EVENTS */}
         {!loading && activeTab === 'events' && (
            <div className="space-y-6 mb-16">
               {events.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                     <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     <h3 className="text-base font-bold text-slate-800">No Upcoming Events</h3>
                     <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                        Departmental workshops and symposiums will appear here once scheduled.
                     </p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {events.map((event, idx) => {
                        const badgeColor = event.badge_color || event.badgeColor || 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
                        return (
                           <div
                              key={event.id || idx}
                              className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-amber-300 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-5"
                           >
                              <div className="space-y-3.5">
                                 <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${badgeColor}`}>
                                       {event.type || 'Event'}
                                    </span>

                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                       {event.status || 'Upcoming'}
                                    </span>
                                 </div>

                                 <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                                    {event.title}
                                 </h3>

                                 <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                                    {event.description || event.desc}
                                 </p>
                              </div>

                              {/* Event Details: Date, Time, Venue */}
                              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-semibold text-slate-600">
                                 <div className="flex items-center gap-2 text-slate-800">
                                    <Calendar size={15} className="text-amber-700 shrink-0" />
                                    <span className="font-bold">{event.date}</span>
                                    <span className="text-slate-300">&bull;</span>
                                    <Clock size={14} className="text-slate-400 shrink-0" />
                                    <span>{event.time}</span>
                                 </div>

                                 <div className="flex items-center gap-2 text-slate-600">
                                    <MapPin size={15} className="text-amber-700 shrink-0" />
                                    <span>{event.venue}</span>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}

               {/* Community Event Notice */}
               <div className="p-8 rounded-3xl bg-amber-50/60 border border-amber-200/70 text-center flex flex-col items-center mx-auto space-y-3 mt-8">
                  <Calendar className="w-10 h-10 text-amber-700" />
                  <h4 className="text-lg font-bold text-slate-900">Hosting a Student Tech Event or Study Circle?</h4>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md font-medium">
                     If you are organizing a level revision class, programming workshop, or design tutorial, reach out to the executive council to list it on the calendar.
                  </p>
                  <a
                     href={SUBMIT_EVENT_URL}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all mt-1"
                  >
                     <span>Message P.R.O to List Event</span>
                     <ArrowRight size={14} />
                  </a>
               </div>
            </div>
         )}

         {/* TAB 2: HACKATHONS TO APPLY FOR */}
         {!loading && activeTab === 'hackathons' && (
            <div className="space-y-8 mb-16">
               {hackathons.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                     <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     <h3 className="text-base font-bold text-slate-800">No Open Hackathons</h3>
                     <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                        Curated student competitions and hackathons will appear here once published.
                     </p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {hackathons.map((hack, idx) => {
                     const tagsList = Array.isArray(hack.tags)
                        ? hack.tags
                        : (typeof hack.tags === 'string' && hack.tags ? hack.tags.split(',').map((t) => t.trim()) : []);

                     return (
                        <div
                           key={hack.id || idx}
                           className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-amber-300 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4"
                        >
                           <div className="space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                 <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                                    {hack.organizer}
                                 </span>
                                 <span className="text-[11px] font-semibold text-slate-500">
                                    {hack.mode}
                                 </span>
                              </div>

                              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                                 {hack.title}
                              </h3>

                              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                                 {hack.description || hack.desc}
                              </p>

                              {/* Tags */}
                              {tagsList.length > 0 && (
                                 <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    {tagsList.map((t) => (
                                       <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                          {t}
                                       </span>
                                    ))}
                                 </div>
                              )}
                           </div>

                           <div className="pt-4 border-t border-slate-100 space-y-3">
                              <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                                 <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                                    {hack.prize || 'Prizes & Recognition'}
                                 </span>
                                 <span className="text-slate-500 font-medium">
                                    {hack.deadline}
                                 </span>
                              </div>

                              {(hack.apply_url || hack.applyUrl) && (
                                 <a
                                    href={hack.apply_url || hack.applyUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-98"
                                 >
                                    <span>Apply for Hackathon</span>
                                    <ExternalLink size={14} />
                                 </a>
                              )}
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>
      )}
      </main>
   );
}
