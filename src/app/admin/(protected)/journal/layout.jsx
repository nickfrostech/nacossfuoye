import { requireAuthUser } from '@/utils/auth-server';
import { redirect } from 'next/navigation';

export default async function JournalLayout({ children }) {
   const { role } = await requireAuthUser();

   if (['src', 'elecom'].includes(role)) {
      redirect('/admin/dashboard');
   }

   return children;
}

