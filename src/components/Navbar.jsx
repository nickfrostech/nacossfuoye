'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
   Github, 
   ChevronDown, 
   Sparkles, 
   Lightbulb, 
   Trophy, 
   Gamepad2, 
   BookOpen, 
   FileText, 
   Palette,
   Users, 
   UserPlus, 
   Menu, 
   X, 
   ExternalLink,
   MessageSquare,
   Send,
   CheckCircle2,
   GraduationCap,
   LogOut,
   Wallet,
   Calendar
} from 'lucide-react';

const REPO_URL = 'https://github.com/nickfrostech/nacossfuoye';

const getAdminSectionNavItems = (userRole) => {
   const items = [
      {
         id: 'memos',
         title: 'Memos',
         icon: FileText,
         color: 'text-emerald-600 bg-emerald-50 border-emerald-200/60',
      },
   ];

   if (!userRole) {
      return items;
   }

   const canViewLedger = ['admin', 'president', 'fin_sec'].includes(userRole);
   const canViewTreasurer = ['admin', 'president', 'treasurer', 'gen_sec', 'ags', 'pro', 'vp'].includes(userRole);
   const canViewTemplates = !['src', 'elecom'].includes(userRole);
   const canManageEvents = !['src', 'elecom'].includes(userRole);

   if (canManageEvents) {
      items.push({
         id: 'events',
         title: 'Events',
         icon: Calendar,
         color: 'text-amber-700 bg-amber-50 border-amber-200/60',
      });
   }

   if (canViewLedger || canViewTreasurer) {
      items.push({
         id: 'finances',
         title: 'Finances',
         icon: Wallet,
         color: 'text-blue-600 bg-blue-50 border-blue-200/60',
      });
   }

   if (canViewTemplates) {
      items.push({
         id: 'templates',
         title: 'Templates',
         icon: Palette,
         color: 'text-purple-600 bg-purple-50 border-purple-200/60',
      });
   }

   return items;
};

const DO_SOMETHING_ITEMS = [
   {
      title: 'Academic & Software Materials',
      desc: 'Registered units, outlines, past questions & software programmes',
      href: '/academics',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50 border-blue-200/60',
   },
   {
      title: 'BuildLab & Student Showcase',
      desc: 'Browse student creations or incubate new tech ideas under NDA',
      href: '/buildlab',
      icon: Lightbulb,
      color: 'text-teal-600 bg-teal-50 border-teal-200/60',
   },
   {
      title: 'Events & Hackathons',
      desc: 'Upcoming workshops, talks & national hackathons to apply for',
      href: '/events',
      icon: Trophy,
      color: 'text-amber-600 bg-amber-50 border-amber-200/60',
   },
   {
      title: 'Governance & Elections',
      desc: 'Executive directory, SRC representatives & live election voting',
      href: '/governance',
      icon: Users,
      color: 'text-green-600 bg-green-50 border-green-200/60',
   },
   {
      title: 'Official Memos',
      desc: 'Executive, SRC, and departmental verified communications',
      href: '/memos',
      icon: FileText,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/60',
   },
   {
      title: 'Arcade Arena & Games',
      desc: 'Play mini games and compete on the live weekly leaderboard',
      href: '/games',
      icon: Gamepad2,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200/60',
   },
   {
      title: 'Graphics Studio & Flyers',
      desc: 'Create official departmental celebration designs and flyers',
      href: '/graphics',
      icon: Palette,
      color: 'text-purple-600 bg-purple-50 border-purple-200/60',
   },
];

const PRO_WHATSAPP_NUMBER = '2348055986730';
const LEVEL_JOIN_MSG = encodeURIComponent(
   `Hello P.R.O, I would like to join my departmental level WhatsApp group.\n\n` +
   `• Full Name: \n` +
   `• Matric No: \n` +
   `• Level (100L / 200L / 300L / 400L): `
);

const SPORT_DIRECTOR_NUMBER = '2349137345520';
const SPORT_JOIN_MSG = encodeURIComponent(
   `Hello Sports Director, I would like to join the NACOSS FUOYE Sports community and games/football group.\n\n` +
   `• Full Name: \n` +
   `• Level: \n` +
   `• Sport of Interest (Football, Basketball, Table Tennis, Chess, Esports, etc.): `
);

