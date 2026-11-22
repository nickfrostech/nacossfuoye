'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
   Github,
   MessageSquare,
   MapPin,
   Mail,
   Shield,
   Heart,
   ExternalLink,
   FileText,
   Wallet,
   LayoutDashboard,
   PlusCircle
} from 'lucide-react';

const REPO_URL = 'https://github.com/nickfrostech/nacossfuoye';
const WHATSAPP_URL = 'https://whatsapp.com/channel/0029VaikWEcGOj9fZKC4sK2N';

const ACADEMIC_LINKS = [
   { label: 'Course Materials & Outlines', href: '/academics' },
   { label: 'Software & Programmes', href: '/academics' },
   { label: 'Official Department Memos', href: '/memos' },
   { label: 'Academic Events & Calendar', href: '/events' },
];

const INNOVATION_LINKS = [
   { label: 'BuildLab & Student Incubator', href: '/buildlab' },
   { label: 'Student Projects Showcase', href: '/buildlab' },
   { label: 'Events & Hackathons', href: '/events' },
   { label: 'Arcade Arena & Games', href: '/games' },
   { label: 'Graphics Studio & Flyers', href: '/graphics' },
];

const GOVERNANCE_LINKS = [
   { label: 'Executive Council Directory', href: '/governance' },
   { label: 'SRC Student Representatives', href: '/governance' },
   { label: 'Elections & Live Ballots', href: '/governance' },
   { label: 'WhatsApp Community Channel', href: WHATSAPP_URL, isExternal: true },
   { label: 'GitHub Open Source Portal', href: REPO_URL, isExternal: true },
];

const ADMIN_MEMO_LINKS = [
   { label: 'Executive Memos', href: '/admin/dashboard/executive' },
   { label: 'Student Rep Council (SRC)', href: '/admin/dashboard/src' },
   { label: 'Electoral Committee (ELECOM)', href: '/admin/dashboard/elecom' },
   { label: "President's Desk", href: '/admin/dashboard/president' },
   { label: '+ Create New Memo', href: '/admin/create' },
];

const ADMIN_MANAGEMENT_LINKS = [
   { label: 'Departmental Ledger', href: '/admin/ledger' },
   { label: 'Treasurer Financials', href: '/admin/treasurer' },
   { label: 'Events Management', href: '/admin/events' },
   { label: 'Activity Journal', href: '/admin/journal' },
];

const ADMIN_PORTAL_LINKS = [
   { label: 'Admin Hub / Dashboard', href: '/admin/dashboard' },
   { label: 'Birthday Flyer Templates', href: '/admin/templates/birthday' },
   { label: 'Weekly Quote Templates', href: '/admin/templates/quotes' },
   { label: 'Public Memos Directory', href: '/memos' },
   { label: 'Student Portal Homepage', href: '/' },
];

