import { requireMemoAccess } from '@/utils/auth-server';

export default async function TypeDashboardLayout({ children, params }) {
   const { type } = await params;
   await requireMemoAccess(type);
   return children;
}

