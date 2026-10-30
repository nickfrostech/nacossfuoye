'use client';

import Image from 'next/image';
import {
   Github,
   GitPullRequest,
   ExternalLink,
   ArrowUpRight,
   GraduationCap
} from 'lucide-react';
import { PORTAL_CONTRIBUTORS } from '@/data/portal-updates';

const REPO_URL = 'https://github.com/nickfrostech/nacossfuoye';

export default function ContributorsSection() {

   return (
      <section id="contributors" className="w-full mt-16 mb-12">
         {/* Section Header */}
         <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
               Portal Contributors
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium mt-1 max-w-xl">
               Meet the student engineers and open-source contributors powering the NACOSS FUOYE digital experience.
            </p>
         </div>

         {/* Contributors Cards Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Contributor Cards */}
            {PORTAL_CONTRIBUTORS.map((contributor) => (
               <div
                  key={contributor.login}
                  className="relative group flex flex-col p-6 rounded-3xl bg-white border border-slate-200 overflow-hidden"
               >

                  {/* Header: Avatar, Name, Alias, Badge */}
                  <div className="flex items-start gap-4 mb-4">
                     <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <Image
                           src={contributor.avatar_url}
                           alt={contributor.name}
                           fill
                           sizes="64px"
                           className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                     </div>

                     <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                           {contributor.name}
                        </h3>

                        <span className="inline-block text-[11px] font-bold">
                           {contributor.role}
                        </span>
                     </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6 flex-1">
                     {contributor.bio}
                  </p>

                  {/* Card Footer: Academic Level & GitHub Link */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                     <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                        <GraduationCap size={15} className="text-primary" />
                        <span>{contributor.level}</span>
                     </div>

                     <a
                        href={contributor.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                     >
                        <span>GitHub Profile</span>
                        <ExternalLink size={12} />
                     </a>
                  </div>
               </div>
            ))}

            {/* "Become a Contributor" Callout Card */}
            <div className="relative group flex flex-col p-6 rounded-3xl bg-slate-900 text-white">
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-primary backdrop-blur-md">
                     <GitPullRequest size={22} className="text-emerald-400" />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-white mt-0.5">
                        Become a Contributor
                     </h3>
                  </div>
               </div>

               <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium mb-6 flex-1">
                  Are you a student developer or UI designer? Pick an issue, build a student portal feature, or submit your own mini-game to the Games Hub.
               </p>

               <div className="space-y-2.5 mt-auto">
                  <a
                     href={REPO_URL}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-semibold text-xs border border-white/10 transition-colors"
                  >
                     <Github size={14} />
                     <span>GitHub Repository</span>
                     <ArrowUpRight size={13} />
                  </a>
               </div>
            </div>
         </div>
      </section>
   );
}
