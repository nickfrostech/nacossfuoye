'use client';

import { useEffect, useState } from 'react';
import {
   CircleDot,
   GitPullRequest,
   Star,
   GitFork,
   Users,
   Globe,
   Github
} from 'lucide-react';

const REPO_URL = 'https://github.com/nickfrostech/nacossfuoye';

export default function RepoStatsCard() {
   const [stats, setStats] = useState({
      bugs: 2,
      feats: 3,
      closedPrs: 1,
      openPrs: 0,
      stars: 2,
      forks: 3,
      contributors: 2,
      // Status flags for "New" badge display (all active for flyer updates)
      hasNewIssues: true,
      hasNewPrs: true,
      hasNewContributors: true,
      hasNewStars: true,
      hasNewForks: true,
   });

   useEffect(() => {
      let isMounted = true;
      const fetchStats = async () => {
         try {
            const res = await fetch('/api/github-stats');
            if (!res.ok) return;
            const data = await res.json();
            if (isMounted && data?.repo) {
               setStats((prev) => ({
                  ...prev,
                  bugs: data.issuesBreakdown?.byType?.bugs ?? 2,
                  feats: data.issuesBreakdown?.byType?.features ?? 3,
                  closedPrs: 1,
                  openPrs: data.issuesBreakdown?.openPullRequests ?? 0,
                  stars: data.repo.stars ?? 2,
                  forks: data.repo.forks ?? 3,
                  contributors: data.contributorsCount ?? 2,
               }));
            }
         } catch {
            // Keep default stats
         }
      };
      fetchStats();
      return () => {
         isMounted = false;
      };
   }, []);

   return (
      <div className="w-full overflow-x-auto py-4 px-2 sm:px-0 flex justify-start sm:justify-center no-scrollbar">
         <div className="w-112.5 sm:w-120 md:w-125 min-w-110 aspect-square shrink-0 sm:mx-auto relative bg-white overflow-hidden font-sans select-none flex flex-col justify-between">
            {/* Faded Blueprint Grid Emanating from the Center */}
            <div
               className="absolute inset-0 pointer-events-none z-0"
               style={{
                  backgroundImage: `
                  linear-gradient(to right, rgba(15, 23, 42, 0.12) 1.5px, transparent 1.5px),
                  linear-gradient(to bottom, rgba(15, 23, 42, 0.12) 1.5px, transparent 1.5px)
               `,
                  backgroundSize: '24px 24px',
                  maskImage: 'radial-gradient(circle at center, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0.55) 55%, rgba(0, 0, 0, 0) 82%)',
                  WebkitMaskImage: 'radial-gradient(circle at center, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0.55) 55%, rgba(0, 0, 0, 0) 82%)',
               }}
            />

            {/* Soft Center Green Radial Glow */}
            <div
               className="absolute inset-0 pointer-events-none z-0 opacity-40"
               style={{
                  background: 'radial-gradient(circle at center, rgba(3, 145, 51, 0.12) 0%, rgba(3, 145, 51, 0.02) 50%, transparent 75%)',
               }}
            />

            {/* 1. Header Typography */}
            <div className="relative z-10 text-center pt-6 sm:pt-7 px-6">
               <span className="block text-xs sm:text-sm font-extrabold tracking-widest text-primary uppercase">
                  NACOSS HUB
               </span>
               <h3 className="text-3xl sm:text-3xl md:text-[2.6rem] font-extrabold text-slate-900 tracking-tight uppercase mt-0.5 leading-none">
                  GITHUB UPDATES
               </h3>
            </div>

            {/* 2. 5 Dark Pill Rows (Centered in the Square) */}
            <div className="relative z-10 space-y-2.5 sm:space-y-3 px-6 sm:px-8 py-2">
               {/* 1. Issues */}
               <a
                  href={`${REPO_URL}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between px-5 py-3 sm:py-3.5 rounded-2xl bg-[#111113] hover:bg-black text-white transition-all duration-200 active:scale-[0.99]"
               >
                  {stats.hasNewIssues && (
                     <span className="absolute top-0 right-1 -translate-y-1/2 translate-x-1 sm:translate-x-1.5 z-20 px-2.5 py-0.5 rounded-full bg-[#009947] text-[#00ff77] text-[9.5px] font-bold uppercase tracking-wider shadow-sm pointer-events-none leading-none">
                        New
                     </span>
                  )}
                  <div className="flex items-center gap-3 font-bold text-sm sm:text-base">
                     <CircleDot size={18} className="text-white shrink-0" />
                     <span>Issues</span>
                  </div>
                  <span className="font-bold text-sm sm:text-base text-error">
                     {stats.bugs} bugs, {stats.feats} feats
                  </span>
               </a>

               {/* 2. Pull Requests */}
               <a
                  href={`${REPO_URL}/pulls`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between px-5 py-3 sm:py-3.5 rounded-2xl bg-[#111113] hover:bg-black text-white transition-all duration-200 active:scale-[0.99]"
               >
                  {stats.hasNewPrs && (
                     <span className="absolute top-0 right-1 -translate-y-1/2 translate-x-1 sm:translate-x-1.5 z-20 px-2.5 py-0.5 rounded-full bg-[#009947] text-[#00ff77] text-[9.5px] font-bold uppercase tracking-wider shadow-sm pointer-events-none leading-none">
                        New
                     </span>
                  )}
                  <div className="flex items-center gap-3 font-bold text-sm sm:text-base">
                     <GitPullRequest size={18} className="text-white shrink-0" />
                     <span>Pull Requests</span>
                  </div>
                  <span className="font-bold text-sm sm:text-base text-[#22c55e]">
                     {stats.closedPrs} closed, {stats.openPrs} open
                  </span>
               </a>

               {/* 3. Stars */}
               <a
                  href={`${REPO_URL}/stargazers`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between px-5 py-3 sm:py-3.5 rounded-2xl bg-[#111113] hover:bg-black text-white transition-all duration-200 active:scale-[0.99]"
               >
                  {stats.hasNewStars && (
                     <span className="absolute top-0 right-1 -translate-y-1/2 translate-x-1 sm:translate-x-1.5 z-20 px-2.5 py-0.5 rounded-full bg-[#009947] text-[#00ff77] text-[9.5px] font-bold uppercase tracking-wider shadow-sm pointer-events-none leading-none">
                        New
                     </span>
                  )}
                  <div className="flex items-center gap-3 font-bold text-sm sm:text-base">
                     <Star size={18} className="text-white shrink-0" />
                     <span>Stars</span>
                  </div>
                  <span className="font-bold text-base sm:text-lg text-[#eab308]">
                     {stats.stars}
                  </span>
               </a>

               {/* 4. Forks */}
               <a
                  href={`${REPO_URL}/network/members`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between px-5 py-3 sm:py-3.5 rounded-2xl bg-[#111113] hover:bg-black text-white transition-all duration-200 active:scale-[0.99]"
               >
                  {stats.hasNewForks && (
                     <span className="absolute top-0 right-1 -translate-y-1/2 translate-x-1 sm:translate-x-1.5 z-20 px-2.5 py-0.5 rounded-full bg-[#009947] text-[#00ff77] text-[9.5px] font-bold uppercase tracking-wider shadow-sm pointer-events-none leading-none">
                        New
                     </span>
                  )}
                  <div className="flex items-center gap-3 font-bold text-sm sm:text-base">
                     <GitFork size={18} className="text-white shrink-0" />
                     <span>Forks</span>
                  </div>
                  <span className="font-bold text-base sm:text-lg text-[#38bdf8]">
                     {stats.forks}
                  </span>
               </a>

               {/* 5. Contributors */}
               <a
                  href="#contributors"
                  className="group relative flex items-center justify-between px-5 py-3 sm:py-3.5 rounded-2xl bg-[#111113] hover:bg-black text-white transition-all duration-200 active:scale-[0.99]"
               >
                  {stats.hasNewContributors && (
                     <span className="absolute top-0 right-1 -translate-y-1/2 translate-x-1 sm:translate-x-1.5 z-20 px-2.5 py-0.5 rounded-full bg-[#009947] text-[#00ff77] text-[9.5px] font-bold uppercase tracking-wider shadow-sm pointer-events-none leading-none">
                        New
                     </span>
                  )}
                  <div className="flex items-center gap-3 font-bold text-sm sm:text-base">
                     <Users size={18} className="text-white shrink-0" />
                     <span>Contributors</span>
                  </div>
                  <span className="font-bold text-base sm:text-lg text-[#f97316]">
                     {stats.contributors}
                  </span>
               </a>
            </div>

            {/* 3. Bottom Forest Green Footer Bar with Top Arch Curve */}
            <div className="w-full bg-[#005723] rounded-t-3xl sm:rounded-t-4xl px-6 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between text-white text-xs sm:text-sm font-bold relative z-10 shrink-0">
               <a
                  href="https://nacossfuoye.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-emerald-200 transition-colors"
               >
                  <Globe size={15} />
                  <span>nacoss.vercel.app</span>
               </a>
               <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-emerald-200 transition-colors"
               >
                  <Github size={15} />
                  <span>nickfrostech/nacossfuoye</span>
               </a>
            </div>
         </div>
      </div>
   );
}
