import { requireRoles } from '@/utils/auth-server';

export default async function LedgerLayout({ children }) {
   await requireRoles(['admin', 'president', 'fin_sec']);
   return children;
}

