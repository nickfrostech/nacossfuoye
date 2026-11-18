import { requireAuthUser } from '@/utils/auth-server';
import { redirect } from 'next/navigation';

export default async function TemplatesLayout({ children }) {
   const { role } = await requireAuthUser();

   if (['src', 'elecom'].includes(role)) {
      redirect('/admin/dashboard');
   }

   return children;
}

