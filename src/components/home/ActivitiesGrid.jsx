'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
   Announcement,
   DocumentFolders,
   WomanLaptop,
   GroupBrainstorming,
   EmployeesOffice,
   GamePad,
   BalloonPackage
} from '@esvigy/react';

export default function ActivitiesGrid() {
   return (
      <>
         <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mt-4'>Activities &amp; Portals</h2>
         <p className='text-slate-500 text-sm sm:text-base font-medium mt-1 max-w-xl'>
            Explore the specialized academic, technical, governance, and creative hubs powered by NACOSS FUOYE.
         </p>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mt-4">
            {/* 1. Official Memos Card - Rich Official Emerald */}
            <Link
               href="/memos"
               className="relative group flex flex-col p-8 rounded-3xl overflow-hidden border border-white/20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:z-20 active:scale-[0.98] bg-emerald-700 text-white min-h-70"
            >
               <div className="absolute -bottom-10 -right-10 opacity-20 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 pointer-events-none">
                  <Announcement animated={true} color="#ffffff" secondaryColor="rgba(255,255,255,0.2)" className="w-64 h-64" />
               </div>

               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex flex-col flex-1 py-1">
                     <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-3 tracking-tight">
                        Official Memos
                     </h3>
                     <p className="text-white/85 text-sm sm:text-base font-medium leading-relaxed max-w-[90%]">
                        View verified departmental directives, executive notices, circulars, and committee announcements.
                     </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between">
                     <div className="flex items-center text-sm font-bold text-white/95 group-hover:text-white transition-colors">
                        <span>Read Memos</span>
                        <ArrowRight size={17} className="ml-2 transition-transform duration-300 ease-out group-hover:translate-x-2" />
                     </div>
                  </div>
               </div>
            </Link>

            {/* 2. Academic & Software Materials - Rich Scholarly Blue */}
            <Link
               href="/academics"
               className="relative group flex flex-col p-8 rounded-3xl overflow-hidden border border-white/20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:z-20 active:scale-[0.98] bg-blue-700 text-white min-h-70"
            >
               <div className="absolute -bottom-10 -right-10 opacity-20 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 pointer-events-none">
                  <DocumentFolders animated={true} color="#ffffff" secondaryColor="rgba(255,255,255,0.2)" className="w-64 h-64" />
               </div>

               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex flex-col flex-1 py-1">
                     <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-3 tracking-tight">
                        Academic &amp; Software Materials
                     </h3>
                     <p className="text-white/85 text-sm sm:text-base font-medium leading-relaxed max-w-[90%]">
                        Access course registration units, outlines, past question archives, and request verified software programmes.
                     </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between">
                     <div className="flex items-center text-sm font-bold text-white/95 group-hover:text-white transition-colors">
                        <span>Explore Academic Materials</span>
                        <ArrowRight size={17} className="ml-2 transition-transform duration-300 ease-out group-hover:translate-x-2" />
                     </div>
                  </div>
               </div>
            </Link>

            {/* 3. BuildLab & Student Showcase - Rich Teal */}
            <Link
               href="/buildlab"
               className="relative group flex flex-col p-8 rounded-3xl overflow-hidden border border-white/20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:z-20 active:scale-[0.98] bg-teal-700 text-white min-h-70"
            >
               <div className="absolute -bottom-10 -right-10 opacity-20 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 pointer-events-none">
                  <WomanLaptop animated={true} color="#ffffff" secondaryColor="rgba(255,255,255,0.2)" className="w-64 h-64" />
               </div>

               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex flex-col flex-1 py-1">
                     <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-3 tracking-tight">
                        BuildLab &amp; Showcase
                     </h3>
                     <p className="text-white/85 text-sm sm:text-base font-medium leading-relaxed max-w-[90%]">
                        Browse verified student software, submit products to the showcase, or incubate raw ideas under Mutual NDA.
                     </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between">
                     <div className="flex items-center text-sm font-bold text-white/95 group-hover:text-white transition-colors">
                        <span>Enter BuildLab</span>
                        <ArrowRight size={17} className="ml-2 transition-transform duration-300 ease-out group-hover:translate-x-2" />
                     </div>
                  </div>
               </div>
            </Link>

            {/* 4. Events & Hackathons - Rich Warm Amber */}
            <Link
               href="/events"
               className="relative group flex flex-col p-8 rounded-3xl overflow-hidden border border-white/20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:z-20 active:scale-[0.98] bg-amber-700 text-white min-h-70"
            >
               <div className="absolute -bottom-10 -right-10 opacity-20 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 pointer-events-none">
                  <GroupBrainstorming animated={true} color="#ffffff" secondaryColor="rgba(255,255,255,0.2)" className="w-64 h-64" />
               </div>

               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex flex-col flex-1 py-1">
                     <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-3 tracking-tight">
                        Events &amp; Hackathons
                     </h3>
                     <p className="text-white/85 text-sm sm:text-base font-medium leading-relaxed max-w-[90%]">
                        View upcoming tech workshops, fresher orientations, and curated national and international hackathons.
                     </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between">
                     <div className="flex items-center text-sm font-bold text-white/95 group-hover:text-white transition-colors">
                        <span>Browse Events</span>
                        <ArrowRight size={17} className="ml-2 transition-transform duration-300 ease-out group-hover:translate-x-2" />
                     </div>
                  </div>
               </div>
            </Link>

            {/* 5. Governance & Elections - Rich Leadership Green */}
            <Link
               href="/governance"
               className="relative group flex flex-col p-8 rounded-3xl overflow-hidden border border-white/20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:z-20 active:scale-[0.98] bg-green-700 text-white min-h-70"
            >
               <div className="absolute -bottom-10 -right-10 opacity-20 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 pointer-events-none">
                  <EmployeesOffice animated={true} color="#ffffff" secondaryColor="rgba(255,255,255,0.2)" className="w-64 h-64" />
               </div>

               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex flex-col flex-1 py-1">
                     <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-3 tracking-tight">
                        Governance &amp; Voting
                     </h3>
                     <p className="text-white/85 text-sm sm:text-base font-medium leading-relaxed max-w-[90%]">
                        Connect with executives, SRC, and staff advisors, and cast your ballot during departmental elections.
                     </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between">
                     <div className="flex items-center text-sm font-bold text-white/95 group-hover:text-white transition-colors">
                        <span>View Governance</span>
                        <ArrowRight size={17} className="ml-2 transition-transform duration-300 ease-out group-hover:translate-x-2" />
                     </div>
                  </div>
               </div>
            </Link>

            {/* 6. Games Hub & Arcade - Rich Indigo */}
            <Link
               href="/games"
               className="relative group flex flex-col p-8 rounded-3xl overflow-hidden border border-white/20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:z-20 active:scale-[0.98] bg-indigo-700 text-white min-h-70"
            >
               <div className="absolute -bottom-10 -right-10 opacity-20 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 pointer-events-none">
                  <GamePad animated={true} color="#ffffff" secondaryColor="rgba(255,255,255,0.2)" className="w-64 h-64" />
               </div>

               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex flex-col flex-1 py-1">
                     <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-3 tracking-tight">
                        Games Hub
                     </h3>
                     <p className="text-white/85 text-sm sm:text-base font-medium leading-relaxed max-w-[90%]">
                        Play weekly single-player mini-games crafted by open-source contributors and compete on the leaderboard.
                     </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between">
                     <div className="flex items-center text-sm font-bold text-white/95 group-hover:text-white transition-colors">
                        <span>Play Games</span>
                        <ArrowRight size={17} className="ml-2 transition-transform duration-300 ease-out group-hover:translate-x-2" />
                     </div>
                  </div>
               </div>
            </Link>

            {/* 7. Graphics Studio & Flyers - Rich Royal Purple */}
            <Link
               href="/graphics"
               className="relative group flex flex-col p-8 rounded-3xl overflow-hidden border border-white/20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:z-20 active:scale-[0.98] bg-purple-700 text-white min-h-70 md:col-span-2 lg:col-span-1"
            >
               <div className="absolute -bottom-10 -right-10 opacity-20 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 pointer-events-none">
                  <BalloonPackage animated={true} color="#ffffff" secondaryColor="rgba(255,255,255,0.2)" className="w-64 h-64" />
               </div>

               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex flex-col flex-1 py-1">
                     <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-3 tracking-tight">
                        Graphics Studio
                     </h3>
                     <p className="text-white/85 text-sm sm:text-base font-medium leading-relaxed max-w-[90%]">
                        Generate official departmental birthday flyers instantly, with automated digital certificates coming soon.
                     </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between">
                     <div className="flex items-center text-sm font-bold text-white/95 group-hover:text-white transition-colors">
                        <span>Open Studio</span>
                        <ArrowRight size={17} className="ml-2 transition-transform duration-300 ease-out group-hover:translate-x-2" />
                     </div>
                  </div>
               </div>
            </Link>
         </div>
      </>
   );
}