export default function Footer() {
   const currentYear = new Date().getFullYear();
   const pathname = usePathname();
   const isAdminRoute = pathname?.startsWith('/admin');

   if (isAdminRoute) {
      return (
         <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-400 mt-20 relative overflow-hidden">
            {/* Subtle top ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none blur-2xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 relative z-10">
               {/* Top Admin Quick Bar */}
               <div className="mb-12 p-6 sm:p-7 rounded-3xl bg-slate-800/70 border border-slate-700/60 flex flex-col lg:flex-row items-center justify-between gap-6 backdrop-blur-sm">
                  <div className="text-center lg:text-left space-y-1">
                     <div className="flex items-center justify-center lg:justify-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                           Executive Control Center
                        </span>
                     </div>
                     <h3 className="text-white text-lg sm:text-xl font-bold tracking-tight">
                        NACOSS FUOYE Administration Portal
                     </h3>
                     <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
                        Authorized departmental officers: publish official directives, manage financial ledgers, approve events, and curate media.
                     </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                     <Link
                        href="/admin/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-all duration-200 shadow-sm active:scale-95"
                     >
                        <PlusCircle size={15} />
                        <span>Create Memo</span>
                     </Link>
                     <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-600/60 transition-all duration-200 active:scale-95"
                     >
                        <span>Student Portal</span>
                        <ExternalLink size={13} className="opacity-60" />
                     </Link>
                  </div>
               </div>

               {/* Admin Links Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
                  {/* Brand / Chapter Info (spans 2 cols on lg) */}
                  <div className="lg:col-span-2 space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/5 p-1 border border-white/10 shrink-0">
                           <Image
                              src="/nacossfuoye_logo.png"
                              alt="NACOSS FUOYE Logo"
                              width={36}
                              height={36}
                              className="object-contain"
                           />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <span className="font-nasalization text-base font-bold text-white tracking-wider block">
                                 NACOSS FUOYE
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                 Admin
                              </span>
                           </div>
                           <span className="text-xs text-slate-400 font-medium">
                              Executive Management &amp; Directives
                           </span>
                        </div>
                     </div>

                     <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                        Official administrative workspace for the Department of Computer Science Executive Council, Student Representative Council, and Electoral Committee.
                     </p>

                     <div className="pt-2 space-y-2 text-xs text-slate-400">
                        <div className="flex items-center gap-2.5">
                           <MapPin size={14} className="text-emerald-500 shrink-0" />
                           <span>Department of Computer Science, FUOYE Oye-Campus</span>
                        </div>
                        <a
                           href="mailto:nacossfuoye100@gmail.com"
                           className="flex items-center gap-2.5 hover:text-white transition-colors"
                        >
                           <Mail size={14} className="text-emerald-500 shrink-0" />
                           <span>nacossfuoye100@gmail.com</span>
                        </a>
                     </div>
                  </div>

                  {/* Column 2: Executive Memos */}
                  <div className="space-y-4">
                     <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={14} className="text-emerald-500" />
                        <span>Memos</span>
                     </h4>
                     <ul className="space-y-2.5 text-sm">
                        {ADMIN_MEMO_LINKS.map((link) => (
                           <li key={link.label}>
                              <Link
                                 href={link.href}
                                 className="text-slate-400 hover:text-white transition-colors duration-200 block text-xs"
                              >
                                 {link.label}
                              </Link>
                           </li>
                        ))}
                     </ul>
                  </div>

                  {/* Column 3: Finance & Records */}
                  <div className="space-y-4">
                     <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Wallet size={14} className="text-emerald-500" />
                        <span>Management</span>
                     </h4>
                     <ul className="space-y-2.5 text-sm">
                        {ADMIN_MANAGEMENT_LINKS.map((link) => (
                           <li key={link.label}>
                              <Link
                                 href={link.href}
                                 className="text-slate-400 hover:text-white transition-colors duration-200 block text-xs"
                              >
                                 {link.label}
                              </Link>
                           </li>
                        ))}
                     </ul>
                  </div>

                  {/* Column 4: Quick Portals */}
                  <div className="space-y-4">
                     <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <LayoutDashboard size={14} className="text-emerald-500" />
                        <span>Portals</span>
                     </h4>
                     <ul className="space-y-2.5 text-sm">
                        {ADMIN_PORTAL_LINKS.map((link) => (
                           <li key={link.label}>
                              <Link
                                 href={link.href}
                                 className="text-slate-400 hover:text-white transition-colors duration-200 block text-xs"
                              >
                                 {link.label}
                              </Link>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>

               {/* Bottom Row */}
               <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                     <span>&copy; {currentYear} NACOSS FUOYE. Executive Administration.</span>
                  </div>

                  <div className="flex items-center gap-1">
                     <Shield size={13} className="text-emerald-500 inline" />
                     <span>Authorized Executive Access Only</span>
                  </div>

                  <div className="flex items-center gap-2">
                     <span>FUOYE Chapter</span>
                     <span className="text-slate-700">&bull;</span>
                     <span>Admin Console v2.4</span>
                  </div>
               </div>
            </div>
         </footer>
      );
   }

   return (
      <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-400 mt-20 relative overflow-hidden">
         {/* Subtle top ambient glow */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none blur-2xl" />

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
            {/* Top Quick Connect Bar */}
            <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-slate-800/60 border border-slate-700/60 flex flex-col lg:flex-row items-center justify-between gap-6 backdrop-blur-sm">
               <div className="text-center lg:text-left space-y-1">
                  <h3 className="text-white text-lg sm:text-xl font-bold tracking-tight">
                     Stay Connected with NACOSS FUOYE
                  </h3>
                  <p className="text-slate-400 text-sm max-w-xl">
                     Get instantaneous departmental updates, course schedules, hackathon calls, and tech community announcements.
                  </p>
               </div>
               <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                  <a
                     href={WHATSAPP_URL}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-emerald-600/20 active:scale-95"
                  >
                     <MessageSquare size={16} />
                     <span>Join WhatsApp Channel</span>
                  </a>
                  <a
                     href={REPO_URL}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-600/60 transition-all duration-200 active:scale-95"
                  >
                     <Github size={16} />
                     <span>Star on GitHub</span>
                     <ExternalLink size={14} className="opacity-60" />
                  </a>
               </div>
            </div>

            {/* Main Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
               {/* Brand / Chapter Info (spans 2 cols on lg) */}
               <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/5 p-1 border border-white/10 shrink-0">
                        <Image
                           src="/nacossfuoye_logo.png"
                           alt="NACOSS FUOYE Logo"
                           width={36}
                           height={36}
                           className="object-contain"
                        />
                     </div>
                     <div>
                        <span className="font-nasalization text-lg font-bold text-white tracking-wider block">
                           NACOSS FUOYE
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                           Department of Computer Science
                        </span>
                     </div>
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                     The official portal for the Nigeria Association of Computing Students, Federal University Oye-Ekiti Chapter. Providing academic repositories, software distribution, student venture incubation, and community governance.
                  </p>

                  <div className="pt-2 space-y-2 text-xs text-slate-400">
                     <div className="flex items-center gap-2.5">
                        <MapPin size={14} className="text-primary shrink-0" />
                        <span>Department of Computer Science, FUOYE, Oye-Campus, Ekiti State</span>
                     </div>
                     <a
                        href="mailto:nacossfuoye100@gmail.com"
                        className="flex items-center gap-2.5 hover:text-white transition-colors"
                     >
                        <Mail size={14} className="text-primary shrink-0" />
                        <span>nacossfuoye100@gmail.com</span>
                     </a>
                  </div>
               </div>

               {/* Column 2: Academics */}
               <div className="space-y-4">
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                     Academic Vault
                  </h4>
                  <ul className="space-y-2.5 text-sm">
                     {ACADEMIC_LINKS.map((link) => (
                        <li key={link.label}>
                           <Link
                              href={link.href}
                              className="text-slate-400 hover:text-white transition-colors duration-200 block"
                           >
                              {link.label}
                           </Link>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Column 3: Innovation & Labs */}
               <div className="space-y-4">
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                     Innovation &amp; Labs
                  </h4>
                  <ul className="space-y-2.5 text-sm">
                     {INNOVATION_LINKS.map((link) => (
                        <li key={link.label}>
                           <Link
                              href={link.href}
                              className="text-slate-400 hover:text-white transition-colors duration-200 block"
                           >
                              {link.label}
                           </Link>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Column 4: Governance & Community */}
               <div className="space-y-4">
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                     Governance &amp; Society
                  </h4>
                  <ul className="space-y-2.5 text-sm">
                     {GOVERNANCE_LINKS.map((link) => (
                        <li key={link.label}>
                           {link.isExternal ? (
                              <a
                                 href={link.href}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1.5"
                              >
                                 <span>{link.label}</span>
                                 <ExternalLink size={12} className="opacity-50" />
                              </a>
                           ) : (
                              <Link
                                 href={link.href}
                                 className="text-slate-400 hover:text-white transition-colors duration-200 block"
                              >
                                 {link.label}
                              </Link>
                           )}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            {/* Bottom Row: Legal, Made with Heart, and Sneaky Admin Icon */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
               <div className="flex items-center gap-2">
                  <span>&copy; {currentYear} NACOSS FUOYE. All rights reserved.</span>
               </div>

               <div className="flex items-center gap-1">
                  <span>Engineered with</span>
                  <Heart size={12} className="text-rose-500 fill-rose-500 inline" />
                  <span>by Computer Science Students</span>
               </div>

               {/* Stealthy admin entry link */}
               <div className="flex items-center gap-2">
                  <span>FUOYE Chapter</span>
                  <span className="text-slate-700">&bull;</span>
                  <span>v2.4</span>
                  <span className="text-slate-700">&bull;</span>
                  {/* Subtle, innocuous security shield icon linking to admin */}
                  <Link
                     href="/admin"
                     className="text-slate-600 hover:text-slate-400 transition-colors duration-300 p-0.5 inline-flex items-center rounded"
                     aria-label="Security verification"
                  >
                     <Shield size={20} className="opacity-35 hover:opacity-90 transition-opacity" />
                  </Link>
               </div>
            </div>
         </div>
      </footer>
   );
}
