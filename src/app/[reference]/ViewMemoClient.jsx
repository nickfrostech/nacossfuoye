'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Letterhead from '@/components/Letterhead';
import DownloadBtn from '@/components/DownloadBtn';
import { House, SquareChevronLeft, SquareChevronRight } from 'lucide-react';
import useScale from '@/hooks/useScale';
import PageHeader from '@/components/PageHeader';
import { splitMemoContent } from '@/utils/memo-pagination';

function ScaledViewSheet({
   pageNumber,
   totalPages,
   content,
   memo,
   onRegisterRef,
}) {
   const letterHeadRef = useRef(null);
   const previewRef = useRef(null);

   useScale({ letterHeadRef, previewRef });

   useEffect(() => {
      onRegisterRef(pageNumber - 1, letterHeadRef);
   }, [pageNumber, onRegisterRef]);

   return (
      <div className="bg-white rounded-2xl shadow-xl w-full relative flex flex-col min-w-0 overflow-hidden">
         {totalPages > 1 && (
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
               <span>
                  Sheet {pageNumber} of {totalPages}
                  {pageNumber > 1 ? ' (Continuation Sheet)' : ''}
               </span>
               <span className="font-mono text-slate-400">{memo.reference}</span>
            </div>
         )}
         <div ref={previewRef} className="w-full relative aspect-794/1123 overflow-hidden">
            <Letterhead
               date={memo.date}
               referenceNumber={memo.reference}
               content={content}
               letterHeadRef={letterHeadRef}
               type={memo.type}
               pageNumber={pageNumber}
               totalPages={totalPages}
            />
         </div>
      </div>
   );
}

export default function ViewMemoClient({ memo, previousRef, nextRef }) {
   const router = useRouter();
   const pages = splitMemoContent(memo.content);
   const paperRefs = useRef([]);

   const handleRegisterRef = useCallback((index, ref) => {
      paperRefs.current[index] = ref;
   }, []);

   // Next/previous navigation can keep the old scroll offset, leaving the page
   // title hidden under the fixed navbar. Always start a memo at the top.
   useEffect(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
   }, [memo.reference]);

   const handleNext = () => {
      if (nextRef) router.push(`/${encodeURIComponent(nextRef)}`);
   };

   const handlePrev = () => {
      if (previousRef) router.push(`/${encodeURIComponent(previousRef)}`);
   };

   return (
      <div className="w-full max-w-4xl mx-auto">
         <PageHeader 
            title="View Memo"
            description={`Ref: ${memo.reference}${pages.length > 1 ? ` (${pages.length} Pages)` : ''}`}
         >
            <div className="flex flex-wrap items-center gap-3">
               <DownloadBtn elementRefs={paperRefs.current} referenceNumber={memo.reference} />
               
               <Link href="/" aria-label="Go home" className="inline-flex items-center justify-center p-3 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/60 text-slate-500 hover:text-primary hover:border-primary/30 transition-all duration-300 ease-out active:scale-[0.97]">
                  <House size={22} />
               </Link>

               <button
                  aria-label="Previous memo"
                  className="inline-flex items-center justify-center p-3 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/60 text-slate-500 hover:text-primary hover:border-primary/30 transition-all duration-300 ease-out active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  onClick={handlePrev}
                  disabled={!previousRef}
               >
                  <SquareChevronLeft size={22} />
               </button>

               <button
                  aria-label="Next memo"
                  className="inline-flex items-center justify-center p-3 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/60 text-slate-500 hover:text-primary hover:border-primary/30 transition-all duration-300 ease-out active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  onClick={handleNext}
                  disabled={!nextRef}
               >
                  <SquareChevronRight size={22} />
               </button>
            </div>
         </PageHeader>

         {/* Stacked Sheet Canvas (Supports arbitrary N pages) */}
         <div className="mt-8 space-y-8">
            {pages.map((pageContent, idx) => (
               <ScaledViewSheet
                  key={idx}
                  pageNumber={idx + 1}
                  totalPages={pages.length}
                  content={pageContent}
                  memo={memo}
                  onRegisterRef={handleRegisterRef}
               />
            ))}
         </div>
      </div>
   );
}
