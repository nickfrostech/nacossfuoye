import { createClient } from '@/utils/supabase/server';
import ViewMemoClient from './ViewMemoClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
   const { reference } = await params;
   const decodedReference = decodeURIComponent(reference);

   const supabase = await createClient();
   const { data } = await supabase
      .from('memo')
      .select('head, date, reference')
      .eq('reference', decodedReference)
      .single();

   if (!data) {
      return {
         title: 'Memo Not Found',
         robots: { index: false, follow: false },
      };
   }

   const memoUrl = `/${encodeURIComponent(data.reference)}`;
   const memoTitle = `${data.head} | Official Memorandum`;
   const memoDesc = `Official NACOSS Memorandum: "${data.head}". Reference: ${data.reference}. Date: ${data.date}. Department of Computer Science, FUOYE.`;

   return {
      title: data.head,
      description: memoDesc,
      alternates: {
         canonical: memoUrl,
      },
      openGraph: {
         title: memoTitle,
         description: memoDesc,
         url: memoUrl,
         type: 'article',
         publishedTime: data.date,
         authors: ['NACOSS FUOYE Executive Council'],
         images: [
            {
               url: '/og.png',
               width: 1200,
               height: 630,
               alt: `NACOSS FUOYE Memo - ${data.head}`,
            },
         ],
      },
      twitter: {
         card: 'summary_large_image',
         title: memoTitle,
         description: memoDesc,
         images: ['/og.png'],
         creator: '@nacossfuoye',
      },
   };
}

export default async function ViewMemoPage({ params }) {
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

   const [
      { data: previous },
      { data: next }
   ] = await Promise.all([
      supabase
         .from('memo')
         .select('reference')
         .eq('is_published', true)
         .gt('created_at', currentMemo.created_at)
         .order('created_at', { ascending: false })
         .limit(1),
      supabase
         .from('memo')
         .select('reference')
         .eq('is_published', true)
         .lt('created_at', currentMemo.created_at)
         .order('created_at', { ascending: false })
         .limit(1)
   ]);

   return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8 pb-12">
         <ViewMemoClient
            memo={currentMemo}
            previousRef={previous?.[0]?.reference || null}
            nextRef={next?.[0]?.reference || null}
         />
      </main>
   );
}
