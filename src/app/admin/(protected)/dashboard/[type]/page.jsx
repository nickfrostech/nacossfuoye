'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import MemoCard from '@/components/MemoCard';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const CATEGORY_NAMES = {
   executive: "Executive Memos",
   src: "Student Representative Memos",
   elecom: "Electoral Committee Memos",
   president: "President's Memos",
};

export default function TypeDashboard() {
   const params = useParams();
   const memoType = params.type || 'executive';
   const title = CATEGORY_NAMES[memoType] || "Memos";

   const [fetchError, setFetchError] = useState(null);
   const [data, setData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState(false);
   const supabase = createClient();

   useEffect(() => {
      let isMounted = true;
      const fetchData = async () => {
         try {
            setLoading(true);
            const { data: fetchedData, error } = await supabase
               .from('memo')
               .select('*')
               .eq('type', memoType)
               .order('created_at', { ascending: order });

            if (isMounted) {
               if (error) {
                  setFetchError('Could not fetch memos');
                  setData([]);
               } else {
                  setData(fetchedData || []);
                  setFetchError(null);
               }
            }
         } finally {
            if (isMounted) {
               setLoading(false);
            }
         }
      };

      fetchData();
      return () => { isMounted = false; };
   }, [order, supabase, memoType]);

   async function handleVisibility(reference, status) {
      setData(currentMemos =>
         currentMemos.map(memo =>
            memo.reference === reference ? { ...memo, is_published: !status } : memo
         )
      );

      const { error } = await supabase
         .from('memo')
         .update({ is_published: !status })
         .eq('reference', reference);

      if (error) {
         console.error("Failed to update memo:", error);
         alert("Error: Could not update the memo's visibility.");
         setData(currentMemos =>
            currentMemos.map(memo =>
               memo.reference === reference ? { ...memo, is_published: status } : memo
            )
         );
      }
   }


   return (
      <div>
         <PageHeader 
            title={title}
            onSortChange={setOrder}
         />

         {fetchError && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
               {fetchError}
            </div>
         )}

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href={`/admin/create?type=${memoType}`} className="group flex flex-col items-center justify-center p-6 h-full rounded-2xl border-2 border-dashed border-slate-300 bg-transparent hover:bg-primary/5 hover:border-primary/50 transition duration-160 ease-out active:scale-[0.97] text-slate-500 hover:text-primary">
               <div className="p-4 rounded-full bg-slate-100 mb-4 group-hover:scale-[1.05] transition-transform duration-160 ease-out">
                  <Plus size={32} />
               </div>
               <span className="font-semibold">Create New Memo</span>
            </Link>

            {loading ? (
               <div className="col-span-full py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
               </div>
            ) : (
               data.map(item => (
                  <MemoCard
                     key={item.id}
                     {...item}
                     isAdminView={true}
                     onToggleVisibility={handleVisibility}
                  />
               ))
            )}
         </div>
      </div>
   );
}
