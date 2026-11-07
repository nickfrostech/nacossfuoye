'use client';

import { useState } from 'react';
import {
   ArrowRight,
   Cake
} from 'lucide-react';
import { BalloonPackage } from '@esvigy/react';
import BirthdayForm from '@/components/BirthdayForm';

const AVAILABLE_GRAPHICS = [
   {
      id: 'birthday-student',
      title: 'Student Birthday Flyer',
      desc: 'Create official departmental celebration flyers for students with custom photo cropper, name, class level, and birth date.',
      available: true,
   },
   {
      id: 'cert-hackathon',
      title: 'Verifiable Hackathon Certificate',
      desc: 'Tamper-proof digital credentials with unique student verification QR codes and hashes for hackathon winners and participants.',
      available: false,
   },
   {
      id: 'cert-workshop',
      title: 'Bootcamp & Workshop Attendance',
      desc: 'Personalized certificates of completion for departmental technical bootcamps, masterclasses, and code clinics.',
      available: false,
   },
];

export default function GraphicsPage() {
   const [selectedGraphic, setSelectedGraphic] = useState(null);

   return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
         {/* Graphics Studio Hero Section (solid bg-purple-700 with BalloonPackage watermark) */}
         <section className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-purple-700 p-6 sm:p-10 md:p-14 mb-10 text-white">
            {/* Background Watermark BalloonPackage SVG from @esvigy/react */}
            <div className="absolute -right-8 -bottom-12 sm:-right-12 sm:-bottom-16 md:-right-16 md:-bottom-20 lg:-right-12 lg:-bottom-16 w-72 h-72 sm:w-96 sm:h-96 md:w-120 md:h-120 lg:w-xl lg:h-144 opacity-20 pointer-events-none select-none">
               <BalloonPackage
                  animated={true}
                  color="#ffffff"
                  secondaryColor="rgba(255,255,255,0.2)"
                  className="w-full h-full"
               />
            </div>

            {/* Foreground Details & Call to Action */}
            <div className="relative z-10 max-w-3xl space-y-5 text-center sm:text-left">
               <p className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white/90">
                  Department of Computer Science &bull; FUOYE
               </p>

               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                  Graphics Studio &amp; <br />
                  <span className="text-white">
                     Celebration Hub
                  </span>
               </h1>

               <p className="text-purple-100 text-base sm:text-lg leading-relaxed max-w-xl mx-auto sm:mx-0 font-medium">
                  Select and generate official departmental celebration designs, social media flyers, educational quotes, and upcoming verifiable certificates.
               </p>

               {/* Call to Action Buttons */}
               <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3.5">
                  <button
                     type="button"
                     onClick={() => {
                        setSelectedGraphic(null);
                        document.getElementById('graphics-workspace')?.scrollIntoView({ behavior: 'smooth' });
                     }}
                     className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-purple-800 font-bold text-sm shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                     <span>Explore Available Graphics</span>
                     <ArrowRight size={18} />
                  </button>

                  <button
                     type="button"
                     onClick={() => {
                        setSelectedGraphic('birthday-student');
                        document.getElementById('graphics-workspace')?.scrollIntoView({ behavior: 'smooth' });
                     }}
                     className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/20 backdrop-blur-xs transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                     <Cake size={16} className="text-white" />
                     <span>Birthday Flyer Studio</span>
                  </button>
               </div>
            </div>
         </section>

         {/* GRAPHICS WORKSPACE SECTION */}
         <div id="graphics-workspace" className="scroll-mt-6 mb-16">
            {selectedGraphic ? (
               /* GENERATOR VIEW (REPLACES THE CARDS SECTION) */
               <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-xs">
                  {selectedGraphic === 'birthday-student' && (
                     <BirthdayForm templateType="outsiders" hideHeader={true} />
                  )}
               </div>
            ) : (
               /* AVAILABLE GRAPHICS CARDS GRID */
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {AVAILABLE_GRAPHICS.map((item) => (
                     <div
                        key={item.id}
                        className={`flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border transition-all duration-300 shadow-xs ${
                           item.available
                              ? 'border-slate-200 hover:border-purple-300 hover:shadow-md'
                              : 'border-slate-200/60 opacity-75'
                        }`}
                     >
                        <div className="space-y-2">
                           <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                              {item.title}
                           </h3>
                           <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                              {item.desc}
                           </p>
                        </div>

                        <div className="pt-4 mt-6 border-t border-slate-100">
                           {item.available ? (
                              <button
                                 type="button"
                                 onClick={() => {
                                    setSelectedGraphic(item.id);
                                    document.getElementById('graphics-workspace')?.scrollIntoView({ behavior: 'smooth' });
                                 }}
                                 className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-98 cursor-pointer"
                              >
                                 <span>Generate Flyer</span>
                                 <ArrowRight size={15} />
                              </button>
                           ) : (
                              <div className="w-full py-2.5 px-4 rounded-xl bg-slate-50 text-slate-400 font-bold text-xs text-center border border-slate-200/50">
                                 Coming Soon
                              </div>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </main>
   );
}
