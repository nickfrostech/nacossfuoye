import MemoForm from '@/components/MemoForm';
import { requireMemoAccess } from '@/utils/auth-server';

export default async function CreateNewMemo({ searchParams }) {
   const params = await searchParams;
   const type = params?.type || 'executive';
   await requireMemoAccess(type);
   return <MemoForm isNew={true} memoType={type} />;
}
