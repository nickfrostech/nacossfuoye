'use client';

import { useState, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EyeOff, Eye, ArrowRight } from 'lucide-react';
import { SecurityLock } from '@esvigy/react';

function AdminLoginForm() {
   const searchParams = useSearchParams();
   const isUnauthorized = searchParams.get('error') === 'unauthorized';

   const [formData, setFormData] = useState({ email: '', password: '' });
   const [isLoading, setIsLoading] = useState(false);
   const [errors, setErrors] = useState({});
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState(
      isUnauthorized ? 'Access denied: Your account is not assigned an administrative role.' : ''
   );
   const router = useRouter();
   const supabase = createClient();

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
   };

   const validateForm = () => {
      const newErrors = {};
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      if (!validateForm()) return;

      setIsLoading(true);
      try {
         const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
         });

         if (signInError) {
            setError(signInError.message);
            return;
         }

         router.push("/admin/dashboard");
         router.refresh();
      } catch (err) {
         setError(err?.message || "An unexpected error occurred during sign in.");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8 pb-12 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
         <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8">
            <div className="flex flex-col items-center mb-8">
               <SecurityLock 
                  animated={true} 
                  color="#039133" 
                  secondaryColor="rgba(3,145,51,0.08)" 
                  className="w-24 h-24 mb-3 filter drop-shadow-sm" 
               />
               <h1 className="text-2xl font-bold text-slate-900 font-nasalization text-center">Admin Login</h1>
               <p className="text-slate-500 mt-1 text-center text-sm">Access the NACOSS Portal management dashboard.</p>
            </div>

            {error && (
               <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl text-red-600 text-sm text-center">
                  {error}
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
               <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <input
                     type="email"
                     id="email"
                     name="email"
                     value={formData.email}
                     onChange={handleChange}
                     className={`w-full px-4 py-3 rounded-lg border-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary/20'} outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white`}
                     placeholder="admin@nacoss.org"
                     autoComplete="email"
                  />
                  {errors.email && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.email}</p>}
               </div>

               <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                     <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border-2 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary/20'} outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white`}
                        placeholder="Enter password"
                        autoComplete="current-password"
                     />
                     <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors active:scale-[0.97] duration-160 ease-out"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                     >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                     </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.password}</p>}
               </div>

               <div className="pt-2">
                  <button
                     type="submit"
                     disabled={isLoading}
                     className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition duration-160 ease-out active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                     {isLoading ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Authenticating...
                        </>
                     ) : (
                        <>Sign In <ArrowRight size={18} /></>
                     )}
                  </button>
               </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
               <Link href="/" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-1">
                  <ArrowRight size={14} className="rotate-180" /> Return to Student Page
               </Link>
            </div>
         </div>
      </main>
   );
}

export default function AdminLogin() {
   return (
      <Suspense fallback={
         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8 pb-12 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 flex justify-center">
               <div className="animate-pulse text-slate-400">Loading admin portal...</div>
            </div>
         </main>
      }>
         <AdminLoginForm />
      </Suspense>
   );
}
