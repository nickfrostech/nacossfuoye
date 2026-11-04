import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }) {
   const supabase = await createClient();
   const { data: { session }, error } = await supabase.auth.getSession();

   if (error || !session) {
      redirect('/admin');
   }

   return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-16">
         {children}
      </main>
   );
}
