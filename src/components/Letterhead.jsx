import DOMPurify from 'dompurify';

import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

const MEMO_CONFIGS = {
   executive: {
      background: '/letterheads/executive_letter_head.svg',
      referenceClass: 'absolute text-[12pt] text-black font-raleway font-extrabold text-left',
      referenceStyle: { top: '183px', left: '128px' },
      dateClass: 'absolute text-[12pt] text-black font-raleway font-extrabold text-left',
      dateStyle: { top: '183px', left: '605px' },
      contentClass: 'absolute font-medium text-[14pt] w-[85%] text-left -translate-x-1/2 text-black leading-tight',
      contentStyle: { top: '245px', left: '50%' }
   },
   src: {
      background: '/letterheads/src_letter_head.svg',
      referenceClass: 'absolute text-[12pt] text-black font-raleway text-left font-bold',
      referenceStyle: { top: '120px', left: '570px' },
      dateClass: 'absolute text-[12pt] text-black font-raleway font-bold text-left',
      dateStyle: { top: '87px', left: '580px' },
      contentClass: 'absolute font-medium text-[14pt] w-[85%] text-left -translate-x-1/2 text-black leading-tight',
      contentStyle: { top: '220px', left: '50%' }
   },
   elecom: {
      background: '/letterheads/elecom_letter_head.svg',
      referenceClass: 'absolute text-[12pt] text-white font-raleway text-left font-bold',
      referenceStyle: { top: '84px', left: '495px' },
      dateClass: 'absolute text-[12pt] text-white font-raleway text-left font-bold',
      dateStyle: { top: '84px', left: '670px' },
      contentClass: 'absolute font-medium text-[14pt] w-[85%] text-left -translate-x-1/2 text-black leading-tight',
      contentStyle: { top: '240px', left: '50%' }
   },
   president: {
      background: '/letterheads/president_letter_head.svg',
      referenceClass: 'absolute text-[12pt] text-black font-bold font-raleway text-left',
      referenceStyle: { top: '183px', left: '138px' },
      dateClass: 'absolute text-[12pt] text-black font-bold font-raleway text-left',
      dateStyle: { top: '183px', left: '585px' },
      contentClass: 'absolute font-medium text-[14pt] w-[80%] text-left -translate-x-1/2 text-black leading-tight',
      contentStyle: { top: '250px', left: '50%' }
   }
};

function formatCustomDate(dateString) {
   if (!dateString) return '';
   const dateObj = new Date(dateString);
   if (isNaN(dateObj)) return dateString; // return as-is if it's not a valid date

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

function Letterhead({ date, referenceNumber, content, letterHeadRef, viewMode, setContent, type = 'executive', toolbarPortalRef }) {
   const config = MEMO_CONFIGS[type] || MEMO_CONFIGS['executive'];

   return (
      <section
         className="absolute top-0 left-0 origin-top-left overflow-hidden bg-white"
         ref={letterHeadRef}
         style={{ width: '794px', height: '1123px' }}
      >
         <img src={config.background} alt={`${type} Letterhead template`} className="pointer-events-none absolute inset-0 w-full h-full object-cover" />
         <div className="absolute inset-0 z-10">

            <div className={config.referenceClass} style={config.referenceStyle}>{referenceNumber}</div>

            <div className={config.dateClass} style={config.dateStyle}>{formatCustomDate(date)}</div>

            {viewMode === 'document' ? (
               <div className={`${config.contentClass} memo-letterhead-content`} style={config.contentStyle}>
                  <SimpleEditor content={content} setContent={setContent} mode="document" toolbarPortalRef={toolbarPortalRef} />
               </div>
            ) : (
               <div className={`${config.contentClass} memo-letterhead-content tiptap ProseMirror`} style={config.contentStyle} dangerouslySetInnerHTML={{ __html: typeof window !== 'undefined' ? DOMPurify.sanitize(content) : content }} />
            )}
         </div>
      </section>
   );
}

export default Letterhead;