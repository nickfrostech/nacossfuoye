import { createClient } from '@/utils/supabase/server';
import ViewMemoClient from '@/app/[reference]/ViewMemoClient';
import { notFound } from 'next/navigation';
import { requireMemoAccess } from '@/utils/auth-server';

export async function generateMetadata({ params }) {
   const { reference } = await params;
   const decodedReference = decodeURIComponent(reference);

   const supabase = await createClient();
   const { data } = await supabase
      .from('memo')
      .select('head, reference')
      .eq('reference', decodedReference)
      .single();

   if (!data) {
      return {
         title: 'Memo Not Found',
         robots: { index: false, follow: false },
      };
   }

   return {
      title: `${data.head} (Admin View)`,
      description: `Admin View: ${data.head} - Reference ${data.reference}`,
      robots: { index: false, follow: false },
   };
}

export default async function AdminViewMemoPage({ params }) {
   const { reference } = await params;
   const decodedReference = decodeURIComponent(reference);

   const supabase = await createClient();

   const { data: currentMemo, error } = await supabase
      .from('memo')
      .select('*')
      .eq('reference', decodedReference)
      .single();

   if (error || !currentMemo) {
      notFound();
   }

   await requireMemoAccess(currentMemo.type || 'executive');

   const [
      { data: previous },
      { data: next }
   ] = await Promise.all([
      supabase
         .from('memo')
         .select('reference')
         .eq('type', currentMemo.type || 'executive')
         .gt('created_at', currentMemo.created_at)
         .order('created_at', { ascending: false })
         .limit(1),
      supabase
         .from('memo')
         .select('reference')
         .eq('type', currentMemo.type || 'executive')
         .lt('created_at', currentMemo.created_at)
         .order('created_at', { ascending: false })
         .limit(1)
   ]);

   return (
      <ViewMemoClient
         memo={currentMemo}
         previousRef={previous?.[0]?.reference || null}
         nextRef={next?.[0]?.reference || null}
         isAdmin={true}
      />
   );
}
