import { requireRoles } from '@/utils/auth-server';

export default async function TreasurerLayout({ children }) {
   await requireRoles(['admin', 'president', 'treasurer', 'gen_sec', 'ags', 'pro', 'vp']);
   return children;
}

