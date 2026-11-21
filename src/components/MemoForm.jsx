'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import Letterhead from '@/components/Letterhead';
import { createClient } from '@/utils/supabase/client';
import DownloadBtn from '@/components/DownloadBtn';
import useScale from '@/hooks/useScale';
import PageHeader from '@/components/PageHeader';
import { AddNewMemo, UpdateMemo } from '@/components/PublishBtn';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { History, RotateCcw, Trash2, PlusSquare, Scissors, Layers } from 'lucide-react';
import { splitMemoContent, joinMemoPages, smartSplitContent } from '@/utils/memo-pagination';

const PREFIX_MAP = {
   executive: 'NACOSS',
   elecom: 'CSCEC',
   src: 'CSCSRC',
   president: 'CSCPR'
};

const ScaledEditorSheet = memo(function ScaledEditorSheet({
   pageIndex,
   totalPages,
   content,
   onContentChange,
   date,
   referenceNumber,
   memoType,
   viewMode,
   toolbarPortalRef,
   isActive,
   onFocus,
   onRemoveSheet,
   onAutoSplit,
   onRegisterRef,
}) {
   const letterHeadRef = useRef(null);
   const previewRef = useRef(null);
   const [isOverflowing, setIsOverflowing] = useState(false);

   useScale({ letterHeadRef, previewRef });

   const handleOverflowChange = useCallback((isOver) => {
      setIsOverflowing(isOver);
   }, []);

   const handleContentChange = useCallback((val) => {
      onContentChange(pageIndex, val);
   }, [onContentChange, pageIndex]);

   const handleFocus = useCallback(() => {
      onFocus(pageIndex);
   }, [onFocus, pageIndex]);

   const handleRemove = useCallback(() => {
      onRemoveSheet(pageIndex);
   }, [onRemoveSheet, pageIndex]);

   const handleSplit = useCallback(() => {
      onAutoSplit(pageIndex, letterHeadRef.current);
   }, [onAutoSplit, pageIndex]);

   useEffect(() => {
      onRegisterRef(pageIndex, letterHeadRef);
      return () => {
         onRegisterRef(pageIndex, null);
      };
   }, [pageIndex, onRegisterRef]);

   const pageNumber = pageIndex + 1;

   return (
      <div className={`${pageIndex > 0 ? 'mt-8' : ''} shadow-xl rounded-2xl w-full relative flex flex-col min-w-0 bg-white border border-slate-100 overflow-hidden`}>
         {/* Sheet Header: Sheet X of Y */}
         <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${pageNumber === 1 ? 'bg-primary' : 'bg-emerald-500'}`} />
               <span>
                  Sheet {pageNumber} of {totalPages}
                  {pageNumber > 1 ? ' (Continuation Sheet)' : ''}
               </span>
               {referenceNumber && (
                  <span className="font-mono text-slate-400">({referenceNumber})</span>
               )}
            </div>
            {/* Continuation sheets have the remove button. Sheet 1 has NO add button at the top */}
            {pageNumber > 1 && (
               <button
                  type="button"
                  onClick={handleRemove}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-medium transition cursor-pointer"
               >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Sheet {pageNumber}</span>
               </button>
            )}
         </div>

         {/* Letterhead Paper Container */}
         <div ref={previewRef} className="w-full relative aspect-794/1123 overflow-hidden bg-gray-100">
            <Letterhead
               date={date}
               referenceNumber={referenceNumber}
               content={content}
               letterHeadRef={letterHeadRef}
               viewMode={viewMode}
               setContent={handleContentChange}
               type={memoType}
               toolbarPortalRef={toolbarPortalRef}
               pageNumber={pageNumber}
               totalPages={totalPages}
               onOverflowChange={handleOverflowChange}
               isActive={isActive}
               onFocus={handleFocus}
            />
         </div>

         {/* Overflow prompt on this Sheet */}
         {isOverflowing && (
            <div className="p-4 border-t border-amber-300 bg-amber-50 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
               <div className="text-xs">
                  <span className="font-bold text-amber-900 block sm:inline">⚠️ Content overflows Sheet {pageNumber} printable height: </span>
                  <span className="text-amber-800">Your text exceeds the printable area. Split onto Sheet {pageNumber + 1} for a clean multi-page memo.</span>
               </div>
               <button
                  type="button"
                  onClick={handleSplit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition active:scale-95 shrink-0"
               >
                  <Scissors className="w-3.5 h-3.5" />
                  Auto-Split to Sheet {pageNumber + 1}
               </button>
            </div>
         )}
      </div>
   );
});

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
   const [viewMode, setViewMode] = useState('split');
   const supabase = createClient();

   const [pages, setPages] = useState(() => {
      const initial = initialData.content || '';
      return splitMemoContent(initial);
   });
   const [activeSheetIndex, setActiveSheetIndex] = useState(0);

   const combinedContent = joinMemoPages(pages);
   const [splitEditorHtml, setSplitEditorHtml] = useState(() => joinMemoPages(pages));

   const prevViewModeRef = useRef('split');
   // Keep splitEditorHtml in sync when switching from document view to split view
   useEffect(() => {
      if (prevViewModeRef.current !== 'split' && viewMode === 'split') {
         setSplitEditorHtml(joinMemoPages(pages));
      }
      prevViewModeRef.current = viewMode;
   }, [viewMode, pages]);

   const toolbarPortalRef = useRef(null);
   const publishRef = useRef(null);
   const paperRefs = useRef([]);

   const handleRegisterRef = useCallback((index, ref) => {
      paperRefs.current[index] = ref;
   }, []);

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
            const restoredPages = splitMemoContent(pendingDraft.content);
            const joined = joinMemoPages(restoredPages);
            setPages(restoredPages);
            setSplitEditorHtml(joined);
            setActiveSheetIndex(0);
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

         const heading = doc.querySelector('h1, h2, h3');
         if (heading && heading.textContent.trim()) {
            return heading.textContent.trim();
         }

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

   const effectiveHead = title.trim() || getSmartTitle(pages[0] || combinedContent) || initialData.head || "Untitled Memo";

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
      if (pendingDraft) return;
      if (!combinedContent && !date && !title) return;

      const timer = setTimeout(() => {
         try {
            localStorage.setItem(`nacoss_memo_draft_${memoType}`, JSON.stringify({
               title,
               date,
               content: combinedContent,
               savedAt: Date.now()
            }));
         } catch (e) {
            console.warn('Could not auto-save draft:', e);
         }
      }, 500);

      return () => clearTimeout(timer);
   }, [isNew, memoType, title, date, combinedContent, pendingDraft]);

   const handleSheetFocus = useCallback((idx) => {
      setActiveSheetIndex(idx);
   }, []);

   const handleAddSheet = useCallback(() => {
      setPages(prev => {
         const next = [...prev, '<p></p>'];
         const joined = joinMemoPages(next);
         setSplitEditorHtml(joined);
         setActiveSheetIndex(next.length - 1);
         return next;
      });
      setIsSaved(false);
   }, []);

   const handleRemovePage = useCallback((indexToRemove) => {
      setPages(prev => {
         if (prev.length <= 1) return prev;
         const next = prev.filter((_, idx) => idx !== indexToRemove);
         const joined = joinMemoPages(next);
         setSplitEditorHtml(joined);
         return next;
      });
      setIsSaved(false);
      setActiveSheetIndex(prev => Math.max(0, prev - 1));
   }, []);

   const handleAutoSplit = useCallback((indexToSplit, letterHeadEl) => {
      setPages(prev => {
         const [p1, p2] = smartSplitContent(prev[indexToSplit], letterHeadEl, memoType);
         const next = [...prev];
         next.splice(indexToSplit, 1, p1, p2);
         const joined = joinMemoPages(next);
         setSplitEditorHtml(joined);
         return next;
      });
      setIsSaved(false);
      setActiveSheetIndex(indexToSplit);
   }, [memoType]);

   const handleSheetContentChange = useCallback((index, newSheetContent) => {
      setPages(prev => {
         const next = [...prev];
         next[index] = newSheetContent;
         return next;
      });
      setIsSaved(false);
   }, []);

   const splitDebounceRef = useRef(null);

   useEffect(() => {
      return () => {
         if (splitDebounceRef.current) clearTimeout(splitDebounceRef.current);
      };
   }, []);

   const handleSplitEditorChange = useCallback((val) => {
      setSplitEditorHtml(val);
      setIsSaved(false);
      if (splitDebounceRef.current) clearTimeout(splitDebounceRef.current);
      splitDebounceRef.current = setTimeout(() => {
         const parsedPages = splitMemoContent(val);
         setPages(parsedPages);
      }, 150);
   }, []);

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
         content: combinedContent,
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
         content: combinedContent,
         reference: refNum || referenceNumber,
      };
   };

   const handleBeforeDownload = async () => {
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
      <div className="relative">
         <PageHeader
            title={isNewMemo ? 'Create New Memo' : 'Edit Memo'}
         >
            <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-3">
               <DownloadBtn
                  elementRefs={paperRefs.current.slice(0, pages.length)}
                  referenceNumber={referenceNumber || 'draft'}
                  onBeforeDownload={handleBeforeDownload}
               />
               {isNewMemo ? (
                  <AddNewMemo ref={publishRef} referenceNumber={referenceNumber} date={date} head={effectiveHead} content={combinedContent} type={memoType} onSuccess={handlePublishSuccess} />
               ) : (
                  <UpdateMemo ref={publishRef} referenceNumber={referenceNumber} date={date} head={effectiveHead} content={combinedContent} type={memoType} onSuccess={handleUpdateSuccess} />
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
            {/* Form Section: Independent Scrollable Sidebar */}
            <aside className="p-5 rounded-2xl min-w-0 shadow-xl bg-white border border-slate-200/80 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] overflow-y-auto">
               <div className="space-y-4">
                  <div className="flex justify-around bg-slate-100/80 p-1 rounded-xl w-full">
                     <button onClick={() => setViewMode('split')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${viewMode === 'split' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-primary cursor-pointer'}`}>Split View</button>
                     <button onClick={() => setViewMode('document')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${viewMode === 'document' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-primary cursor-pointer'}`}>Document View</button>
                  </div>

                  <div>
                     <div className="flex items-center justify-between mb-2">
                        <label htmlFor="titleInput" className="block text-xs font-bold text-primary uppercase tracking-wider">Memo Title / Subject</label>
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
                        className="w-full px-4 py-3 rounded-xl border border-primary/70 focus:border-primary outline-none transition-all duration-300 text-slate-900 bg-white"
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
                        className="w-full px-4 py-3 rounded-xl border border-primary/70 focus:border-primary outline-none transition-all duration-300 text-slate-900 bg-white"
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
                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all duration-300 text-slate-900 ${!isNewMemo ? 'bg-slate-100/80 border-slate-200 cursor-not-allowed opacity-80' : 'border-primary/70 focus:border-primary bg-white'}`}
                     />
                  </div>

                  {/* Multi-sheet status bar in sidebar: Can add new sheet or remove last sheet */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                     <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <Layers className="w-4 h-4 text-primary" />
                        <span>Pages: {pages.length} sheet{pages.length > 1 ? 's' : ''}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <button
                           type="button"
                           onClick={handleAddSheet}
                           className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition cursor-pointer"
                        >
                           <PlusSquare className="w-3.5 h-3.5" />
                           + Add Sheet
                        </button>
                        {pages.length > 1 && (
                           <button
                              type="button"
                              onClick={() => handleRemovePage(pages.length - 1)}
                              title="Remove Last Sheet"
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                           >
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        )}
                     </div>
                  </div>

                  {viewMode === 'split' && (
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <label htmlFor="quill-editor" className="block text-xs font-bold text-primary uppercase tracking-wider">
                              Memo Content (All Sheets)
                           </label>
                           <span className="text-[11px] text-slate-500 font-medium">
                              {pages.length} sheet{pages.length > 1 ? 's' : ''} • Ctrl+A to format all
                           </span>
                        </div>

                        <div className="rounded-xl bg-white transition-all duration-300">
                           <SimpleEditor
                              setContent={handleSplitEditorChange}
                              content={splitEditorHtml}
                              mode="split"
                           />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2">
                           All sheets are together in this editor. Use <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[10px] border border-slate-200">Ctrl+A</kbd> to format all together, or <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[10px] border border-slate-200">Ctrl+Enter</kbd> to insert a page break.
                        </p>
                     </div>
                  )}
               </div>
            </aside>

            {/* Preview Section: Stacked Letterhead Canvas (Supports arbitrary N pages) */}
            <main className="w-full relative flex flex-col min-w-0">
               {/* Sticky Tiptap Toolbar Portal for Document View */}
               <div ref={toolbarPortalRef} className="w-full z-30 sticky top-3 bg-white rounded-2xl shadow-md border border-slate-200 mb-4 empty:hidden" />

               {/* Multi-sheet helper bar in Document View */}
               {viewMode === 'document' && pages.length > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 mb-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                     <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <Layers className="w-4 h-4 text-primary" />
                        <span>Document View: {pages.length} sheets (individual on-sheet editing)</span>
                     </div>
                     <button
                        type="button"
                        onClick={() => setViewMode('split')}
                        title="Switch to Split View to format all sheets together"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold transition cursor-pointer"
                     >
                        <span>Format All Together (Split View)</span>
                     </button>
                  </div>
               )}

               {/* Render All N Sheets */}
               {pages.map((pageContent, idx) => (
                  <ScaledEditorSheet
                     key={`sheet-${idx}`}
                     pageIndex={idx}
                     totalPages={pages.length}
                     content={pageContent}
                     onContentChange={handleSheetContentChange}
                     date={date}
                     referenceNumber={referenceNumber}
                     memoType={memoType}
                     viewMode={viewMode}
                     toolbarPortalRef={toolbarPortalRef}
                     isActive={activeSheetIndex === idx}
                     onFocus={handleSheetFocus}
                     onRemoveSheet={handleRemovePage}
                     onAutoSplit={handleAutoSplit}
                     onRegisterRef={handleRegisterRef}
                  />
               ))}

               {/* Add Continuation Sheet Button (Placed below the last sheet) */}
               <div className="mt-8 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-primary/60 rounded-2xl bg-white/70 hover:bg-white transition-all duration-200 group">
                  <button
                     type="button"
                     onClick={handleAddSheet}
                     className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-md hover:bg-primary/90 active:scale-95 transition cursor-pointer"
                  >
                     <PlusSquare className="w-4 h-4" />
                     <span>+ Add Continuation Sheet (Sheet {pages.length + 1})</span>
                  </button>
               </div>
            </main>
         </div>
      </div>
   );
}