const COMMUNITY_CHANNELS = [
   {
      name: 'WhatsApp Channel',
      desc: 'Official departmental announcements, broad updates & broadcast circulars',
      icon: MessageSquare,
      color: 'bg-emerald-500 text-white',
      badge: 'Broadcast',
      linkText: 'Join Channel',
      url: 'https://whatsapp.com/channel/0029VaikWEcGOj9fZKC4sK2N',
   },
   {
      name: 'Join Your Level Group',
      desc: 'Connect with course mates in the official 100L–400L class WhatsApp groups via the P.R.O',
      icon: GraduationCap,
      color: 'bg-blue-600 text-white',
      badge: 'Level Groups',
      linkText: 'Message P.R.O',
      url: `https://wa.me/${PRO_WHATSAPP_NUMBER}?text=${LEVEL_JOIN_MSG}`,
   },
   {
      name: 'Join Sports Community',
      desc: 'Departmental football teams, inter-level tournaments, athletics & indoor games',
      icon: Trophy,
      color: 'bg-amber-600 text-white',
      badge: 'Sports Hub',
      linkText: 'Message Sports Director',
      url: `https://wa.me/${SPORT_DIRECTOR_NUMBER}?text=${SPORT_JOIN_MSG}`,
   },
   {
      name: 'Departmental Directory',
      desc: 'Speak directly with executive representatives and student welfare leadership',
      icon: Users,
      color: 'bg-purple-600 text-white',
      badge: 'Directory',
      linkText: 'View Directory',
      url: '/governance',
   },
];

