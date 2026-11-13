'use client';

import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import {
   Calendar,
   Plus,
   Edit3,
   Trash2,
   X,
   Loader2,
   BookOpen,
   Users,
   Filter,
   RotateCcw,
   Building2,
   CheckCircle2,
   AlertCircle,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const EXECUTIVE_OFFICES = [
   'President',
   'Vice President',
   'General Secretary',
   'Assistant General Secretary',
   'Financial Secretary',
   'Treasurer',
   'Public Relations Officer (PRO)',
   'Director of Socials',
   'Director of Sports',
   'Welfare Director',
   'Academic Committee',
   'Technical Committee',
   'Joint Executive Council',
];

const JOURNAL_CATEGORIES = [
   'Tutorial',
   'Workshop',
   'Hackathon',
   'Seminar',
   'Sports',
   'Social',
   'Welfare',
   'Meeting',
   'Outreach',
   'General',
];

const SEMESTERS = ['First Semester', 'Second Semester', 'Annual'];

const getJournalCategoryBadge = (cat) => {
   switch (cat) {
      case 'Tutorial':
         return 'bg-blue-50 text-blue-800 border-blue-200/70';
      case 'Workshop':
         return 'bg-violet-50 text-violet-800 border-violet-200/70';
      case 'Hackathon':
         return 'bg-amber-50 text-amber-800 border-amber-200/70';
      case 'Seminar':
         return 'bg-emerald-50 text-emerald-800 border-emerald-200/70';
      case 'Sports':
         return 'bg-rose-50 text-rose-800 border-rose-200/70';
      case 'Social':
         return 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200/70';
      case 'Welfare':
         return 'bg-cyan-50 text-cyan-800 border-cyan-200/70';
      case 'Meeting':
         return 'bg-slate-100 text-slate-800 border-slate-200/70';
      case 'Outreach':
         return 'bg-teal-50 text-teal-800 border-teal-200/70';
      default:
         return 'bg-slate-50 text-slate-700 border-slate-200';
   }
};

const getItemOffices = (item) => {
   if (Array.isArray(item?.offices) && item.offices.length > 0) return item.offices;
   if (typeof item?.office === 'string' && item.office) return [item.office];
   return ['General Secretary'];
};

export default function AdminJournalPage() {
   const [journal, setJournal] = useState([]);
   const [loading, setLoading] = useState(true);
   const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

   // Modal & form states
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingItem, setEditingItem] = useState(null);
   const [isSaving, setIsSaving] = useState(false);

   const [form, setForm] = useState({
      title: '',
      category: 'Tutorial',
      offices: ['General Secretary'],
      date: new Date().toISOString().split('T')[0],
      attendance: '',
      semester: 'First Semester',
      details: '',
   });

   // Filters
   const [filterOffice, setFilterOffice] = useState('all');
   const [filterCategory, setFilterCategory] = useState('all');
   const [filterSemester, setFilterSemester] = useState('all');

   const supabase = createClient();

   const notify = (type, text) => {
      setStatusMessage({ type, text });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
   };

   const fetchJournal = useCallback(async () => {
      setLoading(true);
      try {
         const { data, error } = await supabase
            .from('event_journal')
            .select('*')
            .order('date', { ascending: false });

         if (error) {
            console.warn('Could not load event_journal table:', error.message);
         } else if (data) {
            setJournal(data);
         }
      } catch (err) {
         console.error('Fetch journal error:', err);
      } finally {
         setLoading(false);
      }
   }, [supabase]);

   useEffect(() => {
      fetchJournal();
   }, [fetchJournal]);

   const openCreateModal = () => {
      setEditingItem(null);
      setForm({
         title: '',
         category: 'Tutorial',
         offices: ['General Secretary'],
         date: new Date().toISOString().split('T')[0],
         attendance: '',
         semester: 'First Semester',
         details: '',
      });
      setIsModalOpen(true);
   };

   const openEditModal = (item) => {
      setEditingItem(item);
      setForm({
         title: item.title || '',
         category: item.category || 'Tutorial',
         offices: getItemOffices(item),
         date: item.date || '',
         attendance: item.attendance != null ? String(item.attendance) : '',
         semester: item.semester || 'First Semester',
         details: item.details || '',
      });
      setIsModalOpen(true);
   };

   const handleSave = async (e) => {
      e.preventDefault();
      if (!form.offices || form.offices.length === 0) {
         notify('error', 'Please select at least one organizing office.');
         return;
      }
      setIsSaving(true);
      try {
         const {
            data: { user },
         } = await supabase.auth.getUser();

         const payload = {
            title: form.title.trim(),
            category: form.category,
            offices: form.offices,
            office: form.offices[0],
            date: form.date,
            attendance: form.attendance ? parseInt(form.attendance, 10) : 0,
            semester: form.semester,
            details: form.details.trim(),
            created_by: user?.email || 'admin',
         };

         if (editingItem) {
            const { error } = await supabase
               .from('event_journal')
               .update(payload)
               .eq('id', editingItem.id);
            if (error) throw error;
            notify('success', 'Journal entry updated successfully.');
         } else {
            const { error } = await supabase.from('event_journal').insert([payload]);
            if (error) throw error;
            notify('success', 'Journal entry recorded successfully.');
         }

         setIsModalOpen(false);
         fetchJournal();
      } catch (err) {
         console.error('Save journal error:', err);
         notify('error', err.message || 'Failed to save journal record');
      } finally {
         setIsSaving(false);
      }
   };

   const handleDelete = async (id, title) => {
      if (!confirm(`Are you sure you want to delete "${title}" from the journal?`)) return;
      try {
         const { error } = await supabase.from('event_journal').delete().eq('id', id);
         if (error) throw error;
         notify('success', 'Journal entry deleted.');
         fetchJournal();
      } catch (err) {
         notify('error', err.message || 'Failed to delete journal entry');
      }
   };

   const filteredJournal = journal.filter((item) => {
      const itemOffices = getItemOffices(item);
      const matchOffice = filterOffice === 'all' || itemOffices.includes(filterOffice);
      const matchCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchSemester = filterSemester === 'all' || item.semester === filterSemester;
      return matchOffice && matchCategory && matchSemester;
   });

   const totalAttendance = filteredJournal.reduce(
      (sum, item) => sum + (parseInt(item.attendance, 10) || 0),
      0
   );
   const uniqueOfficesCount = new Set(journal.flatMap((item) => getItemOffices(item))).size;

   return (
      <div className="animate-in fade-in duration-300 space-y-6 pb-16">
         <PageHeader
            title="Activity Journal"
            description="Log, track, and review all departmental workshops, tutorials, seminars, and events conducted during this tenure."
         >
            <button
               type="button"
               onClick={openCreateModal}
               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
            >
               <Plus size={16} />
               <span>Record Activity</span>
            </button>
         </PageHeader>

         {/* Notification banner */}
         {statusMessage.text && (
            <div
               className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold border transition-all ${
                  statusMessage.type === 'success'
                     ? 'bg-emerald-50 text-emerald-900 border-emerald-200/80'
                     : 'bg-rose-50 text-rose-900 border-rose-200/80'
               }`}
            >
               {statusMessage.type === 'success' ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
               ) : (
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
               )}
               <span>{statusMessage.text}</span>
            </div>
         )}

         {/* Metrics Overview Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200/60">
                  <BookOpen size={22} />
               </div>
               <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                     Activities Recorded
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                     {filteredJournal.length}{' '}
                     <span className="text-xs font-normal text-slate-400">/ {journal.length} total</span>
                  </p>
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
                  <Users size={22} />
               </div>
               <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                     Total Turnout / Reach
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                     {totalAttendance.toLocaleString()}{' '}
                     <span className="text-xs font-normal text-slate-400">attendees</span>
                  </p>
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/60">
                  <Building2 size={22} />
               </div>
               <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                     Active Offices
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                     {uniqueOfficesCount}{' '}
                     <span className="text-xs font-normal text-slate-400">
                        / {EXECUTIVE_OFFICES.length}
                     </span>
                  </p>
               </div>
            </div>
         </div>

         {/* Filters Bar */}
         <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
               <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
                  <Filter size={14} />
                  <span>Filter:</span>
               </div>

               {/* Filter by Office */}
               <select
                  value={filterOffice}
                  onChange={(e) => setFilterOffice(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-600 transition-colors cursor-pointer"
               >
                  <option value="all">All Offices</option>
                  {EXECUTIVE_OFFICES.map((off) => (
                     <option key={off} value={off}>
                        {off}
                     </option>
                  ))}
               </select>

               {/* Filter by Category */}
               <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-600 transition-colors cursor-pointer"
               >
                  <option value="all">All Categories</option>
                  {JOURNAL_CATEGORIES.map((cat) => (
                     <option key={cat} value={cat}>
                        {cat}
                     </option>
                  ))}
               </select>

               {/* Filter by Semester */}
               <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-600 transition-colors cursor-pointer"
               >
                  <option value="all">All Semesters</option>
                  {SEMESTERS.map((sem) => (
                     <option key={sem} value={sem}>
                        {sem}
                     </option>
                  ))}
               </select>

               {(filterOffice !== 'all' ||
                  filterCategory !== 'all' ||
                  filterSemester !== 'all') && (
                  <button
                     type="button"
                     onClick={() => {
                        setFilterOffice('all');
                        setFilterCategory('all');
                        setFilterSemester('all');
                     }}
                     className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 transition-colors cursor-pointer"
                     title="Reset all filters"
                  >
                     <RotateCcw size={12} />
                     <span>Reset</span>
                  </button>
               )}
            </div>

            <p className="text-xs text-slate-400 font-medium ml-auto">
               Showing {filteredJournal.length}{' '}
               {filteredJournal.length === 1 ? 'activity' : 'activities'}
            </p>
         </div>

         {/* Loading skeleton */}
         {loading && (
            <div className="py-16 text-center">
               <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-700" />
               <p className="text-xs text-slate-500 mt-2 font-medium">
                  Loading activity journal...
               </p>
            </div>
         )}

         {/* Journal List / Table */}
         {!loading && filteredJournal.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
               <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
               <h3 className="text-base font-bold text-slate-800">
                  {journal.length === 0
                     ? 'No tenure activities recorded yet'
                     : 'No activities match the filters'}
               </h3>
               <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                  {journal.length === 0
                     ? 'Log your tutorials, hackathons, workshops, seminars, sport tournaments, welfare drives, and general meetings to build a complete record for your handover and accountability reports.'
                     : 'Try clearing or changing your filters above to see more records.'}
               </p>
               {journal.length === 0 ? (
                  <button
                     type="button"
                     onClick={openCreateModal}
                     className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                     <Plus size={15} />
                     <span>Record First Activity</span>
                  </button>
               ) : (
                  <button
                     type="button"
                     onClick={() => {
                        setFilterOffice('all');
                        setFilterCategory('all');
                        setFilterSemester('all');
                     }}
                     className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                     <RotateCcw size={13} />
                     <span>Clear Filters</span>
                  </button>
               )}
            </div>
         ) : (
            !loading && (
               <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                              <th className="py-3.5 px-4">Date</th>
                              <th className="py-3.5 px-4">Office(s) &amp; Category</th>
                              <th className="py-3.5 px-4">Activity Title &amp; Details</th>
                              <th className="py-3.5 px-4 text-center">Turnout</th>
                              <th className="py-3.5 px-4 text-center">Semester</th>
                              <th className="py-3.5 px-4 text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                           {filteredJournal.map((item) => {
                              const itemOffices = getItemOffices(item);
                              return (
                                 <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-4 px-4 whitespace-nowrap text-slate-600 font-medium align-top">
                                       <div className="flex items-center gap-1.5">
                                          <Calendar size={13} className="text-slate-400 shrink-0" />
                                          <span>
                                             {item.date
                                                ? new Date(item.date).toLocaleDateString('en-US', {
                                                     month: 'short',
                                                     day: 'numeric',
                                                     year: 'numeric',
                                                  })
                                                : '—'}
                                          </span>
                                       </div>
                                    </td>
                                    <td className="py-4 px-4 align-top space-y-1.5 min-w-[200px]">
                                       <div className="flex flex-wrap gap-1">
                                          {itemOffices.map((off) => (
                                             <span
                                                key={off}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-900 border border-teal-200/80 text-[11px] font-bold"
                                             >
                                                <Building2 size={10} className="text-teal-700 shrink-0" />
                                                <span>{off}</span>
                                             </span>
                                          ))}
                                       </div>
                                       <div>
                                          <span
                                             className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getJournalCategoryBadge(
                                                item.category
                                             )}`}
                                          >
                                             {item.category}
                                          </span>
                                       </div>
                                    </td>
                                    <td className="py-4 px-4 align-top max-w-md">
                                       <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                                       {item.details ? (
                                          <p className="text-slate-600 text-xs mt-1 whitespace-pre-line leading-relaxed">
                                             {item.details}
                                          </p>
                                       ) : (
                                          <p className="text-slate-400 italic text-[11px] mt-0.5">
                                             No additional notes provided
                                          </p>
                                       )}
                                    </td>
                                    <td className="py-4 px-4 whitespace-nowrap text-center align-top">
                                       {item.attendance ? (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200/70">
                                             <Users size={12} className="text-emerald-600" />
                                             {Number(item.attendance).toLocaleString()}
                                          </span>
                                       ) : (
                                          <span className="text-slate-400 text-xs">—</span>
                                       )}
                                    </td>
                                    <td className="py-4 px-4 whitespace-nowrap text-center align-top">
                                       <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                                          {item.semester || 'First Semester'}
                                       </span>
                                    </td>
                                    <td className="py-4 px-4 whitespace-nowrap text-right align-top">
                                       <div className="flex items-center justify-end gap-1">
                                          <button
                                             type="button"
                                             onClick={() => openEditModal(item)}
                                             className="p-1.5 rounded-lg text-slate-500 hover:text-teal-800 hover:bg-teal-50 transition-colors cursor-pointer"
                                             title="Edit Entry"
                                          >
                                             <Edit3 size={15} />
                                          </button>
                                          <button
                                             type="button"
                                             onClick={() => handleDelete(item.id, item.title)}
                                             className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                             title="Delete Entry"
                                          >
                                             <Trash2 size={15} />
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>
            )
         )}

         {/* MODAL */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs">
               <div className="bg-white rounded-3xl max-w-full sm:max-w-2xl md:max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                     <h3 className="text-lg font-bold text-slate-900">
                        {editingItem ? 'Edit Activity Record' : 'Record Tenure Activity'}
                     </h3>
                     <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                     >
                        <X size={18} />
                     </button>
                  </div>

                  <form onSubmit={handleSave} className="space-y-5">
                     {/* Title & Category Row */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                              Activity Title *
                           </label>
                           <input
                              type="text"
                              required
                              value={form.title}
                              onChange={(e) => setForm({ ...form, title: e.target.value })}
                              placeholder="e.g. Introduction to Git &amp; GitHub Workshop"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-600"
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                              Category *
                           </label>
                           <select
                              required
                              value={form.category}
                              onChange={(e) => setForm({ ...form, category: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-600 bg-white cursor-pointer"
                           >
                              {JOURNAL_CATEGORIES.map((cat) => (
                                 <option key={cat} value={cat}>
                                    {cat}
                                 </option>
                              ))}
                           </select>
                        </div>
                     </div>

                     {/* Organizing Office(s) Multi-Select */}
                     <div>
                        <div className="flex items-center justify-between mb-1.5">
                           <label className="block text-xs font-bold text-slate-700 uppercase">
                              Organizing Office(s) *
                           </label>
                           <span className="text-[11px] font-semibold text-teal-700">
                              {form.offices.length} selected
                           </span>
                        </div>
                        <div className="p-3 bg-slate-50/70 border border-slate-200/90 rounded-2xl max-h-52 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                           {EXECUTIVE_OFFICES.map((off) => {
                              const isChecked = form.offices.includes(off);
                              return (
                                 <label
                                    key={off}
                                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors border select-none ${
                                       isChecked
                                          ? 'bg-teal-50 text-teal-900 font-bold border-teal-200/90 shadow-2xs'
                                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                    }`}
                                 >
                                    <input
                                       type="checkbox"
                                       checked={isChecked}
                                       onChange={(e) => {
                                          if (e.target.checked) {
                                             setForm({ ...form, offices: [...form.offices, off] });
                                          } else {
                                             setForm({
                                                ...form,
                                                offices: form.offices.filter((o) => o !== off),
                                             });
                                          }
                                       }}
                                       className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                                    />
                                    <span className="truncate">{off}</span>
                                 </label>
                              );
                           })}
                        </div>
                        {form.offices.length === 0 && (
                           <p className="text-[11px] text-rose-600 font-medium mt-1">
                              Please select at least one office.
                           </p>
                        )}
                     </div>

                     {/* Date, Semester, Turnout Row */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                              Date *
                           </label>
                           <input
                              type="date"
                              required
                              value={form.date}
                              onChange={(e) => setForm({ ...form, date: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-600"
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                              Semester
                           </label>
                           <select
                              value={form.semester}
                              onChange={(e) => setForm({ ...form, semester: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-600 bg-white cursor-pointer"
                           >
                              {SEMESTERS.map((sem) => (
                                 <option key={sem} value={sem}>
                                    {sem}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                              Turnout / Attendance
                           </label>
                           <input
                              type="number"
                              min="0"
                              value={form.attendance}
                              onChange={(e) => setForm({ ...form, attendance: e.target.value })}
                              placeholder="e.g. 85"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-600"
                           />
                        </div>
                     </div>

                     {/* Details / Notes */}
                     <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                           Details &amp; Notes
                        </label>
                        <textarea
                           rows={4}
                           value={form.details}
                           onChange={(e) => setForm({ ...form, details: e.target.value })}
                           placeholder="Key outcomes, topics covered, venues, facilitators, or highlights..."
                           className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-600"
                        />
                     </div>

                     <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                           type="button"
                           onClick={() => setIsModalOpen(false)}
                           className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           disabled={isSaving}
                           className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                           {isSaving && <Loader2 size={13} className="animate-spin" />}
                           <span>{editingItem ? 'Save Changes' : 'Record Activity'}</span>
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
