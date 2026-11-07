'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { ArrowRight, Quote, Shield } from 'lucide-react';
import { Announcement, BalloonPackage, PaymentReceipt, Wallet } from '@esvigy/react';
import { createClient } from '@/utils/supabase/client';

const CATEGORIES = [
   {
      id: 'executive',
      title: 'Executive Memos',
      description: 'Manage official executive communications and directives.'
   },
   {
      id: 'src',
      title: 'Student Representative Memos',
      description: 'Manage memos from the Student Representative Council.'
   },
   {
      id: 'elecom',
      title: 'Electoral Committee Memos',
      description: 'Manage election guidelines, notices, and updates.'
   },
   {
      id: 'president',
      title: "President's Memos",
      description: 'Manage personal memos and addresses from the President.'
   }
];

const BIRTHDAY_TEMPLATES = [
   {
      id: 'executive',
      title: 'Executive Birthday Template',
      description: 'Manage and publish official executive birthday flyers and notices.'
   },
   {
      id: 'outsiders',
      title: 'Outsiders Birthday Template',
      description: 'Manage and publish official outsiders birthday flyers and notices.'
   },
];

const QUOTES_TEMPLATES = [
   {
      id: 'dyk',
      title: 'Do You Know Template',
      description: 'Generate weekly "Do You Know" quotes and facts.'
   },
   {
      id: 'invest_friday',
      title: 'Invest Friday Template',
      description: 'Generate weekly "Invest Friday" financial quotes.'
   }
];

