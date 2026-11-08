'use client';

import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import {
   Calendar,
   Trophy,
   Plus,
   Edit3,
   Trash2,
   Eye,
   EyeOff,
   CheckCircle2,
   AlertCircle,
   X,
   ExternalLink,
   MapPin,
   Clock,
   Tag,
   ArrowLeft,
   Loader2,
   Star,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminEventsManager() {
   const [userRole, setUserRole] = useState(null);
   const [loadingRole, setLoadingRole] = useState(true);
   const [activeTab, setActiveTab] = useState('events'); // 'events' | 'hackathons'
   
   // Data states
   const [events, setEvents] = useState([]);
   const [hackathons, setHackathons] = useState([]);
   const [loadingData, setLoadingData] = useState(true);
   const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

   // Modal states
   const [isEventModalOpen, setIsEventModalOpen] = useState(false);
   const [isHackathonModalOpen, setIsHackathonModalOpen] = useState(false);
   const [editingItem, setEditingItem] = useState(null);
   const [isSaving, setIsSaving] = useState(false);

   // Event form state
   const [eventForm, setEventForm] = useState({
      title: '',
      description: '',
      date: '',
      time: '',
      venue: '',
      type: 'Event',
      status: 'Upcoming',
      badge_color: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
      is_published: true,
   });

   // Hackathon form state
   const [hackathonForm, setHackathonForm] = useState({
      title: '',
      organizer: '',
      description: '',
      deadline: '',
      prize: '',
      mode: 'Physical (on campus)',
      tags: '',
      apply_url: '',
      featured: false,
      is_published: true,
   });

   const supabase = createClient();

   // Show temporary status message
   const notify = (type, text) => {
      setStatusMessage({ type, text });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
   };

   // Load role
   useEffect(() => {
      async function getRole() {
         try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
               const { data } = await supabase
                  .from('user_roles')
                  .select('role')
                  .eq('user_email', user.email)
                  .single();
               setUserRole(data?.role || null);
            }
         } catch (err) {
            console.error('Error fetching role:', err);
         } finally {
            setLoadingRole(false);
         }
      }
      getRole();
   }, [supabase]);

   // Fetch data
   const fetchData = useCallback(async () => {
      setLoadingData(true);
      try {
         const [eventsRes, hackRes] = await Promise.all([
            supabase.from('events').select('*').order('created_at', { ascending: false }),
            supabase.from('hackathons').select('*').order('created_at', { ascending: false }),
         ]);

         if (eventsRes.data) setEvents(eventsRes.data);
         if (hackRes.data) setHackathons(hackRes.data);
      } catch (err) {
         console.error('Error loading events data:', err);
      } finally {
         setLoadingData(false);
      }
   }, [supabase]);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   const canManage = Boolean(userRole && !['src', 'elecom'].includes(userRole));

   if (loadingRole) {
      return (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
         </div>
      );
   }

   if (!canManage) {
      return (
         <div className="max-w-md mx-auto text-center py-16 space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
            <p className="text-sm text-slate-600">
               Only Executive Council members and Administrators can manage events and hackathons.
            </p>
            <Link
               href="/admin/dashboard"
               className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-sm"
            >
               <ArrowLeft size={16} /> Return to Dashboard
            </Link>
         </div>
      );
   }

   // --- EVENT HANDLERS ---
   const openCreateEvent = () => {
      setEditingItem(null);
      setEventForm({
         title: '',
         description: '',
         date: '',
         time: '',
         venue: '',
         type: 'Event',
         status: 'Upcoming',
         badge_color: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
         is_published: true,
      });
      setIsEventModalOpen(true);
   };

   const openEditEvent = (event) => {
      setEditingItem(event);
      setEventForm({
         title: event.title || '',
         description: event.description || event.desc || '',
         date: event.date || '',
         time: event.time || '',
         venue: event.venue || '',
         type: event.type || 'Event',
         status: event.status || 'Upcoming',
         badge_color: event.badge_color || 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
         is_published: event.is_published ?? true,
      });
      setIsEventModalOpen(true);
   };

   const handleSaveEvent = async (e) => {
      e.preventDefault();
      setIsSaving(true);
      try {
         const { data: { user } } = await supabase.auth.getUser();
         const payload = { ...eventForm, created_by: user?.email };

         if (editingItem) {
            const { error } = await supabase.from('events').update(payload).eq('id', editingItem.id);
            if (error) throw error;
            notify('success', 'Event updated successfully!');
         } else {
            const { error } = await supabase.from('events').insert([payload]);
            if (error) throw error;
            notify('success', 'Event published successfully!');
         }
         setIsEventModalOpen(false);
         fetchData();
      } catch (err) {
         console.error('Save event error:', err);
         notify('error', err.message || 'Failed to save event');
      } finally {
         setIsSaving(false);
      }
   };

   const handleDeleteEvent = async (id, title) => {
      if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
      try {
         const { error } = await supabase.from('events').delete().eq('id', id);
         if (error) throw error;
         notify('success', 'Event deleted.');
         fetchData();
      } catch (err) {
         notify('error', err.message || 'Failed to delete event');
      }
   };

   const handleToggleEventPublish = async (event) => {
      try {
         const { error } = await supabase
            .from('events')
            .update({ is_published: !event.is_published })
            .eq('id', event.id);
         if (error) throw error;
         fetchData();
      } catch {
         notify('error', 'Failed to toggle status');
      }
   };

   // --- HACKATHON HANDLERS ---
   const openCreateHackathon = () => {
      setEditingItem(null);
      setHackathonForm({
         title: '',
         organizer: '',
         description: '',
         deadline: '',
         prize: '',
         mode: 'Physical (on campus)',
         tags: '',
         apply_url: '',
         featured: false,
         is_published: true,
      });
      setIsHackathonModalOpen(true);
   };

   const openEditHackathon = (hack) => {
      setEditingItem(hack);
      setHackathonForm({
         title: hack.title || '',
         organizer: hack.organizer || '',
         description: hack.description || hack.desc || '',
         deadline: hack.deadline || '',
         prize: hack.prize || '',
         mode: hack.mode || 'Physical (on campus)',
         tags: Array.isArray(hack.tags) ? hack.tags.join(', ') : '',
         apply_url: hack.apply_url || '',
         featured: Boolean(hack.featured),
         is_published: hack.is_published ?? true,
      });
      setIsHackathonModalOpen(true);
   };

   const handleSaveHackathon = async (e) => {
      e.preventDefault();
      setIsSaving(true);
      try {
         const { data: { user } } = await supabase.auth.getUser();
         const tagsArray = hackathonForm.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

         const payload = {
            ...hackathonForm,
            tags: tagsArray,
            created_by: user?.email,
         };

         if (editingItem) {
            const { error } = await supabase.from('hackathons').update(payload).eq('id', editingItem.id);
            if (error) throw error;
            notify('success', 'Hackathon updated successfully!');
         } else {
            const { error } = await supabase.from('hackathons').insert([payload]);
            if (error) throw error;
            notify('success', 'Hackathon created successfully!');
         }
         setIsHackathonModalOpen(false);
         fetchData();
      } catch (err) {
         console.error('Save hackathon error:', err);
         notify('error', err.message || 'Failed to save hackathon');
      } finally {
         setIsSaving(false);
      }
   };

   const handleDeleteHackathon = async (id, title) => {
      if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
      try {
         const { error } = await supabase.from('hackathons').delete().eq('id', id);
         if (error) throw error;
         notify('success', 'Hackathon deleted.');
         fetchData();
      } catch (err) {
         notify('error', err.message || 'Failed to delete hackathon');
      }
   };

   const handleToggleHackathonPublish = async (hack) => {
      try {
         const { error } = await supabase
            .from('hackathons')
            .update({ is_published: !hack.is_published })
            .eq('id', hack.id);
         if (error) throw error;
         fetchData();
      } catch {
         notify('error', 'Failed to toggle status');
      }
   };

   const handleToggleHackathonFeatured = async (hack) => {
      try {
         const { error } = await supabase
            .from('hackathons')
            .update({ featured: !hack.featured })
            .eq('id', hack.id);
         if (error) throw error;
         fetchData();
      } catch {
         notify('error', 'Failed to toggle featured');
      }
   };

   return (
      <div className="animate-in fade-in duration-300 space-y-6 pb-16">
         <PageHeader
            title="Events &amp; Hackathon Arena"
            description="Publish and manage departmental workshops, symposiums, and curated hackathons."
         >
            <button
               type="button"
               onClick={activeTab === 'events' ? openCreateEvent : openCreateHackathon}
               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
            >
               <Plus size={16} />
               <span>{activeTab === 'events' ? 'Add Event' : 'Add Hackathon'}</span>
            </button>
         </PageHeader>

         {/* Status Alert Banner */}
         {statusMessage.text && (
            <div
               className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in duration-300 ${
                  statusMessage.type === 'success'
                     ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                     : 'bg-rose-50 text-rose-800 border border-rose-200'
               }`}
            >
               {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
               <span>{statusMessage.text}</span>
            </div>
         )}

         {/* Navigation Tabs */}
         <div className="flex border-b border-slate-200 gap-6">
            <button
               type="button"
               onClick={() => setActiveTab('events')}
               className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'events'
                     ? 'border-amber-700 text-amber-800'
                     : 'border-transparent text-slate-500 hover:text-slate-900'
               }`}
            >
               <Calendar size={16} />
               <span>Departmental Events ({events.length})</span>
            </button>

            <button
               type="button"
               onClick={() => setActiveTab('hackathons')}
               className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'hackathons'
                     ? 'border-amber-700 text-amber-800'
                     : 'border-transparent text-slate-500 hover:text-slate-900'
               }`}
            >
               <Trophy size={16} />
               <span>Hackathons ({hackathons.length})</span>
            </button>
         </div>

         {/* Loading skeleton */}
         {loadingData && (
            <div className="py-16 text-center">
               <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-700" />
               <p className="text-xs text-slate-500 mt-2 font-medium">Loading records from Supabase...</p>
            </div>
         )}

         {/* TAB 1: EVENTS LIST */}
         {!loadingData && activeTab === 'events' && (
            <div className="space-y-4">
               {events.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                     <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     <h3 className="text-base font-bold text-slate-800">No events found</h3>
                     <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                        Add your first departmental workshop, symposium, or orientation event.
                     </p>
                     <button
                        type="button"
                        onClick={openCreateEvent}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 text-white font-bold text-xs"
                     >
                        <Plus size={14} /> Add Event
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                     {events.map((event) => (
                        <div
                           key={event.id}
                           className={`p-6 rounded-3xl bg-white border transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                              event.is_published ? 'border-slate-200 hover:border-amber-300' : 'border-slate-200 opacity-60 bg-slate-50'
                           }`}
                        >
                           <div className="space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                 <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                                    {event.type}
                                 </span>
                                 <div className="flex items-center gap-1.5">
                                    <span
                                       className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          event.is_published
                                             ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                             : 'bg-slate-200 text-slate-600'
                                       }`}
                                    >
                                       {event.is_published ? 'Live' : 'Draft'}
                                    </span>
                                 </div>
                              </div>

                              <h3 className="text-base font-bold text-slate-900 leading-snug">{event.title}</h3>
                              <p className="text-xs text-slate-600 line-clamp-3">{event.description || event.desc}</p>

                              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1.5 font-medium">
                                 <div className="flex items-center gap-1.5 text-slate-800">
                                    <Clock size={13} className="text-amber-700 shrink-0" />
                                    <span>{event.date} &bull; {event.time}</span>
                                 </div>
                                 <div className="flex items-center gap-1.5 text-slate-600">
                                    <MapPin size={13} className="text-amber-700 shrink-0" />
                                    <span>{event.venue}</span>
                                 </div>
                              </div>
                           </div>

                           {/* Card Actions */}
                           <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                              <button
                                 type="button"
                                 onClick={() => handleToggleEventPublish(event)}
                                 className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                                 title={event.is_published ? 'Unpublish' : 'Publish'}
                              >
                                 {event.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                                 <span>{event.is_published ? 'Hide' : 'Show'}</span>
                              </button>

                              <div className="flex items-center gap-1">
                                 <button
                                    type="button"
                                    onClick={() => openEditEvent(event)}
                                    className="p-2 rounded-xl text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                                    title="Edit"
                                 >
                                    <Edit3 size={15} />
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => handleDeleteEvent(event.id, event.title)}
                                    className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Delete"
                                 >
                                    <Trash2 size={15} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )}

         {/* TAB 2: HACKATHONS LIST */}
         {!loadingData && activeTab === 'hackathons' && (
            <div className="space-y-4">
               {hackathons.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                     <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     <h3 className="text-base font-bold text-slate-800">No hackathons listed yet</h3>
                     <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                        Curate campus, national, or international hackathons for students to compete in.
                     </p>
                     <button
                        type="button"
                        onClick={openCreateHackathon}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 text-white font-bold text-xs"
                     >
                        <Plus size={14} /> Add Hackathon
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                     {hackathons.map((hack) => (
                        <div
                           key={hack.id}
                           className={`p-6 rounded-3xl bg-white border transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                              hack.is_published ? 'border-slate-200 hover:border-amber-300' : 'border-slate-200 opacity-60 bg-slate-50'
                           }`}
                        >
                           <div className="space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                 <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                    {hack.organizer}
                                 </span>
                                 <div className="flex items-center gap-1">
                                    {hack.featured && (
                                       <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                          ★ Featured
                                       </span>
                                    )}
                                    <span
                                       className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          hack.is_published
                                             ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                             : 'bg-slate-200 text-slate-600'
                                       }`}
                                    >
                                       {hack.is_published ? 'Live' : 'Draft'}
                                    </span>
                                 </div>
                              </div>

                              <h3 className="text-base font-bold text-slate-900 leading-snug">{hack.title}</h3>
                              <p className="text-xs text-slate-600 line-clamp-3">{hack.description || hack.desc}</p>

                              {Array.isArray(hack.tags) && hack.tags.length > 0 && (
                                 <div className="flex flex-wrap items-center gap-1 pt-1">
                                    {hack.tags.map((t) => (
                                       <span key={t} className="text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                          {t}
                                       </span>
                                    ))}
                                 </div>
                              )}

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                                 <span className="font-bold text-emerald-700">{hack.prize || 'Prizes'}</span>
                                 <span className="text-slate-400">{hack.deadline}</span>
                              </div>
                           </div>

                           {/* Card Actions */}
                           <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                 <button
                                    type="button"
                                    onClick={() => handleToggleHackathonFeatured(hack)}
                                    className={`text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                                       hack.featured ? 'text-amber-700' : 'text-slate-400 hover:text-slate-700'
                                    }`}
                                    title="Toggle Featured"
                                 >
                                    <Star size={13} className={hack.featured ? 'fill-amber-600' : ''} />
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => handleToggleHackathonPublish(hack)}
                                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                                 >
                                    {hack.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                                    <span>{hack.is_published ? 'Hide' : 'Show'}</span>
                                 </button>
                              </div>

                              <div className="flex items-center gap-1">
                                 {hack.apply_url && (
                                    <a
                                       href={hack.apply_url}
                                       target="_blank"
                                       rel="noreferrer"
                                       className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                       title="Open Application URL"
                                    >
                                       <ExternalLink size={14} />
                                    </a>
                                 )}
                                 <button
                                    type="button"
                                    onClick={() => openEditHackathon(hack)}
                                    className="p-2 rounded-xl text-slate-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                                    title="Edit"
                                 >
                                    <Edit3 size={15} />
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => handleDeleteHackathon(hack.id, hack.title)}
                                    className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                    title="Delete"
                                 >
                                    <Trash2 size={15} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )}

         {/* EVENT CREATE/EDIT MODAL */}
         {isEventModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
               <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                     <h3 className="text-lg font-bold text-slate-900">
                        {editingItem ? 'Edit Event' : 'Add Departmental Event'}
                     </h3>
                     <button
                        type="button"
                        onClick={() => setIsEventModalOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                     >
                        <X size={18} />
                     </button>
                  </div>

                  <form onSubmit={handleSaveEvent} className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Title *</label>
                        <input
                           type="text"
                           required
                           value={eventForm.title}
                           onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                           placeholder="e.g. Git, GitHub &amp; Open Source Sprint"
                           className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description *</label>
                        <textarea
                           rows={3}
                           required
                           value={eventForm.description}
                           onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                           placeholder="Brief summary of what students will learn..."
                           className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                        />
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date *</label>
                           <input
                              type="text"
                              required
                              value={eventForm.date}
                              onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                              placeholder="e.g. NOV 28, 2026"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time *</label>
                           <input
                              type="text"
                              required
                              value={eventForm.time}
                              onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                              placeholder="e.g. 10:00 AM - 1:00 PM"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Venue *</label>
                           <input
                              type="text"
                              required
                              value={eventForm.venue}
                              onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                              placeholder="e.g. Lab 1 or Virtual (Google Meet)"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Type / Category</label>
                           <input
                              type="text"
                              value={eventForm.type}
                              onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                              placeholder="e.g. Hands-on Bootcamp, Symposium"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                           />
                        </div>
                     </div>

                     <div className="flex items-center gap-2 pt-2">
                        <input
                           type="checkbox"
                           id="is_published_event"
                           checked={eventForm.is_published}
                           onChange={(e) => setEventForm({ ...eventForm, is_published: e.target.checked })}
                           className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                        />
                        <label htmlFor="is_published_event" className="text-xs font-semibold text-slate-700 cursor-pointer">
                           Publish immediately to NACOSS Portal
                        </label>
                     </div>

                     <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                           type="button"
                           onClick={() => setIsEventModalOpen(false)}
                           className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           disabled={isSaving}
                           className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                        >
                           {isSaving && <Loader2 size={13} className="animate-spin" />}
                           <span>{editingItem ? 'Save Changes' : 'Publish Event'}</span>
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* HACKATHON CREATE/EDIT MODAL */}
         {isHackathonModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
               <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                     <h3 className="text-lg font-bold text-slate-900">
                        {editingItem ? 'Edit Hackathon' : 'Curate New Hackathon'}
                     </h3>
                     <button
                        type="button"
                        onClick={() => setIsHackathonModalOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                     >
                        <X size={18} />
                     </button>
                  </div>

                  <form onSubmit={handleSaveHackathon} className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hackathon Title *</label>
                           <input
                              type="text"
                              required
                              value={hackathonForm.title}
                              onChange={(e) => setHackathonForm({ ...hackathonForm, title: e.target.value })}
                              placeholder="e.g. Busha Build Challenge"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Organizer *</label>
                           <input
                              type="text"
                              required
                              value={hackathonForm.organizer}
                              onChange={(e) => setHackathonForm({ ...hackathonForm, organizer: e.target.value })}
                              placeholder="e.g. Busha or GDG FUOYE"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description *</label>
                        <textarea
                           rows={3}
                           required
                           value={hackathonForm.description}
                           onChange={(e) => setHackathonForm({ ...hackathonForm, description: e.target.value })}
                           placeholder="What is the challenge, theme, and who can participate..."
                           className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                        />
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Deadline / Date *</label>
                           <input
                              type="text"
                              required
                              value={hackathonForm.deadline}
                              onChange={(e) => setHackathonForm({ ...hackathonForm, deadline: e.target.value })}
                              placeholder="e.g. Apply by Oct 30, 2026"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prizes / Bounties</label>
                           <input
                              type="text"
                              value={hackathonForm.prize}
                              onChange={(e) => setHackathonForm({ ...hackathonForm, prize: e.target.value })}
                              placeholder="e.g. 2,250,000 NGN or Swag"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mode (Physical / Online)</label>
                           <input
                              type="text"
                              value={hackathonForm.mode}
                              onChange={(e) => setHackathonForm({ ...hackathonForm, mode: e.target.value })}
                              placeholder="e.g. Physical (on campus)"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tags (Comma-separated)</label>
                           <input
                              type="text"
                              value={hackathonForm.tags}
                              onChange={(e) => setHackathonForm({ ...hackathonForm, tags: e.target.value })}
                              placeholder="e.g. Web3, Fintech, Mobile"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Application / Registration URL *</label>
                        <input
                           type="url"
                           required
                           value={hackathonForm.apply_url}
                           onChange={(e) => setHackathonForm({ ...hackathonForm, apply_url: e.target.value })}
                           placeholder="https://..."
                           className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                        />
                     </div>

                     <div className="flex flex-wrap items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                           <input
                              type="checkbox"
                              checked={hackathonForm.featured}
                              onChange={(e) => setHackathonForm({ ...hackathonForm, featured: e.target.checked })}
                              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                           />
                           <span>Feature this Hackathon</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                           <input
                              type="checkbox"
                              checked={hackathonForm.is_published}
                              onChange={(e) => setHackathonForm({ ...hackathonForm, is_published: e.target.checked })}
                              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                           />
                           <span>Publish immediately</span>
                        </label>
                     </div>

                     <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                           type="button"
                           onClick={() => setIsHackathonModalOpen(false)}
                           className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           disabled={isSaving}
                           className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                        >
                           {isSaving && <Loader2 size={13} className="animate-spin" />}
                           <span>{editingItem ? 'Save Changes' : 'Publish Hackathon'}</span>
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
