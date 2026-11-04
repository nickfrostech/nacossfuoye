'use client';

import { useState, useRef } from 'react';
import useScale from '@/hooks/useScale';
import { ImagePlus, FileDown } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Notification from '@/components/Notification';
import { toPng } from 'html-to-image';
import ImageCropperModal from '@/components/ImageCropperModal';
import BirthdayFlyer from '@/components/BirthdayFlyer';
import { BIRTHDAY_CONFIGS } from '@/lib/birthday-configs';

export default function BirthdayForm({ templateType = 'executive', hideHeader = false }) {
   const [firstname, setFirstname] = useState('The');
   const [lastname, setLastname] = useState('Binaries');
   const [post, setPost] = useState('200 Level');
   const [date, setDate] = useState('Jan 01');

   const [rawImage, setRawImage] = useState(null);
   const [imagePreview, setImagePreview] = useState(null);
   const [isGenerating, setIsGenerating] = useState(false);
   const [notification, setNotification] = useState(null);

   const flyerRef = useRef(null);
   const previewWrapperRef = useRef(null);

   useScale({ letterHeadRef: flyerRef, previewRef: previewWrapperRef, baseWidth: 3000 });

   const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
         showNotification('Please upload a valid image file.', 'error');
         return;
      }

      if (file.size > 10 * 1024 * 1024) {
         showNotification('Image must be less than 10MB.', 'error');
         return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
         setRawImage(reader.result);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
   };

   const showNotification = (message, type) => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
   };

   const downloadFlyer = async () => {
      setIsGenerating(true);

      const config = BIRTHDAY_CONFIGS[templateType] || BIRTHDAY_CONFIGS['executive'];

      await new Promise((resolve) => {
         const img = new Image();
         img.onload = resolve;
         img.onerror = resolve;
         img.src = config.bgHigh;
      });

      const paper = flyerRef.current;

      if (!paper) {
         showNotification('Template not found', 'error');
         setIsGenerating(false);
         return;
      }

      const originalTransform = paper.style.transform;
      const originalOrigin = paper.style.transformOrigin;
      const originalTransition = paper.style.transition;

      try {
         paper.dataset.scalingPaused = 'true';

         paper.style.transition = 'none';
         paper.style.transform = 'none';
         paper.style.transformOrigin = 'top left';

         await new Promise(r => setTimeout(r, 800));

         const dataUrl = await toPng(paper, {
            pixelRatio: 1,
            backgroundColor: '#ffffff',
         });

         const link = document.createElement('a');
         link.download = `${firstname}_${lastname}_Birthday.png`;
         link.href = dataUrl;
         link.click();

         showNotification('Flyer downloaded successfully!', 'success');
      } catch (error) {
         console.error('Download error:', error);
         showNotification(`Download failed: ${error.message}`, 'error');
      } finally {
         delete paper.dataset.scalingPaused;
         paper.style.transform = originalTransform;
         paper.style.transformOrigin = originalOrigin;
         paper.style.transition = originalTransition;

         setIsGenerating(false);
      }
   };

   return (
      <div className="relative pt-4 sm:pt-6">
         {notification && <Notification message={notification.message} type={notification.type} />}

         {rawImage && (
            <ImageCropperModal
               imageSrc={rawImage}
               aspect={templateType === 'outsiders' ? 1193 / 1300 : 926 / 1270}
               onComplete={(croppedImg) => {
                  setImagePreview(croppedImg);
                  setRawImage(null);
               }}
               onCancel={() => setRawImage(null)}
            />
         )}

         {hideHeader ? (
            <div className="flex justify-end items-center mb-6">
               <button
                  onClick={downloadFlyer}
                  disabled={isGenerating}
                  className={`inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 ease-out active:scale-[0.98] ${isGenerating ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover shadow-md'}`}
               >
                  {isGenerating ? (
                     <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                     </div>
                  ) : (
                     <div className="flex items-center gap-2">
                        <FileDown size={20} />
                        Download Flyer
                     </div>
                  )}
               </button>
            </div>
         ) : (
            <PageHeader title={`${templateType.toUpperCase()} Birthday Template`}>
               <div className="flex flex-wrap items-center gap-3">
                  <button
                     onClick={downloadFlyer}
                     disabled={isGenerating}
                     className={`inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 ease-out active:scale-[0.98] ${isGenerating ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'}`}
                  >
                     {isGenerating ? (
                        <div className="flex items-center gap-2">
                           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           Generating...
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                           <FileDown size={20} />
                           Download Flyer
                        </div>
                     )}
                  </button>
               </div>
            </PageHeader>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 items-start mt-4">
            <aside className="p-6 rounded-2xl bg-white shadow-xl lg:sticky lg:top-32 border border-slate-100">
               <h3 className="text-lg font-bold text-slate-800 mb-6">Flyer Details</h3>
               <div className="space-y-5">
                  <div>
                     <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Picture</span>
                     <label htmlFor="birthday-photo-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary/40 rounded-xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-primary">
                           {imagePreview ? (
                              <img src={imagePreview} alt="Preview" className="h-28 object-contain rounded-md" />
                           ) : (
                              <>
                                 <ImagePlus size={32} className="mb-2 opacity-70" />
                                 <p className="text-sm font-semibold">Upload Photo</p>
                                 <p className="text-xs opacity-70 mt-1">Max 10MB</p>
                              </>
                           )}
                        </div>
                        <input id="birthday-photo-upload" aria-label="Upload photo" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                     </label>
                  </div>

                  <div>
                     <label htmlFor="bf-firstname" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
                     <input
                        id="bf-firstname"
                        aria-label="First Name"
                        type="text"
                        value={firstname}
                        onChange={e => setFirstname(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all duration-300 text-slate-900 bg-slate-50 focus:bg-white"
                     />
                  </div>

                  <div>
                     <label htmlFor="bf-lastname" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
                     <input
                        id="bf-lastname"
                        aria-label="Last Name"
                        type="text"
                        value={lastname}
                        onChange={e => setLastname(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all duration-300 text-slate-900 bg-slate-50 focus:bg-white"
                     />
                  </div>

                  <div>
                     <label htmlFor="bf-post" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Post or Level</label>
                     <input
                        id="bf-post"
                        aria-label="Post or Level"
                        type="text"
                        value={post}
                        onChange={e => setPost(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all duration-300 text-slate-900 bg-slate-50 focus:bg-white"
                     />
                  </div>

                  <div>
                     <label htmlFor="bf-date" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date (e.g. Jan 01)</label>
                     <input
                        id="bf-date"
                        aria-label="Date"
                        type="text"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all duration-300 text-slate-900 bg-slate-50 focus:bg-white"
                     />
                  </div>
               </div>
            </aside>

            <main className="shadow-2xl rounded-2xl w-full relative flex flex-col min-w-0 bg-slate-100 overflow-hidden border border-slate-200">
               <div ref={previewWrapperRef} className="w-full relative aspect-square">
                  <BirthdayFlyer 
                     type={templateType}
                     flyerRef={flyerRef}
                     isGenerating={isGenerating}
                     imagePreview={imagePreview}
                     firstname={firstname}
                     lastname={lastname}
                     post={post}
                     date={date}
                  />
               </div>

               {isGenerating && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
                     <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                     <p className="text-xl font-bold font-raleway">Rendering High-Quality Image...</p>
                  </div>
               )}
            </main>
         </div>
      </div>
   );
}
