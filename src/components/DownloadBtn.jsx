'use client';

import { useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Notification from './Notification';
import { FileDown, FileText, Image, ChevronDown } from 'lucide-react';

function DownloadBtn({ elementRef, elementRefs, referenceNumber = 'document', onBeforeDownload }) {
   const [loadingState, setLoadingState] = useState(null); // null | 'pdf' | 'png'
   const [notification, setNotification] = useState(null);

   const showNotification = (message, type) => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3500);
   };

   const getValidPapers = useCallback(() => {
      let rawRefs = [];

      // 1. If elementRefs is a Ref object whose .current is an array
      if (elementRefs && typeof elementRefs === 'object' && 'current' in elementRefs) {
         rawRefs = Array.isArray(elementRefs.current) ? elementRefs.current : [elementRefs.current];
      }
      // 2. If elementRefs is a function / getter
      else if (typeof elementRefs === 'function') {
         const res = elementRefs();
         rawRefs = Array.isArray(res) ? res : [res];
      }
      // 3. If elementRefs is an array
      else if (Array.isArray(elementRefs) && elementRefs.length > 0) {
         rawRefs = elementRefs;
      }
      // 4. Single elementRef
      else if (elementRef) {
         rawRefs = typeof elementRef === 'object' && 'current' in elementRef ? [elementRef] : [elementRef];
      }

      // Extract DOM nodes from refs (or if already DOM nodes)
      let papers = rawRefs
         .map(r => (r && typeof r === 'object' && 'current' in r ? r.current : r))
         .filter(Boolean);

      // 5. BULLETPROOF DOM FALLBACK:
      // If no papers found via refs (e.g. navigation / ref timing / initial render pass),
      // query the live DOM directly for all rendered letterhead paper sheets!
      if (papers.length === 0 && typeof document !== 'undefined') {
         const domElements = document.querySelectorAll('[data-letterhead-paper="true"]');
         if (domElements && domElements.length > 0) {
            papers = Array.from(domElements);
         }
      }

      return papers;
   }, [elementRef, elementRefs]);

   const capturePaper = async (paper) => {
      // 1. Save original transform and styles
      const originalTransform = paper.style.transform;
      const originalOrigin = paper.style.transformOrigin;
      const originalTransition = paper.style.transition;

      try {
         // Pause the useScale observer from re-applying scale while capturing
         paper.dataset.scalingPaused = 'true';

         // 2. Temporarily remove transform to capture full quality 794x1123 canvas
         paper.style.transition = 'none';
         paper.style.transform = 'none';
         paper.style.transformOrigin = 'top left';

         // Wait a brief moment for the browser layout engine to paint unscaled DOM
         await new Promise(r => setTimeout(r, 120));

         // 3. Render image data URL using html-to-image at high DPI (~300 DPI)
         return await toPng(paper, {
            pixelRatio: 3, // ~2382x3369 px, optimal print resolution and fast processing
            backgroundColor: '#ffffff',
         });
      } finally {
         // 4. Restore original styles immediately
         delete paper.dataset.scalingPaused;
         paper.style.transform = originalTransform;
         paper.style.transformOrigin = originalOrigin;
         paper.style.transition = originalTransition;
      }
   };

   // Download as unified multi-page PDF document
   const downloadPDF = async () => {
      if (onBeforeDownload) {
         const canDownload = await onBeforeDownload();
         if (!canDownload) return;
      }

      const validPapers = getValidPapers();
      if (validPapers.length === 0) {
         showNotification('Letterhead sheet element not found', 'error');
         return;
      }

      setLoadingState('pdf');
      const cleanRefName = (referenceNumber || 'Memo').replace(/[/\\?%*:|"<>]/g, '-');
      const total = validPapers.length;

      try {
         const jsPDFModule = await import('jspdf');
         const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
         const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
         });

         for (let i = 0; i < total; i++) {
            const paper = validPapers[i];
            const dataUrl = await capturePaper(paper);

            if (i > 0) {
               pdf.addPage('a4', 'portrait');
            }
            // 210mm x 297mm matches A4 exactly
            pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297, undefined, 'FAST');

            if (i < total - 1) {
               await new Promise(r => setTimeout(r, 80));
            }
         }

         pdf.save(`${cleanRefName}.pdf`);
         showNotification(
            total > 1 ? `Downloaded ${total}-page PDF successfully!` : 'PDF downloaded successfully!',
            'success'
         );
      } catch (error) {
         console.error('PDF export error:', error);
         showNotification(`PDF download failed: ${error.message || 'Unknown error'}`, 'error');
      } finally {
         setLoadingState(null);
      }
   };

   // Download as high-resolution PNG image(s)
   const downloadPNG = async () => {
      if (onBeforeDownload) {
         const canDownload = await onBeforeDownload();
         if (!canDownload) return;
      }

      const validPapers = getValidPapers();
      if (validPapers.length === 0) {
         showNotification('Letterhead sheet element not found', 'error');
         return;
      }

      setLoadingState('png');
      const cleanRefName = (referenceNumber || 'Memo').replace(/[/\\?%*:|"<>]/g, '-');
      const total = validPapers.length;

      try {
         for (let i = 0; i < total; i++) {
            const paper = validPapers[i];
            const pageNum = i + 1;
            const dataUrl = await capturePaper(paper);

            const link = document.createElement('a');
            link.download = total > 1
               ? `${cleanRefName}_Page_${pageNum}.png`
               : `${cleanRefName}.png`;
            link.href = dataUrl;
            link.click();

            if (i < total - 1) {
               await new Promise(r => setTimeout(r, 300));
            }
         }

         showNotification(
            total > 1 ? `Downloaded ${total} sheets as PNG!` : 'PNG downloaded successfully!',
            'success'
         );
      } catch (error) {
         console.error('PNG export error:', error);
         showNotification(`PNG download failed: ${error.message || 'Unknown error'}`, 'error');
      } finally {
         setLoadingState(null);
      }
   };

   const rawRefs = (Array.isArray(elementRefs) && elementRefs.length > 0)
      ? elementRefs
      : (elementRef ? [elementRef] : []);
   const totalSheets = rawRefs.length || 1;
   const isLoading = Boolean(loadingState);

   return (
      <>
         {notification && <Notification message={notification.message} type={notification.type} />}

         <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
               <button
                  type="button"
                  aria-label="Download Memo"
                  disabled={isLoading}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all duration-300 ease-out active:scale-[0.98] disabled:active:scale-100 shadow-sm ${
                     isLoading ? 'bg-primary/75 cursor-not-allowed' : 'bg-primary/95 hover:bg-primary cursor-pointer'
                  }`}
               >
                  {isLoading ? (
                     <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{loadingState === 'pdf' ? 'Generating PDF...' : 'Exporting PNG...'}</span>
                     </>
                  ) : (
                     <>
                        <FileDown size={18} />
                        <span>Download</span>
                        <ChevronDown size={15} className="text-white/80 -mr-0.5" />
                     </>
                  )}
               </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
               <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-50 min-w-[240px] p-2 bg-white rounded-2xl shadow-xl border border-slate-200/90 focus:outline-hidden"
               >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                     Select Format
                  </div>

                  {/* Option 1: PDF Document */}
                  <DropdownMenu.Item
                     onSelect={downloadPDF}
                     className="flex items-center gap-3 p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 focus:bg-slate-50 cursor-pointer outline-hidden transition group"
                  >
                     <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0 group-hover:scale-105 transition-transform">
                        <FileText size={18} />
                     </div>
                     <div className="flex flex-col text-left">
                        <span className="font-semibold text-xs text-slate-900">PDF Document (.pdf)</span>
                        <span className="text-[11px] text-slate-500">
                           {totalSheets > 1
                              ? `All ${totalSheets} sheets in 1 document`
                              : 'Official A4 printable document'}
                        </span>
                     </div>
                  </DropdownMenu.Item>

                  {/* Option 2: PNG Images */}
                  <DropdownMenu.Item
                     onSelect={downloadPNG}
                     className="flex items-center gap-3 p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 focus:bg-slate-50 cursor-pointer outline-hidden transition group mt-1"
                  >
                     <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                        <Image size={18} />
                     </div>
                     <div className="flex flex-col text-left">
                        <span className="font-semibold text-xs text-slate-900">PNG Image(s) (.png)</span>
                        <span className="text-[11px] text-slate-500">
                           {totalSheets > 1
                              ? `Separate .png for each sheet`
                              : 'High-resolution graphic format'}
                        </span>
                     </div>
                  </DropdownMenu.Item>
               </DropdownMenu.Content>
            </DropdownMenu.Portal>
         </DropdownMenu.Root>
      </>
   );
}

export default DownloadBtn;
