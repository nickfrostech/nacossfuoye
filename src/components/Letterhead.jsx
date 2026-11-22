'use client';

import { useRef, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

export const MEMO_CONFIGS = {
   executive: {
      background: '/letterheads/executive_letter_head.svg',
      referenceClass: 'absolute text-[12pt] text-black font-raleway font-extrabold text-left',
      referenceStyle: { top: '183px', left: '128px' },
      pageNumberClass: 'absolute text-[9.5pt] text-black/80 font-raleway font-extrabold text-left tracking-wide',
      pageNumberStyle: { top: '204px', left: '150px' },
      dateClass: 'absolute text-[12pt] text-black font-raleway font-extrabold text-left',
      dateStyle: { top: '183px', left: '605px' },
      contentClass: 'absolute font-medium text-[14pt] w-[85%] text-left -translate-x-1/2 text-black leading-tight overflow-hidden',
      contentStyle: { top: '230px', left: '50%', height: '745px', maxHeight: '745px' },
      safePrintHeight: 745,
   },
   src: {
      background: '/letterheads/src_letter_head.svg',
      referenceClass: 'absolute text-[12pt] text-black font-raleway text-left font-bold',
      referenceStyle: { top: '120px', left: '570px' },
      pageNumberClass: 'absolute text-[9.5pt] text-black/80 font-raleway font-bold text-left tracking-wide',
      pageNumberStyle: { top: '141px', left: '600px' },
      dateClass: 'absolute text-[12pt] text-black font-raleway font-bold text-left',
      dateStyle: { top: '87px', left: '580px' },
      contentClass: 'absolute font-medium text-[14pt] w-[85%] text-left -translate-x-1/2 text-black leading-tight overflow-hidden',
      contentStyle: { top: '220px', left: '50%', height: '767px', maxHeight: '755px' },
      safePrintHeight: 755,
   },
   elecom: {
      background: '/letterheads/elecom_letter_head.svg',
      referenceClass: 'absolute text-[12pt] text-white font-raleway text-left font-bold',
      referenceStyle: { top: '84px', left: '495px' },
      pageNumberClass: 'absolute text-[9.5pt] text-white/90 font-raleway font-bold text-left tracking-wide',
      pageNumberStyle: { top: '105px', left: '495px' },
      dateClass: 'absolute text-[12pt] text-white font-raleway text-left font-bold',
      dateStyle: { top: '84px', left: '670px' },
      contentClass: 'absolute font-medium text-[14pt] w-[85%] text-left -translate-x-1/2 text-black leading-tight overflow-hidden',
      contentStyle: { top: '240px', left: '50%', height: '720px', maxHeight: '700px' },
      safePrintHeight: 700,
   },
   president: {
      background: '/letterheads/president_letter_head.svg',
      referenceClass: 'absolute text-[12pt] text-black font-bold font-raleway text-left',
      referenceStyle: { top: '183px', left: '138px' },
      pageNumberClass: 'absolute text-[9.5pt] text-black/80 font-raleway font-bold text-left tracking-wide',
      pageNumberStyle: { top: '204px', left: '160px' },
      dateClass: 'absolute text-[12pt] text-black font-bold font-raleway text-left',
      dateStyle: { top: '183px', left: '585px' },
      contentClass: 'absolute font-medium text-[14pt] w-[80%] text-left -translate-x-1/2 text-black leading-tight overflow-hidden',
      contentStyle: { top: '250px', left: '50%', height: '765px', maxHeight: '765px' },
      safePrintHeight: 765,
   }
};

function formatCustomDate(dateString) {
   if (!dateString) return '';
   const dateObj = new Date(dateString);
   if (isNaN(dateObj)) return dateString;

   const day = dateObj.getDate();
   const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
   };

   const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
   const month = monthNames[dateObj.getMonth()];
   const year = dateObj.getFullYear();

   return `${getOrdinal(day)} ${month}, ${year}`;
}

