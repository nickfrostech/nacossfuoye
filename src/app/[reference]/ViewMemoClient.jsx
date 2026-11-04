'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Letterhead from '@/components/Letterhead';
import DownloadBtn from '@/components/DownloadBtn';
import { House, SquareChevronLeft, SquareChevronRight } from 'lucide-react';
import useScale from '@/hooks/useScale';

import PageHeader from '@/components/PageHeader';

export default function ViewMemoClient({ memo, previousRef, nextRef }) {
   const letterHeadRef = useRef(null);
   const previewRef = useRef(null);
   const router = useRouter();

   // Call the scaling hook
   useScale({ letterHeadRef, previewRef });

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
            description={`Ref: ${memo.reference}`}
         >
            <div className="flex flex-wrap items-center gap-3">
               <DownloadBtn elementRef={letterHeadRef} referenceNumber={memo.reference} />
               
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

         <div className="bg-white rounded-2xl shadow-xl w-full relative flex flex-col min-w-0 mt-8">
            <div ref={previewRef} className="w-full relative aspect-[794/1123] overflow-hidden rounded-2xl">
               <Letterhead
                  date={memo.date}
                  referenceNumber={memo.reference}
                  content={memo.content}
                  letterHeadRef={letterHeadRef}
                  type={memo.type}
               />
            </div>
         </div>
      </div>
   );
}
