import { createClient } from '@/utils/supabase/server';
import MemoForm from '@/components/MemoForm';
import { notFound } from 'next/navigation';
import { requireMemoAccess } from '@/utils/auth-server';

export default async function EditMemo({ params }) {
  const { reference } = await params;
  const decodedReference = decodeURIComponent(reference);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('memo')
    .select('*')
    .eq('reference', decodedReference)
    .single();

  if (error || !data) {
    notFound();
  }

  await requireMemoAccess(data.type || 'executive');

  return <MemoForm isNew={false} initialData={data} memoType={data.type || 'executive'} />;
}