function Letterhead({
   date,
   referenceNumber,
   content,
   letterHeadRef,
   viewMode,
   setContent,
   type = 'executive',
   toolbarPortalRef,
   pageNumber = 1,
   totalPages = 1,
   onOverflowChange,
   isActive = true,
   onFocus,
}) {
   const config = MEMO_CONFIGS[type] || MEMO_CONFIGS['executive'];
   const [isOverflowing, setIsOverflowing] = useState(false);
   const contentContainerRef = useRef(null);
   const onOverflowChangeRef = useRef(onOverflowChange);

   useEffect(() => {
      onOverflowChangeRef.current = onOverflowChange;
   });

   // Strictly display pure reference number without any appended "(Page X)"
   const displayRef = referenceNumber || '';

   // Debounced overflow measurement to prevent layout thrashing and freezing on mobile/iOS Safari
   useEffect(() => {
      const el = contentContainerRef.current;
      if (!el) return;

      const timer = setTimeout(() => {
         const safeH = config.safePrintHeight || 740;
         const isOver = el.scrollHeight > safeH + 10;
         
         setIsOverflowing(prev => {
            if (prev !== isOver) {
               if (onOverflowChangeRef.current) {
                  onOverflowChangeRef.current(isOver, pageNumber);
               }
               return isOver;
            }
            return prev;
         });

         if (el.scrollTop !== 0) el.scrollTop = 0;
         if (el.scrollLeft !== 0) el.scrollLeft = 0;
      }, 180);

      return () => clearTimeout(timer);
   }, [content, config.safePrintHeight, pageNumber]);

   return (
      <section
         className="absolute top-0 left-0 origin-top-left overflow-hidden bg-white"
         ref={letterHeadRef}
         data-letterhead-paper="true"
         data-page-number={pageNumber}
         style={{ width: '794px', height: '1123px' }}
      >
         {/* Official Letterhead Background (stays 100% intact across all pages) */}
         <img
            src={config.background}
            alt={`${type} Letterhead template`}
            className="pointer-events-none absolute inset-0 w-full h-full object-cover"
         />

         <div className="absolute inset-0 z-10">
            {/* Reference Number: pure reference without page suffix */}
            <div className={config.referenceClass} style={config.referenceStyle}>
               {displayRef}
            </div>

            {/* Page Number (placed separately under the reference number when multi-page) */}
            {totalPages > 1 && (
               <div className={config.pageNumberClass} style={config.pageNumberStyle}>
                  Page {pageNumber} of {totalPages}
               </div>
            )}

            {/* Date */}
            <div className={config.dateClass} style={config.dateStyle}>
               {formatCustomDate(date)}
            </div>

            {/* Content Area with Fixed Printable Height (pinned at top, only overflows at bottom) */}
            {viewMode === 'document' ? (
               <div
                  ref={contentContainerRef}
                  className={`${config.contentClass} memo-letterhead-content`}
                  style={config.contentStyle}
               >
                  <SimpleEditor
                     content={content}
                     setContent={setContent}
                     mode="document"
                     toolbarPortalRef={toolbarPortalRef}
                     isActive={isActive}
                     onFocus={onFocus}
                  />
               </div>
            ) : (
               <div
                  ref={contentContainerRef}
                  className={`${config.contentClass} memo-letterhead-content tiptap ProseMirror`}
                  style={config.contentStyle}
                  dangerouslySetInnerHTML={{
                     __html: typeof window !== 'undefined' ? DOMPurify.sanitize(content) : content
                  }}
               />
            )}

            {/* Overflow warning badge in editor view */}
            {isOverflowing && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-rose-600/90 text-white text-[11px] font-bold shadow-md pointer-events-none tracking-wide animate-pulse">
                  ⚠️ Content exceeds Sheet {pageNumber} Printable Area
               </div>
            )}
         </div>
      </section>
   );
}

export default Letterhead;
