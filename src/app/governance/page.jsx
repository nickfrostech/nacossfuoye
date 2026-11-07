'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
   ArrowRight,
   Phone,
   Twitter,
   Linkedin,
   UserCircle2,
   Users,
   Vote,
   ShieldCheck,
   FileText
} from 'lucide-react';
import { ManQuestion, EmptyBox, EmployeesOffice } from '@esvigy/react';
import stakeholdersData from '@/data/stakeholders.json';

export default function GovernancePage() {
   const [activeTab, setActiveTab] = useState('stakeholders'); // 'stakeholders' | 'voting'

   // Sort categories by priority immutably
   const sortedCategories = stakeholdersData.categories.toSorted((a, b) => a.priority - b.priority);

   return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
         {/* Governance Hero Section (solid bg-green-700 with EmployeesOffice watermark) */}
         <section className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-green-700 p-6 sm:p-10 md:p-14 mb-10 text-white">
            {/* Background Watermark EmployeesOffice SVG from @esvigy/react */}
            <div className="absolute -right-8 -bottom-12 sm:-right-12 sm:-bottom-16 md:-right-16 md:-bottom-20 lg:-right-12 lg:-bottom-16 w-72 h-72 sm:w-96 sm:h-96 md:w-120 md:h-120 lg:w-xl lg:h-144 opacity-20 pointer-events-none select-none">
               <EmployeesOffice
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
                  Governance &amp; <br />
                  <span className="text-white">
                     Election Center
                  </span>
               </h1>

               <p className="text-green-50 text-base sm:text-lg leading-relaxed max-w-xl mx-auto sm:mx-0 font-medium">
                  Connect with the executive council and student representatives, review electoral guidelines, and exercise your democratic franchise during departmental elections.
               </p>

               {/* Call to Action Buttons */}
               <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3.5">
                  <button
                     type="button"
                     onClick={() => {
                        setActiveTab('stakeholders');
                        document.getElementById('governance-content')?.scrollIntoView({ behavior: 'smooth' });
                     }}
                     className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-green-800 font-bold text-sm shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                     <span>Leadership Directory</span>
                     <ArrowRight size={18} />
                  </button>

                  <button
                     type="button"
                     onClick={() => {
                        setActiveTab('voting');
                        document.getElementById('governance-content')?.scrollIntoView({ behavior: 'smooth' });
                     }}
                     className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/20 backdrop-blur-xs transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                     <Vote size={16} className="text-white" />
                     <span>Election &amp; Voting Center</span>
                  </button>
               </div>
            </div>
         </section>

         {/* Navigation Tabs */}
         <div id="governance-content" className="scroll-mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="w-full sm:w-auto p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
               <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5">
                  <button
                     type="button"
                     onClick={() => setActiveTab('stakeholders')}
                     className={`w-full sm:w-auto px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.98] ${
                        activeTab === 'stakeholders'
                           ? 'bg-green-700 text-white shadow-xs'
                           : 'text-slate-600 hover:text-green-800'
                     }`}
                  >
                     <Users size={16} className="shrink-0" />
                     <span className="sm:hidden">Leadership</span>
                     <span className="hidden sm:inline">Leadership &amp; Stakeholders</span>
                  </button>

                  <button
                     type="button"
                     onClick={() => setActiveTab('voting')}
                     className={`w-full sm:w-auto px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.98] ${
                        activeTab === 'voting'
                           ? 'bg-green-700 text-white shadow-xs'
                           : 'text-slate-600 hover:text-green-800'
                     }`}
                  >
                     <Vote size={16} className="shrink-0" />
                     <span className="sm:hidden">Voting Center</span>
                     <span className="hidden sm:inline">Election Voting Center</span>
                  </button>
               </div>
            </div>
         </div>

         {/* TAB 1: LEADERSHIP & STAKEHOLDERS DIRECTORY */}
         {activeTab === 'stakeholders' && (
            <div className="space-y-24 mb-16">
               {sortedCategories.map((category) => (
                  <section id={category.id} key={category.id} className="scroll-mt-8 animate-in fade-in duration-500">
                     <div className="mb-10 text-center space-y-3">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                           {category.name}
                        </h2>
                        <div className="w-20 h-1.5 bg-green-600 mx-auto rounded-full"></div>
                     </div>

                     {category.members.length > 0 ? (
                        <div className={`grid gap-6 ${category.id === 'executive' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'}`}>
                           {category.members.map((member) => (
                              <div 
                                 key={`${category.id}-${member.name}-${member.post}`}
                                 className="group relative flex flex-col bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                              >
                                 {/* Image Container */}
                                 <div className="relative w-full aspect-4/5 bg-slate-100 overflow-hidden">
                                    {member.image ? (
                                       <Image 
                                          src={member.image} 
                                          alt={member.name} 
                                          fill
                                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                          unoptimized
                                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                       />
                                    ) : (
                                       <div className="w-full h-full flex items-center justify-center text-slate-300">
                                          <UserCircle2 size={100} strokeWidth={1} />
                                       </div>
                                    )}
                                    
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                    
                                    {/* Overlay Details (Socials & Phone) */}
                                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2.5">
                                       {member.phone && (
                                          <a href={`tel:${member.phone}`} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-green-800 transition-colors" title="Call">
                                             <Phone size={15} />
                                          </a>
                                       )}
                                       {member.socials?.twitter && (
                                          <a href={`https://x.com/${member.socials.twitter}`} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-green-800 transition-colors" title="X/Twitter">
                                             <Twitter size={15} />
                                          </a>
                                       )}
                                       {member.socials?.linkedin && (
                                          <a href={`https://linkedin.com/in/${member.socials.linkedin}`} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-green-800 transition-colors" title="LinkedIn">
                                             <Linkedin size={15} />
                                          </a>
                                       )}
                                    </div>
                                 </div>

                                 {/* Content Details */}
                                 <div className="p-5 flex flex-col justify-between flex-1 bg-white">
                                    <div>
                                       <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2.5 py-1 rounded-md mb-2">
                                          {member.post}
                                       </span>
                                       <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                                          {member.name}
                                       </h3>
                                    </div>
                                    
                                    {member.level && (
                                       <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                          <span>Class</span>
                                          <span className="font-bold text-slate-700">{member.level}</span>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-12 px-4 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col items-center justify-center">
                           <ManQuestion animated={true} color="#15803d" secondaryColor="rgba(21,128,61,0.08)" className="w-24 h-24 mb-3" />
                           <p className="text-slate-700 font-semibold text-lg">Profiles Updating Soon</p>
                           <p className="text-slate-400 font-medium text-xs sm:text-sm mt-1 max-w-sm">The department secretariat is compiling the verified directory for this category.</p>
                        </div>
                     )}
                  </section>
               ))}
            </div>
         )}

         {/* TAB 2: ELECTION CENTER (EMPTY STATE: NO VOTE YET) */}
         {activeTab === 'voting' && (
            <div className="space-y-10 mb-16">
               {/* Empty State Card */}
               <div className="border border-slate-200 rounded-3xl p-8 sm:p-14 shadow-xs text-center flex flex-col items-center justify-center mx-auto space-y-4">
                  <EmptyBox
                     animated={true}
                     color="#15803d"
                     secondaryColor="rgba(21,128,61,0.12)"
                     className="w-32 h-32 sm:w-40 sm:h-40 mb-2"
                  />
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                     No Ongoing Elections Yet
                  </h3>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-md font-medium">
                     There are currently no active departmental elections or live ballots in session. The Electoral Commission (ELECOM) will open the portal for voter accreditation and candidate voting when election dates are declared.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                     <Link
                        href="/memos"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow-xs transition-all active:scale-95"
                     >
                        <span>Check ELECOM Circulars</span>
                        <ArrowRight size={16} />
                     </Link>

                     <button
                        type="button"
                        onClick={() => {
                           setActiveTab('stakeholders');
                           document.getElementById('governance-content')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-95 cursor-pointer"
                     >
                        <span>View Leadership Directory</span>
                     </button>
                  </div>
               </div>

               {/* Electoral Information Guidelines */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                     <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
                        <ShieldCheck size={20} />
                     </div>
                     <h4 className="text-lg font-bold text-slate-900">Electoral Code &amp; Screening</h4>
                     <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        All prospective aspirants will undergo academic standing clearance, constitutional vetting, and screening supervised by the Staff Patron and ELECOM.
                     </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                     <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
                        <Vote size={20} />
                     </div>
                     <h4 className="text-lg font-bold text-slate-900">Transparent Digital Voting</h4>
                     <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        During elections, student voting is authenticated with verified matriculation numbers, ensuring one-student-one-vote transparency and preventing proxy voting.
                     </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                     <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
                        <FileText size={20} />
                     </div>
                     <h4 className="text-lg font-bold text-slate-900">Official Certification</h4>
                     <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        Final election results and winner declarations are signed and published officially under the Memos section upon conclusion of voting.
                     </p>
                  </div>
               </div>
            </div>
         )}
      </main>
   );
}
