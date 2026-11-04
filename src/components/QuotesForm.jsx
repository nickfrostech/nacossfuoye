'use client';

import React, { useState, useRef } from 'react';
import { FileDown } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Notification from '@/components/Notification';
import { toPng } from 'html-to-image';
import QuotesFlyer from '@/components/QuotesFlyer';
import useScale from '@/hooks/useScale';
import { createClient } from '@/utils/supabase/client';

export default function QuotesForm({ templateType = 'dyk', hideHeader = false }) {
   const [message, setMessage] = useState('');
   const [isGenerating, setIsGenerating] = useState(false);
   const [notification, setNotification] = useState(null);

   const flyerRef = useRef(null);
   const previewWrapperRef = useRef(null);
   const supabase = createClient();

   useScale({ letterHeadRef: flyerRef, previewRef: previewWrapperRef, baseWidth: 3000 });

   const showNotification = (msg, type = 'success') => {
      setNotification({ message: msg, type });
      setTimeout(() => setNotification(null), 3000);
   };

   const updateSupabase = async (content) => {
      try {
         // The user mentioned a single table "quotes" with 2 fields, likely id=1
         const updatePayload = templateType === 'dyk' 
            ? { dyk: content }
            : { invest_friday: content };

         const { error } = await supabase
            .from('quotes')
            .update(updatePayload)
            .eq('id', 1); // Assuming single row setup
            
         if (error) {
            console.error('Supabase update error:', error);
         }
      } catch (err) {
         console.error('Supabase catch error:', err);
      }
   };

   const downloadFlyer = async () => {
      if (!flyerRef.current) return;
      
      try {
         setIsGenerating(true);
         
         const dataset = document.documentElement.dataset;
         dataset.scalingPaused = "true";

         // Give React a moment to apply the isGenerating state (hiding low-res, showing high-res)
         await new Promise(resolve => setTimeout(resolve, 500));

         const flyerEl = flyerRef.current;
         const originalTransform = flyerEl.style.transform;
         flyerEl.style.transform = 'none';

         const dataUrl = await toPng(flyerEl, {
            quality: 1.0,
            pixelRatio: 1,
            width: 3000,
            height: 3000,
            style: {
               transform: 'none',
               transformOrigin: 'top left',
               width: '3000px',
               height: '3000px',
            }
         });

         flyerEl.style.transform = originalTransform;
         dataset.scalingPaused = "false";
         
         const link = document.createElement('a');
         link.download = `NACOSS_${templateType}_${Date.now()}.png`;
         link.href = dataUrl;
         link.click();
         
         showNotification('Design downloaded successfully!');

         // Update database so public portal scrolling marquee reflects this latest quote
         await updateSupabase(message);

      } catch (error) {
         console.error('Error generating image:', error);
         showNotification('Failed to generate image. Please try again.', 'error');
         document.documentElement.dataset.scalingPaused = "false";
      } finally {
         setIsGenerating(false);
      }
   };

   const title = templateType === 'dyk' ? 'Do You Know' : 'Invest Friday';

   return (
      <div className="w-full max-w-7xl mx-auto space-y-8 pb-20 relative pt-4 sm:pt-6">
         {notification && (
            <Notification
               message={notification.message}
               type={notification.type}
               onClose={() => setNotification(null)}
            />
         )}

         {hideHeader ? (
            <div className="flex justify-end items-center mb-6">
               <button
                  type="button"
                  onClick={downloadFlyer}
                  disabled={isGenerating}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all duration-300 active:scale-95 cursor-pointer ${
                     isGenerating ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover hover:shadow-primary/25'
                  }`}
               >
                  {isGenerating ? (
                     <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                     </>
                  ) : (
                     <>
                        <FileDown size={20} />
                        Download Design
                     </>
                  )}
               </button>
            </div>
         ) : (
            <PageHeader title={`${title} Template`}>
               <div className="flex flex-wrap items-center gap-3">
                  <button
                     type="button"
                     onClick={downloadFlyer}
                     disabled={isGenerating}
                     className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 active:scale-95 ${
                        isGenerating ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover hover:shadow-primary/25'
                     }`}
                  >
                     {isGenerating ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           Generating...
                        </>
                     ) : (
                        <>
                           <FileDown size={20} />
                           Download Design
                        </>
                     )}
                  </button>
               </div>
            </PageHeader>
         )}

         <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Form Controls */}
            <div className="w-full lg:w-1/3 space-y-6">
               <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-200/60 lg:sticky lg:top-32">
                  <div className="mb-6 pb-4 border-b border-slate-100">
                     <h2 className="text-lg font-bold text-slate-800">Content Editor</h2>
                     <p className="text-sm text-slate-500 mt-1">Update the message for your design</p>
                  </div>

                  <div className="space-y-5">
                     <div>
                        <label htmlFor="quotes-message" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                        <textarea
                           id="quotes-message"
                           aria-label="Message"
                           value={message}
                           onChange={(e) => setMessage(e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-48"
                           placeholder="Type your message here..."
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Preview Section */}
            <div className="w-full lg:w-2/3">
               <div className="bg-slate-100 rounded-3xl p-4 sm:p-8 border border-slate-200/60 flex items-center justify-center overflow-hidden min-h-125">
                  <div
                     ref={previewWrapperRef}
                     className="relative bg-white shadow-2xl overflow-hidden"
                     style={{
                        width: '3000px',
                        height: '3000px',
                        transformOrigin: 'top left'
                     }}
                  >
                     <QuotesFlyer
                        type={templateType}
                        flyerRef={flyerRef}
                        isGenerating={isGenerating}
                        message={message}
                     />
                  </div>
               </div>
               <p className="text-center text-sm font-medium text-slate-400 mt-4">
                  Live Preview • High resolution version will be generated on download
               </p>
            </div>
         </div>
      </div>
   );
}
