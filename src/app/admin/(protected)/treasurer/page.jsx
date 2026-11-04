'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Wallet } from '@esvigy/react';

export default function TreasurerPage() {
   const [loading, setLoading] = useState(true);
   const [authorized, setAuthorized] = useState(true);
   const supabase = createClient();

   useEffect(() => {
      let isMounted = true;
      async function checkAccess() {
         const { data: { user } } = await supabase.auth.getUser();
         if (!isMounted) return;
         if (user) {
            const { data: roleData } = await supabase
               .from('user_roles')
               .select('role')
               .eq('user_email', user.email)
               .single();
            
            if (!isMounted) return;
            const role = roleData?.role;
            if (!['admin', 'president', 'treasurer', 'gen_sec', 'ags', 'pro', 'vp'].includes(role)) {
               setAuthorized(false);
               setLoading(false);
               return;
            }
         }
         if (isMounted) setLoading(false);
      }
      
      checkAccess();
      return () => {
         isMounted = false;
      };
   }, [supabase]);

   if (loading) {
      return (
         <div className="flex justify-center items-center h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
         </div>
      );
   }

   if (!authorized) {
      return (
         <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
            <p className="text-slate-600 font-medium">You do not have permission to view this page.</p>
            <Link href="/admin/dashboard" className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all shadow-sm">
               Return to Dashboard
            </Link>
         </div>
      );
   }

   return (
      <div className="animate-in fade-in duration-500">
         <PageHeader title="Treasurer Records" />

         <div className="mt-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
               <div className="px-6 py-20 sm:px-12 sm:py-24 flex flex-col items-center justify-center text-center relative z-10">
                  <Wallet 
                     animated={true} 
                     color="#059669" 
                     secondaryColor="rgba(5,150,105,0.08)" 
                     className="w-36 h-36 mb-6 filter drop-shadow-md" 
                  />
                  
                  <h2 className="text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">
                     Feature Under Construction
                  </h2>
                  
                  <p className="text-lg text-slate-500 max-w-lg mb-8 leading-relaxed font-medium">
                     The Treasurer Records module is currently being built. Soon you'll be able to track detailed treasury reports, budget allocations, and society funds here.
                  </p>
                  
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-full text-slate-600 font-bold text-sm border border-slate-200 shadow-sm">
                     <Clock size={16} className="text-slate-400" />
                     <span>Coming Soon</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
