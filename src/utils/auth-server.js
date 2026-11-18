import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Validates the authenticated user and gets their assigned role from `user_roles`.
 * Enforces server-side validation against Supabase Auth (using getUser).
 * Redirects to /admin if not authenticated or not registered in user_roles.
 */
export async function requireAuthUser() {
   const supabase = await createClient();
   const { data: { user }, error } = await supabase.auth.getUser();

   if (error || !user) {
      redirect('/admin');
   }

   const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_email', user.email)
      .single();

   if (roleError || !roleData?.role) {
      redirect('/admin?error=unauthorized');
   }

   return { user, role: roleData.role, supabase };
}

/**
 * Validates that the current user has one of the allowed roles.
 * Admins and President always have universal access.
 * If not authorized, redirects to /admin/dashboard.
 */
export async function requireRoles(allowedRoles = []) {
   const { user, role, supabase } = await requireAuthUser();

   if (['admin', 'president'].includes(role)) {
      return { user, role, supabase };
   }

   if (!allowedRoles.includes(role)) {
      redirect('/admin/dashboard');
   }

   return { user, role, supabase };
}

/**
 * Checks if the current user has permission for a specific memo category.
 * - executive/president: admin, president, vp, gen_sec, ags, pro
 * - src: admin, president, src
 * - elecom: admin, president, elecom
 */
export async function requireMemoAccess(memoType = 'executive') {
   const { user, role, supabase } = await requireAuthUser();

   if (['admin', 'president'].includes(role)) {
      return { user, role, supabase };
   }

   if (['executive', 'president'].includes(memoType) && ['vp', 'gen_sec', 'ags', 'pro'].includes(role)) {
      return { user, role, supabase };
   }

   if (memoType === 'src' && role === 'src') {
      return { user, role, supabase };
   }

   if (memoType === 'elecom' && role === 'elecom') {
      return { user, role, supabase };
   }

   redirect('/admin/dashboard');
}

