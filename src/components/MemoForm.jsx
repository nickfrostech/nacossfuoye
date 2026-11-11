'use client';

import { useState, useRef, useEffect } from 'react';
import Letterhead from '@/components/Letterhead';
import { createClient } from '@/utils/supabase/client';
import DownloadBtn from '@/components/DownloadBtn';
import useScale from '@/hooks/useScale';
import PageHeader from '@/components/PageHeader';
import { AddNewMemo, UpdateMemo } from '@/components/PublishBtn';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { History, RotateCcw, Trash2 } from 'lucide-react';

const PREFIX_MAP = {
   executive: 'NACOSS',
   elecom: 'CSCEC',
   src: 'CSCSRC',
   president: 'CSCPR'
};

export default function MemoForm({ isNew = true, initialData = {}, memoType = 'executive' }) {
   const [isNewMemo, setIsNewMemo] = useState(isNew);
   const [isSaved, setIsSaved] = useState(!isNew);
   const [pendingDraft, setPendingDraft] = useState(null);
   const lastSavedRef = useRef({
      title: initialData.head || '',
      date: initialData.date || '',
      content: initialData.content || '',
      reference: initialData.reference || '',
   });

   const [title, setTitle] = useState(initialData.head || '');
   const [date, setDate] = useState(initialData.date || '');
   const [referenceNumber, setReferenceNumber] = useState(initialData.reference || '');
   const supabase = createClient();

   const [content, setContent] = useState(initialData.content || '');

   // Check for unsaved draft on initial load
   useEffect(() => {
      if (!isNew || typeof window === 'undefined') return;
      try {
         const savedDraft = localStorage.getItem(`nacoss_memo_draft_${memoType}`);
         if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            const hasContent = parsed.content && parsed.content.trim() !== '' && parsed.content.trim() !== '<p></p>';
            const hasDate = Boolean(parsed.date);
            const hasTitle = Boolean(parsed.title || parsed.head);
            if (hasContent || hasDate || hasTitle) {
               setPendingDraft(parsed);
            }
         }
      } catch (e) {
         console.warn('Could not read memo draft:', e);
      }
   }, [isNew, memoType]);

   const handleRestoreDraft = () => {
      if (pendingDraft) {
         if (pendingDraft.title || pendingDraft.head) {
            setTitle(pendingDraft.title || pendingDraft.head);
         }
         if (pendingDraft.date) {
            setDate(pendingDraft.date);
         }
         if (pendingDraft.content) {
            setContent(pendingDraft.content);
         }
         setIsSaved(false);
      }
      setPendingDraft(null);
   };

   const handleDiscardDraft = () => {
      if (typeof window !== 'undefined') {
         try {
            localStorage.removeItem(`nacoss_memo_draft_${memoType}`);
         } catch (e) {
            console.warn('Could not clear local draft:', e);
         }
      }
      setPendingDraft(null);
   };

   // Fallback smart title extractor if title field is left blank
   const getSmartTitle = (htmlContent) => {
      if (typeof window === 'undefined' || !htmlContent) return '';
      try {
         const parser = new DOMParser();
         const doc = parser.parseFromString(htmlContent, 'text/html');

         // 1. Look for explicit heading tags (h1, h2, h3)
         const heading = doc.querySelector('h1, h2, h3');
         if (heading && heading.textContent.trim()) {
            return heading.textContent.trim();
         }

         // 2. Scan elements while ignoring address lines (To:, From:, etc.)
         const ignorePrefixes = /^(to|from|through|date|ref|reference|internal memo|memorandum)\s*:/i;
         const elements = doc.body.querySelectorAll('p, div, li');

         for (const el of elements) {
            const text = el.textContent.trim();
            if (!text) continue;

            const subjMatch = text.match(/^subject\s*:\s*(.+)$/i);
            if (subjMatch) return subjMatch[1].trim();

            if (ignorePrefixes.test(text) || /^memorandum$/i.test(text) || /^internal memorandum$/i.test(text)) {
               continue;
            }

            return text;
         }
      } catch (e) {
         console.warn('Could not extract smart title:', e);
      }
      return '';
   };

   const effectiveHead = title.trim() || getSmartTitle(content) || initialData.head || "Untitled Memo";
   const [viewMode, setViewMode] = useState('split');

   const letterHeadRef = useRef(null);
   const previewRef = useRef(null);
   const toolbarPortalRef = useRef(null);

   const publishRef = useRef(null);

   useEffect(() => {
      if (!isNew || initialData.reference) return;
      let isMounted = true;

      const fetchNextReference = async () => {
         const prefix = PREFIX_MAP[memoType] || 'NACOSS';
         const currentYearSuffix = new Date().getFullYear().toString().slice(-2);

         const { data, error } = await supabase
            .from('memo')
            .select('reference')
            .eq('type', memoType)
            .like('reference', `${prefix}/${currentYearSuffix}/%`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

         if (!isMounted) return;

         if (error && error.code !== 'PGRST116') {
            console.error('Error fetching last reference:', error);
         }

         let nextNum = 1;
         if (data && data.reference) {
            const parts = data.reference.split('/');
            if (parts.length === 3) {
               const lastNum = parseInt(parts[2], 10);
               if (!isNaN(lastNum)) {
                  nextNum = lastNum + 1;
               }
            }
         }

         const paddedNum = nextNum.toString().padStart(3, '0');
         setReferenceNumber(`${prefix}/${currentYearSuffix}/${paddedNum}`);
      };

      fetchNextReference();
      return () => {
         isMounted = false;
      };
   }, [isNew, memoType, initialData.reference, supabase]);

   // Auto-save draft to local storage so user content is never lost if session expires or page refreshes
   useEffect(() => {
      if (!isNew || typeof window === 'undefined') return;
      if (pendingDraft) return; // Don't overwrite pending draft until user restores or discards
      if (!content && !date && !title) return;

      const timer = setTimeout(() => {
         try {
            localStorage.setItem(`nacoss_memo_draft_${memoType}`, JSON.stringify({
               title,
               date,
               content,
               savedAt: Date.now()
            }));
         } catch (e) {
            console.warn('Could not auto-save draft:', e);
         }
      }, 500);

      return () => clearTimeout(timer);
   }, [isNew, memoType, title, date, content, pendingDraft]);

   useScale({ letterHeadRef, previewRef });

   const handlePublishSuccess = (refNum) => {
      if (typeof window !== 'undefined') {
         try {
            localStorage.removeItem(`nacoss_memo_draft_${memoType}`);
         } catch (e) {
            console.warn('Could not clear local draft on publish:', e);
         }
      }
      setPendingDraft(null);
      setIsNewMemo(false);
      setIsSaved(true);
      lastSavedRef.current = {
         title,
         date,
         content,
         reference: refNum || referenceNumber,
      };
      if (typeof window !== 'undefined' && refNum) {
         window.history.replaceState(null, '', `/admin/edit/${encodeURIComponent(refNum)}`);
      }
   };

   const handleUpdateSuccess = (refNum) => {
      setIsSaved(true);
      lastSavedRef.current = {
         title,
         date,
         content,
         reference: refNum || referenceNumber,
      };
   };

   const handleBeforeDownload = async () => {
      // If the memo has already been published/saved and there are no unsaved changes,
      // allow download immediately without re-publishing or prompting!
      if (isSaved) {
         return true;
      }
      if (publishRef.current) {
         return await publishRef.current.publish();
      }
      return true;
   };

   const formattedDraftTime = pendingDraft?.savedAt
      ? new Date(pendingDraft.savedAt).toLocaleString(undefined, {
           month: 'short',
           day: 'numeric',
           hour: 'numeric',
           minute: '2-digit',
           hour12: true,
        })
      : null;

   return (
      <div className="relative pt-4 sm:pt-6">
         <PageHeader
            title={isNewMemo ? 'Create New Memo' : 'Edit Memo'}
         >
            <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-3">
               <DownloadBtn elementRef={letterHeadRef} referenceNumber={referenceNumber || 'draft'} onBeforeDownload={handleBeforeDownload} />
               {isNewMemo ? (
                  <AddNewMemo ref={publishRef} referenceNumber={referenceNumber} date={date} head={effectiveHead} content={content} type={memoType} onSuccess={handlePublishSuccess} />
               ) : (
                  <UpdateMemo ref={publishRef} referenceNumber={referenceNumber} date={date} head={effectiveHead} content={content} type={memoType} onSuccess={handleUpdateSuccess} />
               )}
            </div>
         </PageHeader>

         {pendingDraft && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 text-amber-950 shadow-sm backdrop-blur-sm transition-all">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                     <History className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="font-semibold text-sm text-amber-900">Unsaved draft found</p>
                     <p className="text-xs text-amber-700/90">
                        {formattedDraftTime
                           ? `You have an unsaved memo draft from ${formattedDraftTime}. Would you like to restore it?`
                           : 'You have an unsaved memo draft from a previous session. Would you like to restore it?'}
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                     type="button"
                     onClick={handleRestoreDraft}
                     className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-600 text-white hover:bg-amber-700 active:scale-95 transition shadow-xs cursor-pointer"
                  >
                     <RotateCcw className="w-3.5 h-3.5" />
                     Restore Draft
                  </button>
                  <button
                     type="button"
                     onClick={handleDiscardDraft}
                     className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-amber-300/80 bg-white text-amber-900 hover:bg-amber-100 active:scale-95 transition cursor-pointer"
                  >
                     <Trash2 className="w-3.5 h-3.5 text-amber-700" />
                     Discard
                  </button>
               </div>
            </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 items-start">
            {/* Form Section */}
            <aside className="p-5 rounded-2xl lg:sticky lg:top-32 min-w-0 shadow-xl">
               <div className="space-y-4">
                  <div className="flex justify-around bg-slate-100/80 p-1 rounded-xl w-full">
                     <button onClick={() => setViewMode('split')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${viewMode === 'split' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-primary'}`}>Split View</button>
                     <button onClick={() => setViewMode('document')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${viewMode === 'document' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-primary'}`}>Document View</button>
                  </div>

                  <div>
                     <div className="flex items-center justify-between mb-2">
                        <label htmlFor="titleInput" className="block text-xs font-bold text-primary uppercase tracking-wider">Memo Title / Subject</label>
                        <span className="text-[10px] text-slate-400 font-medium">Used for memo list & search</span>
                     </div>
                     <input
                        type="text"
                        id="titleInput"
                        value={title}
                        onChange={e => {
                           setTitle(e.target.value);
                           setIsSaved(false);
                        }}
                        placeholder="e.g. Notice of Departmental Meeting"
                        className="w-full px-4 py-3 rounded-xl border border-primary/70 focus:border-primary outline-none transition-all duration-300 text-slate-900 bg-white/90 focus:bg-white backdrop-blur-sm"
                     />
                  </div>
                  
                  <div>
                     <label htmlFor="dateInput" className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Date</label>
                     <input
                        type="date"
                        id="dateInput"
                        value={date}
                        onChange={e => {
                           setDate(e.target.value);
                           setIsSaved(false);
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-primary/70 focus:border-primary  outline-none transition-all duration-300 text-slate-900 bg-white/90 focus:bg-white backdrop-blur-sm"
                     />
                  </div>

                  <div>
                     <label htmlFor="refInput" className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Reference Number</label>
                     <input
                        type="text"
                        id="refInput"
                        value={referenceNumber}
                        onChange={e => {
                           setReferenceNumber(e.target.value);
                           setIsSaved(false);
                        }}
                        placeholder={`${PREFIX_MAP[memoType] || 'NACOSS'}/25/...`}
                        disabled={!isNewMemo}
                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all duration-300 text-slate-900 backdrop-blur-sm ${!isNewMemo ? 'bg-white/50 border-white/10 cursor-not-allowed opacity-80' : 'border-primary/70 focus:border-primary  bg-white/90 focus:bg-white'}`}
                     />
                  </div>


                  {viewMode === 'split' && (
                     <div>
                        <label htmlFor="quill-editor" className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Memo Content</label>
                        <div className="rounded-xl bg-white/90 backdrop-blur-sm transition-all duration-300">
                           <SimpleEditor
                              setContent={(val) => {
                                 setContent(val);
                                 setIsSaved(false);
                              }}
                              content={content}
                              mode="split"
                           />
                        </div>
                     </div>
                  )}
               </div>
            </aside>

            {/* Preview Section */}
            <main className="shadow-xl rounded-2xl w-full relative flex flex-col min-w-0">
               <div ref={toolbarPortalRef} className="w-full z-30 sticky top-32 bg-white rounded-t-2xl shadow-xs" />
               <div ref={previewRef} className="w-full relative aspect-794/1123 overflow-hidden bg-gray-100">
                  <Letterhead
                     date={date}
                     referenceNumber={referenceNumber}
                     content={content}
                     letterHeadRef={letterHeadRef}
                     viewMode={viewMode}
                     setContent={(val) => {
                        setContent(val);
                        setIsSaved(false);
                     }}
                     type={memoType}
                     toolbarPortalRef={toolbarPortalRef}
                  />
               </div>
            </main>
         </div>
      </div>
   );
}