export default function AdminDashBoardHub() {
   const [userRole, setUserRole] = useState(null);
   const [loadingRole, setLoadingRole] = useState(true);

   useEffect(() => {
      async function getRole() {
         const supabase = createClient();
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
            const { data } = await supabase
               .from('user_roles')
               .select('role')
               .eq('user_email', user.email)
               .single();
            setUserRole(data?.role || null);
         }
         setLoadingRole(false);
      }
      getRole();
   }, []);

   if (loadingRole) {
      return (
         <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
               <Shield size={48} className="text-slate-300 mb-4" />
               <p className="text-slate-500 font-medium">Verifying Access...</p>
            </div>
         </div>
      );
   }

   // Filter visible categories based on role
   const visibleCategories = CATEGORIES.filter(cat => {
      if (!userRole) return false;
      if (['admin', 'president'].includes(userRole)) return true;
      if (['vp', 'gen_sec', 'ags', 'pro'].includes(userRole)) {
         return cat.id === 'executive' || cat.id === 'president';
      }
      if (userRole === 'src') return cat.id === 'src';
      if (userRole === 'elecom') return cat.id === 'elecom';
      return false;
   });

   const canViewLedger = ['admin', 'president', 'fin_sec'].includes(userRole);
   const canViewTreasurer = ['admin', 'president', 'treasurer', 'gen_sec', 'ags', 'pro', 'vp'].includes(userRole);
   const canViewTemplates = userRole && !['src', 'elecom'].includes(userRole);

   return (
      <div className="animate-in fade-in duration-500">
         <PageHeader title="Admin Dashboard" />

         {/* Official Memos Section */}
         {visibleCategories.length > 0 && (
            <section id="memos" className="scroll-mt-28">
               <div className="mt-8 mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Official Memos</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage and publish official NACOSS memorandums.</p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {visibleCategories.map((category) => (
                     <Link
                        key={category.id}
                        href={`/admin/dashboard/${category.id}`}
                        className="relative group h-full flex flex-col p-6 rounded-2xl overflow-hidden border border-white/20 transition-[transform] duration-300 ease-out active:scale-[0.98] bg-primary/95 text-white backdrop-blur-md"
                     >
                        {/* Memo Illustration Background Decoration */}
                        <div className="absolute -bottom-8 -right-8 opacity-10 transition-transform duration-500 group-hover:scale-110 pointer-events-none">
                           <Announcement animated={true} color="#ffffff" secondaryColor="rgba(255,255,255,0.2)" className="w-48 h-48" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                           <div className="flex items-start justify-between mb-4">
                              <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs text-white backdrop-blur-sm border border-white/10 font-medium uppercase tracking-wider">
                                 {category.id}
                              </span>
                           </div>

                           <div className="flex flex-col flex-1 py-2">
                              <h3 className="text-xl font-bold text-white leading-snug mb-2">
                                 {category.title}
                              </h3>
                              <p className="text-white/70 text-sm font-medium leading-relaxed">
                                 {category.description}
                              </p>
                           </div>

                           <div className="mt-auto flex justify-between items-center border-t border-white/20 pt-4">
                              <div className="flex items-center text-sm font-semibold text-white opacity-90 group-hover:opacity-100 transition-opacity">
                                 Manage Dashboard <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1 duration-300 ease-out" />
                              </div>
                           </div>
                        </div>
                     </Link>
                  ))}
               </div>
            </section>
         )}

         {/* Financial Section */}
         {(canViewLedger || canViewTreasurer) && (
            <section id="finances" className="scroll-mt-28">
               <div className="mt-12 mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Ledgers</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage finances and treasures.</p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {canViewLedger && (
                     <Link
                        href="/admin/ledger"
                        className="relative group h-full flex flex-col p-6 rounded-2xl overflow-hidden border border-white/20 transition-[transform] duration-300 ease-out active:scale-[0.98] bg-blue-700/95 text-white backdrop-blur-md"
                     >
                        <div className="absolute -bottom-8 -right-8 opacity-10 transition-transform duration-500 group-hover:scale-110 pointer-events-none">
                           <PaymentReceipt animated={true} color="#ffffff" secondaryColor="rgba(255,255,255,0.2)" className="w-48 h-48" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                           <div className="flex items-start justify-between mb-4">
                              <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs text-white backdrop-blur-sm border border-white/10 font-medium uppercase tracking-wider">
                                 Finances
                              </span>
                           </div>

                           <div className="flex flex-col flex-1 py-2">
                              <h3 className="text-xl font-bold text-white leading-snug mb-2">
                                 Financial Ledger
                              </h3>
                              <p className="text-white/70 text-sm font-medium leading-relaxed">
                                 Track income, expenses, and current balance.
                              </p>
                           </div>

                           <div className="mt-auto flex justify-between items-center border-t border-white/20 pt-4">
                              <div className="flex items-center text-sm font-semibold text-white opacity-90 group-hover:opacity-100 transition-opacity">
                                 View Ledger <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1 duration-300 ease-out" />
                              </div>
                           </div>
                        </div>
                     </Link>
                  )}

                  {canViewTreasurer && (
                     <Link
                        href="/admin/treasurer"
                        className="relative group h-full flex flex-col p-6 rounded-2xl overflow-hidden border border-white/20 transition-[transform] duration-300 ease-out active:scale-[0.98] bg-emerald-700/95 text-white backdrop-blur-md"
                     >
                        <div className="absolute -bottom-8 -right-8 opacity-10 transition-transform duration-500 group-hover:scale-110 pointer-events-none">
                           <Wallet animated={true} color="#ffffff" secondaryColor="rgba(255,255,255,0.2)" className="w-48 h-48" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                           <div className="flex items-start justify-between mb-4">
                              <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs text-white backdrop-blur-sm border border-white/10 font-medium uppercase tracking-wider">
                                 Treasury
                              </span>
                           </div>

                           <div className="flex flex-col flex-1 py-2">
                              <h3 className="text-xl font-bold text-white leading-snug mb-2">
                                 Treasurer Records
                              </h3>
                              <p className="text-white/70 text-sm font-medium leading-relaxed">
                                 Manage society treasury records.
                              </p>
                           </div>

                           <div className="mt-auto flex justify-between items-center border-t border-white/20 pt-4">
                              <div className="flex items-center text-sm font-semibold text-white opacity-90 group-hover:opacity-100 transition-opacity">
                                 View Records <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1 duration-300 ease-out" />
                              </div>
                           </div>
                        </div>
                     </Link>
                  )}
               </div>
            </section>
         )}

         {/* Templates Section */}
         {canViewTemplates && (
            <section id="templates" className="scroll-mt-28">
               <div className="mt-12 mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Design Templates</h2>
                  <p className="text-sm text-slate-500 mt-1">Generate flyers, graphics, and other visual assets.</p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {BIRTHDAY_TEMPLATES.map((template) => (
                     <Link
                        key={template.id}
                        href={`/admin/templates/birthday?type=${template.id}`}
                        className="relative group h-full flex flex-col p-6 rounded-2xl overflow-hidden border border-white/20 transition-[transform] duration-300 ease-out active:scale-[0.98] bg-slate-800/95 text-white backdrop-blur-md"
                     >
                        {/* Icon Background Decoration */}
                        <div className="absolute -bottom-8 -right-8 opacity-10 transition-transform duration-500 group-hover:scale-110 pointer-events-none">
                           <BalloonPackage animated={true} color="#ffffff" secondaryColor="rgba(255,255,255,0.2)" className="w-48 h-48" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                           <div className="flex items-start justify-between mb-4">
                              <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs text-white backdrop-blur-sm border border-white/10 font-medium uppercase tracking-wider">
                                 Graphic Design
                              </span>
                           </div>

                           <div className="flex flex-col flex-1 py-2">
                              <h3 className="text-xl font-bold text-white leading-snug mb-2">
                                 {template.title}
                              </h3>
                              <p className="text-white/70 text-sm font-medium leading-relaxed">
                                 {template.description}
                              </p>
                           </div>

                           <div className="mt-auto flex justify-between items-center border-t border-white/20 pt-4">
                              <div className="flex items-center text-sm font-semibold text-white opacity-90 group-hover:opacity-100 transition-opacity">
                                 Create Flyer <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1 duration-300 ease-out" />
                              </div>
                           </div>
                        </div>
                     </Link>
                  ))}

                  {QUOTES_TEMPLATES.map((template) => (
                     <Link
                        key={template.id}
                        href={`/admin/templates/quotes?type=${template.id}`}
                        className="relative group h-full flex flex-col p-6 rounded-2xl overflow-hidden border border-white/20 transition-[transform] duration-300 ease-out active:scale-[0.98] bg-slate-800/95 text-white backdrop-blur-md"
                     >
                        {/* Icon Background Decoration */}
                        <div className="absolute -bottom-6 -right-6 text-white/5 transition-transform duration-800 group-hover:scale-110 group-hover:-translate-y-2 group-hover:-translate-x-2 pointer-events-none">
                           <Quote size={180} strokeWidth={1.5} />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                           <div className="flex items-start justify-between mb-4">
                              <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs text-white backdrop-blur-sm border border-white/10 font-medium uppercase tracking-wider">
                                 Quotes Design
                              </span>
                           </div>

                           <div className="flex flex-col flex-1 py-2">
                              <h3 className="text-xl font-bold text-white leading-snug mb-2">
                                 {template.title}
                              </h3>
                              <p className="text-white/70 text-sm font-medium leading-relaxed">
                                 {template.description}
                              </p>
                           </div>

                           <div className="mt-auto flex justify-between items-center border-t border-white/20 pt-4">
                              <div className="flex items-center text-sm font-semibold text-white opacity-90 group-hover:opacity-100 transition-opacity">
                                 Create Flyer <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1 duration-300 ease-out" />
                              </div>
                           </div>
                        </div>
                     </Link>
                  ))}
               </div>    
            </section>
         )}
      </div>
   );
}
