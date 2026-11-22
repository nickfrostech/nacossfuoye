import { Eye, EyeOff, Trash, SquarePen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MemoCard({ reference, head, date, is_published, onToggleVisibility, href, isAdminView = false, type = 'executive' }) {
   const shortHead = head?.length > 50 ? `${head.substring(0, 50).toUpperCase().trim()}...` : head?.toUpperCase();
   const isDraft = !is_published;
   const bgClasses = isDraft ? 'bg-red-600/95 border-red-400/30 text-white' : 'bg-primary/95 border-white/20 text-white';

   const d = new Date(date);
   const formattedDate = isNaN(d.getTime())
      ? date
      : `${DAYS[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;

   const CardContent = (
      <div className={`relative h-full flex flex-col p-4 rounded-2xl overflow-hidden border transition-[transform] duration-300 ease-out active:scale-[0.98] group ${bgClasses} backdrop-blur-md`}>
         {/* Expanding Circle Background */}
         <div className="absolute -top-15 -right-6 w-35 h-35 bg-black/10 rounded-full transition-transform duration-800 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[20] origin-center pointer-events-none" />

         {/* Content Container (z-10) */}
         <div className="relative z-10 flex flex-col h-full">
            {isDraft && !isAdminView && (
               <div className="absolute -top-3 -right-3 bg-red-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Draft
               </div>
            )}

            {/* Header: Ref & Date */}
            <div className="flex items-start justify-between mb-4">
               <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs text-white backdrop-blur-sm border border-white/10">
                     {reference}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/80 font-bold uppercase tracking-wider backdrop-blur-sm border border-white/5">
                     {type}
                  </span>
               </div>
               {!isAdminView ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-white/80 font-medium uppercase tracking-wide">
                     {formattedDate}
                  </span>
               ) : (
                  <span className="text-xs font-medium text-white/80 uppercase tracking-wide">
                     {formattedDate}
                  </span>
               )}
            </div>

            {/* Center: Heading */}
            <div className="flex flex-col flex-1 justify-center py-4">
               <h3 className="text-base font-semibold text-white leading-snug">
                  {shortHead}
               </h3>
            </div>

            {/* Footer: Actions */}
            <div className="mt-auto flex justify-between items-center border-t border-white/20 pt-4">
               {isAdminView ? (
                  <>
                     <div className="flex items-center gap-2">
                        <Link
                           href={`/admin/view/${encodeURIComponent(reference)}`}
                           onClick={(e) => e.stopPropagation()}
                           className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all shadow-2xs"
                           title="View and Download Memo"
                        >
                           <Eye size={13} />
                           <span>View</span>
                        </Link>
                        <Link
                           href={`/admin/edit/${encodeURIComponent(reference)}`}
                           onClick={(e) => e.stopPropagation()}
                           className="p-1.5 text-white/80 hover:text-white bg-white/5 hover:bg-white/20 rounded-full cursor-pointer transition-colors backdrop-blur-sm border border-white/10"
                           aria-label="Edit Memo"
                           title="Edit Memo"
                        >
                           <SquarePen size={16} />
                        </Link>
                     </div>
                     <div className="flex gap-2">
                        <button
                           onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleVisibility(reference, is_published); }}
                           className={`p-1.5 rounded-full cursor-pointer transition-colors backdrop-blur-sm border border-white/10 ${is_published ? 'text-white/80 hover:text-white bg-white/5 hover:bg-white/20' : 'text-white bg-white/20 hover:bg-white/30'}`}
                           title={is_published ? "Unpublish" : "Publish"}
                        >
                           {is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                     </div>
                  </>
               ) : (
                  <>
                     <div className="p-2 rounded-full text-white/80 group-hover:text-white bg-white/5 group-hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
                     </div>
                     <div className="flex items-center text-sm font-medium text-white opacity-90 group-hover:opacity-100 transition-opacity">
                        Read Memo <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1 duration-300 ease-out" />
                     </div>
                  </>
               )}
            </div>
         </div>
      </div>
   );

   const targetHref = href || (isAdminView ? `/admin/view/${encodeURIComponent(reference)}` : null);

   if (targetHref) {
      return (
         <Link href={targetHref} className="group block h-full">
            {CardContent}
         </Link>
      );
   }

   return CardContent;
}