export default function Navbar() {
   const pathname = usePathname();
   const router = useRouter();
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const [isDoSomethingOpen, setIsDoSomethingOpen] = useState(false);
   const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
   const [userRole, setUserRole] = useState(null);

   const navContainerRef = useRef(null);

   const isAdminRoute = pathname?.startsWith('/admin');
   const isProtectedAdmin = isAdminRoute && pathname !== '/admin';

   // Fetch executive role when on protected admin route
   useEffect(() => {
      if (!isProtectedAdmin) {
         setUserRole(null);
         return;
      }
      let isMounted = true;
      const fetchRole = async () => {
         try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user && isMounted) {
               const { data: roleData } = await supabase
                  .from('user_roles')
                  .select('role')
                  .eq('user_email', user.email)
                  .single();
               if (isMounted) {
                  setUserRole(roleData?.role || null);
               }
            }
         } catch (err) {
            console.error('Error fetching role in Navbar:', err);
         }
      };
      fetchRole();
      return () => {
         isMounted = false;
      };
   }, [isProtectedAdmin]);

   const adminSectionItems = getAdminSectionNavItems(userRole);

   const scrollToSection = (e, sectionId) => {
      if (pathname === '/admin/dashboard') {
         e.preventDefault();
         const target = document.getElementById(sectionId);
         if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', `/admin/dashboard#${sectionId}`);
         }
      }
   };

   const handleLogout = async () => {
      try {
         const supabase = createClient();
         await supabase.auth.signOut();
         router.push('/admin');
         router.refresh();
      } catch (err) {
         console.error('Logout error:', err);
         router.push('/admin');
      }
   };

   // Close popups on route change
   useEffect(() => {
      setIsMenuOpen(false);
      setIsDoSomethingOpen(false);
      setIsJoinModalOpen(false);
   }, [pathname]);

   // Click outside handler for dropdowns and mobile menu
   useEffect(() => {
      const handleClickOutside = (event) => {
         if (navContainerRef.current && !navContainerRef.current.contains(event.target)) {
            setIsDoSomethingOpen(false);
            setIsMenuOpen(false);
         }
      };

      const handleKeyDown = (event) => {
         if (event.key === 'Escape') {
            setIsDoSomethingOpen(false);
            setIsJoinModalOpen(false);
            setIsMenuOpen(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
         document.removeEventListener('keydown', handleKeyDown);
      };
   }, []);

   return (
      <>
         {/* Mobile Backdrop Overlay - closes menu when tapping outside */}
         <div
            aria-hidden="true"
            onClick={() => setIsMenuOpen(false)}
            className={`md:hidden fixed inset-0 bg-slate-500/30 backdrop-blur-xs z-40 transition-opacity duration-300 ${
               isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
         />

         {/* Floating Top Navbar Container - Fixed position ensures persistent stickiness on all pages */}
         <header 
            ref={navContainerRef}
            className="fixed top-4 left-0 right-0 z-50 w-full px-3 sm:px-6 max-w-6xl mx-auto pointer-events-none"
         >
            <nav 
               aria-label="Main Navigation"
               className="pointer-events-auto relative flex items-center justify-between px-3.5 sm:px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300"
            >
               {/* Left: Department Logo and NACOSS Name */}
               <Link 
                  href={isAdminRoute ? (isProtectedAdmin ? '/admin/dashboard' : '/admin') : '/'} 
                  className="flex items-center gap-2.5 pl-1.5 pr-2 rounded-full hover:bg-slate-100/70 transition-colors group select-none"
                  aria-label={isAdminRoute ? 'NACOSS Admin Home' : 'NACOSS Home'}
               >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
                     <Image 
                        src="/nacossfuoye_logo.png" 
                        alt="NACOSS FUOYE Logo" 
                        width={30} 
                        height={30} 
                        className="w-full h-full object-center"
                        priority
                     />
                  </div>
                  <div className="flex items-center gap-1.5">
                     <span className="font-extrabold text-sm sm:text-base tracking-wider text-slate-900 font-nasalization uppercase">
                        NACOSS
                     </span>
                     <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full font-sans border ${
                        isAdminRoute 
                           ? 'bg-amber-50 text-amber-700 border-amber-200' 
                           : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                     }`}>
                        {isAdminRoute ? 'ADMIN' : 'FUOYE'}
                     </span>
                  </div>
               </Link>

               {/* Center: Desktop Navigation Items */}
               {isAdminRoute ? (
                  <div className="hidden md:flex items-center gap-1.5">
                     {adminSectionItems.map((item) => {
                        const IconComp = item.icon;
                        return (
                           <Link
                              key={item.id}
                              href={`/admin/dashboard#${item.id}`}
                              onClick={(e) => scrollToSection(e, item.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-200"
                           >
                              <IconComp size={15} className={item.color.split(' ')[0]} />
                              <span>{item.title}</span>
                           </Link>
                        );
                     })}

                     {/* Return to Public Website */}
                     <Link
                        href="/"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                        title="Go to Public NACOSS Site"
                     >
                        <span>Student Portal</span>
                        <ExternalLink size={12} />
                     </Link>
                  </div>
               ) : (
                  <div className="hidden md:flex items-center gap-1">
                     {/* "Do Something" Interactive Dropdown */}
                     <div className="relative">
                        <button
                           type="button"
                           onClick={() => setIsDoSomethingOpen((prev) => !prev)}
                           aria-expanded={isDoSomethingOpen}
                           aria-haspopup="true"
                           className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                              isDoSomethingOpen 
                                 ? 'bg-emerald-50 text-emerald-700 shadow-xs' 
                                 : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                           }`}
                        >
                           <Sparkles size={15} className="text-emerald-600" />
                           <span>Do Something</span>
                           <ChevronDown 
                              size={14} 
                              className={`transition-transform duration-200 opacity-60 ${isDoSomethingOpen ? 'rotate-180 text-emerald-700' : ''}`} 
                           />
                        </button>

                        {/* Dropdown Menu with Two-Way Opening and Closing Animation */}
                        <div 
                           role="menu"
                           aria-hidden={!isDoSomethingOpen}
                           className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-105 max-w-[92vw] p-2 bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-2xl z-50 origin-top transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                              isDoSomethingOpen
                                 ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible'
                                 : 'opacity-0 scale-95 -translate-y-2 pointer-events-none invisible'
                           }`}
                        >
                           <div className="flex flex-col gap-1 max-h-[80vh] overflow-y-auto p-1">
                              {DO_SOMETHING_ITEMS.map((item) => {
                                 const IconComp = item.icon;
                                 return (
                                    <Link
                                       key={item.href}
                                       href={item.href}
                                       onClick={() => setIsDoSomethingOpen(false)}
                                       role="menuitem"
                                       className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors group"
                                    >
                                       <div className={`p-2.5 rounded-xl shrink-0 border ${item.color} group-hover:scale-105 transition-transform`}>
                                          <IconComp size={18} />
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors block truncate">
                                             {item.title}
                                          </span>
                                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                                             {item.desc}
                                          </p>
                                       </div>
                                    </Link>
                                 );
                              })}
                           </div>
                        </div>
                     </div>

                     {/* Direct Nav Links */}
                     <Link 
                        href="/memos" 
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                           pathname === '/memos' 
                              ? 'text-emerald-700 bg-emerald-50/80 font-semibold' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`}
                     >
                        Memos
                     </Link>

                     <Link 
                        href="/academics" 
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                           pathname === '/academics' 
                              ? 'text-emerald-700 bg-emerald-50/80 font-semibold' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`}
                     >
                        Academics
                     </Link>

                     <Link 
                        href="/games" 
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                           pathname?.startsWith('/games') 
                              ? 'text-emerald-700 bg-emerald-50/80 font-semibold' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`}
                     >
                        Games
                     </Link>
                  </div>
               )}

               {/* Right Side: Desktop Actions, Mobile Hamburger */}
               <div className="flex items-center gap-2">
                  {isAdminRoute ? (
                     isProtectedAdmin && (
                        <button
                           type="button"
                           onClick={handleLogout}
                           className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/80 transition-all duration-200 active:scale-95 shadow-2xs"
                           aria-label="Logout of Admin"
                           title="Sign out of Admin Session"
                        >
                           <LogOut size={13} />
                           <span>Logout</span>
                        </button>
                     )
                  ) : (
                     <>
                        {/* Desktop Only: "Join" Button */}
                        <button
                           type="button"
                           onClick={() => setIsJoinModalOpen(true)}
                           className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-xs hover:shadow-md active:scale-95"
                           aria-label="Join NACOSS Community"
                        >
                           <UserPlus size={14} />
                           <span>Join</span>
                        </button>

                        {/* Desktop Only: GitHub Repository Icon */}
                        <a
                           href={REPO_URL}
                           target="_blank"
                           rel="noopener noreferrer"
                           aria-label="NACOSS Portal GitHub Repository"
                           title="View GitHub Repository"
                           className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all duration-200 active:scale-95 shadow-2xs"
                        >
                           <Github size={17} className="transition-transform hover:rotate-6" />
                        </a>
                     </>
                  )}

                  {/* Mobile Menu Hamburger Toggle */}
                  <button
                     type="button"
                     onClick={() => setIsMenuOpen((prev) => !prev)}
                     aria-expanded={isMenuOpen}
                     aria-label="Toggle mobile menu"
                     className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                     {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                  </button>
               </div>
            </nav>

            {/* Mobile Dropdown Menu Drawer with Fluid Opening and Closing Animation */}
            <div 
               aria-hidden={!isMenuOpen}
               className={`md:hidden pointer-events-auto mt-2 p-4 bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain space-y-4 ${
                  isMenuOpen 
                     ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible' 
                     : 'opacity-0 scale-95 -translate-y-2 pointer-events-none invisible'
               }`}
            >
               {isAdminRoute ? (
                  <div>
                     <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                           Admin Navigation
                        </span>
                        <Link
                           href="/"
                           onClick={() => setIsMenuOpen(false)}
                           className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                        >
                           <span>Student Portal</span>
                           <ExternalLink size={11} />
                        </Link>
                     </div>
                     <div className="grid grid-cols-1 gap-1">
                        {adminSectionItems.map((item) => {
                           const IconComp = item.icon;
                           return (
                              <Link
                                 key={item.id}
                                 href={`/admin/dashboard#${item.id}`}
                                 onClick={(e) => {
                                    setIsMenuOpen(false);
                                    scrollToSection(e, item.id);
                                 }}
                                 className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors group"
                              >
                                 <div className={`p-2 rounded-xl shrink-0 border ${item.color}`}>
                                    <IconComp size={16} />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <span className="text-sm font-semibold block truncate text-slate-800 group-hover:text-emerald-700 transition-colors">
                                       {item.title}
                                    </span>
                                 </div>
                              </Link>
                           );
                        })}
                     </div>

                     {/* Mobile Admin Logout */}
                     {isProtectedAdmin && (
                        <div className="pt-3 mt-3 border-t border-slate-100">
                           <button
                              type="button"
                              onClick={() => {
                                 setIsMenuOpen(false);
                                 handleLogout();
                              }}
                              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-xs transition-colors"
                           >
                              <LogOut size={16} />
                              <span>Logout of Admin</span>
                           </button>
                        </div>
                     )}
                  </div>
               ) : (
                  <>
                     <div>
                        <div className="grid grid-cols-1 gap-1">
                           {DO_SOMETHING_ITEMS.map((item) => {
                              const IconComp = item.icon;
                              return (
                                 <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors group"
                                 >
                                    <div className={`p-2 rounded-xl shrink-0 border ${item.color}`}>
                                       <IconComp size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors block truncate">
                                          {item.title}
                                       </span>
                                       <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                                          {item.desc}
                                       </p>
                                    </div>
                                 </Link>
                              );
                           })}
                        </div>
                     </div>

                     {/* Mobile Bottom Actions: Join Community & GitHub */}
                     <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                           type="button"
                           onClick={() => {
                              setIsMenuOpen(false);
                              setIsJoinModalOpen(true);
                           }}
                           className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-xs transition-colors"
                        >
                           <UserPlus size={16} />
                           <span>Join Community</span>
                        </button>
                        <a
                           href={REPO_URL}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
                           aria-label="GitHub Repository"
                        >
                           <Github size={18} />
                        </a>
                     </div>
                  </>
               )}
            </div>
         </header>

         {/* "Join NACOSS Community" Modal Dialog */}
         {isJoinModalOpen && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
               {/* Accessible Backdrop Layer */}
               <button
                  type="button"
                  aria-label="Close modal overlay"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-default border-0"
               />

               <div 
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="join-modal-title"
                  className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden z-10"
               >
                  {/* Modal Header */}
                  <div className="flex items-start justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <div>
                           <h2 id="join-modal-title" className="text-xl font-bold text-slate-900">
                              Join NACOSS FUOYE
                           </h2>
                           <p className="text-xs sm:text-sm text-slate-500 font-medium">
                              Connect with fellow student developers & tech innovators
                           </p>
                        </div>
                     </div>
                     <button
                        type="button"
                        onClick={() => setIsJoinModalOpen(false)}
                        aria-label="Close Join Modal"
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                     >
                        <X size={20} />
                     </button>
                  </div>

                  {/* Channel Cards */}
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                     {COMMUNITY_CHANNELS.map((channel) => {
                        const ChannelIcon = channel.icon;
                        const isInternal = channel.url.startsWith('/');
                        return (
                           <div
                              key={channel.name}
                              className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group relative"
                           >
                              <div className="flex items-start gap-3">
                                 <div className={`p-2.5 rounded-xl ${channel.color} shrink-0 shadow-xs`}>
                                    <ChannelIcon size={18} />
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-2">
                                       <h3 className="text-sm font-bold text-slate-800">
                                          {channel.name}
                                       </h3>
                                       <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 absolute right-2 top-2">
                                          {channel.badge}
                                       </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
                                       {channel.desc}
                                    </p>
                                 </div>
                              </div>
                              <div className="w-full sm:w-auto shrink-0">
                                 {isInternal ? (
                                    <Link
                                       href={channel.url}
                                       onClick={() => setIsJoinModalOpen(false)}
                                       className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                    >
                                       <span>{channel.linkText}</span>
                                    </Link>
                                 ) : (
                                    <a
                                       href={channel.url}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-emerald-600 hover:text-white transition-colors"
                                    >
                                       <span>{channel.linkText}</span>
                                       <ExternalLink size={12} />
                                    </a>
                                 )}
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  {/* Footer Notice */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                     <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                     <span>Official Nigeria Association of Computer Science Students (FUOYE Chapter)</span>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}
