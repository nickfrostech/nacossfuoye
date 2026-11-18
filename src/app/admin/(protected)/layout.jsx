import { requireAuthUser } from '@/utils/auth-server';

export default async function ProtectedLayout({ children }) {
   await requireAuthUser();

   return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-16">
         {children}
      </main>
   );
}
