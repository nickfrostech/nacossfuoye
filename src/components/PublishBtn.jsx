'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { createClient } from '@/utils/supabase/client';
import Notification from '@/components/Notification';

const TYPE_PREFIX_MAP = { executive: 'NACOSS', elecom: 'CSCEC', src: 'CSCSRC', president: 'CSCPR' };
const getPrefix = (t) => TYPE_PREFIX_MAP[t] || 'NACOSS';

// Timeout wrapper that guarantees promises will never hang indefinitely
const withTimeout = (promise, ms = 12000, errorMsg = 'Operation timed out. Please check your connection and try again.') => {
   let timer;
   const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(errorMsg)), ms);
   });
   return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timer);
   });
};

// Resilient session & user resolver that handles expired tokens and tab sleep
const getActiveUser = async (supabase) => {
   // 1. Fast path: check current local session
   try {
      const { data: sessionData, error: sessionErr } = await withTimeout(
         supabase.auth.getSession(),
         6000,
         'Local session check timed out'
      );

      if (!sessionErr && sessionData?.session?.user) {
         const expiresAt = sessionData.session.expires_at;
         const nowInSeconds = Math.floor(Date.now() / 1000);
         // If token has more than 60 seconds of validity remaining, use it immediately
         if (expiresAt && expiresAt - nowInSeconds > 60) {
            return { user: sessionData.session.user, error: null };
         }
      }
   } catch (err) {
      console.warn('Initial session check error:', err);
   }

   // 2. Token is close to expiring, expired, or missing in memory: proactively refresh
   try {
      const { data: refreshData, error: refreshErr } = await withTimeout(
         supabase.auth.refreshSession(),
         8000,
         'Session refresh timed out'
      );
      if (!refreshErr && refreshData?.session?.user) {
         return { user: refreshData.session.user, error: null };
      }
   } catch (err) {
      console.warn('Token refresh attempt failed:', err);
   }

   // 3. Fallback: query getUser() with a strict timeout
   try {
      const { data: userData, error: userErr } = await withTimeout(
         supabase.auth.getUser(),
         8000,
         'User verification timed out'
      );
      if (!userErr && userData?.user) {
         return { user: userData.user, error: null };
      }
      return { user: null, error: userErr || new Error('No active user session') };
   } catch (err) {
      return { user: null, error: err };
   }
};

export const AddNewMemo = forwardRef(({ referenceNumber, date, head, content, type = 'executive' }, ref) => {
   const [isAdding, setIsAdding] = useState(false);
   const [notification, setNotification] = useState(null);
   const supabase = createClient();

   const showNotification = (message, type) => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3500);
   };

   useImperativeHandle(ref, () => ({
      publish: async () => await addMemo()
   }));

   async function addMemo() {
      if (!window.confirm('Are you sure you want to publish this memo?')) return false;

      setIsAdding(true);
      const allProvided = [referenceNumber, date, head, content].every(
         v => v !== null && v !== undefined && String(v).trim() !== ""
      );

      try {
         if (!allProvided) {
            showNotification('Please provide all fields', 'error');
            return false;
         }

         const prefix = getPrefix(type);
         const currentYearSuffix = new Date().getFullYear().toString().slice(-2);
         const regex = new RegExp(`^${prefix}\\/${currentYearSuffix}\\/\\d{1,3}$`);

         if (!regex.test(referenceNumber)) {
            showNotification(`Reference must follow format: ${prefix}/${currentYearSuffix}/XXX`, 'error');
            return false;
         }

         const { user, error: userError } = await getActiveUser(supabase);
         if (!user) {
            console.error('User auth verification failed:', userError);
            showNotification('Your session expired. Please open a new tab to log in, then click Publish again.', 'error');
            return false;
         }

         const { error } = await withTimeout(
            supabase.from('memo').insert({
               reference: referenceNumber,
               date: date,
               head: head,
               content: content,
               type: type,
               created_by: user?.email
            }),
            12000,
            'Saving memo timed out. Please check your internet connection.'
         );

         if (error) {
            if (error.code === '23505') {
               showNotification('Reference number already exists.', 'error');
               return false;
            } else if (error.code === '42501') {
               showNotification('Permission denied or session expired. Please re-login.', 'error');
               return false;
            } else {
               showNotification(error.message || 'Server error, please try again', 'error');
               return false;
            }
         }

         // Clean up auto-saved draft upon successful publish
         if (typeof window !== 'undefined') {
            try {
               localStorage.removeItem(`nacoss_memo_draft_${type}`);
            } catch (e) {
               console.warn('Could not clear local draft:', e);
            }
         }

         showNotification('Published successfully!', 'success');
         return true;
      } catch (error) {
         console.error('Publish error:', error);
         showNotification(error.message || 'Failed to publish memo. Please try again.', 'error');
         return false;
      } finally {
         setIsAdding(false);
      }
   }

   return (
      <>
         {notification && <Notification message={notification.message} type={notification.type} />}
         <button
            id="publish-memo-btn"
            className="px-6 py-3 bg-primary/95 hover:bg-primary backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 ease-out active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            disabled={isAdding}
            onClick={addMemo}
         >
            {isAdding ? 'Publishing...' : 'Publish Memo'}
         </button>
      </>
   );
});

export const UpdateMemo = forwardRef(({ referenceNumber, date, head, content, type = 'executive' }, ref) => {
   const [isAdding, setIsAdding] = useState(false);
   const [notification, setNotification] = useState(null);
   const supabase = createClient();

   const showNotification = (message, type) => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3500);
   };

   useImperativeHandle(ref, () => ({
      publish: async () => await updateMemo()
   }));

   async function updateMemo() {
      if (!window.confirm('Are you sure you want to update this memo?')) return false;

      setIsAdding(true);
      const allProvided = [referenceNumber, date, head, content].every(
         v => v !== null && v !== undefined && String(v).trim() !== ""
      );

      try {
         if (!allProvided) {
            showNotification('Please provide all fields', 'error');
            return false;
         }

         const { user, error: userError } = await getActiveUser(supabase);
         if (!user) {
            console.error('User auth verification failed:', userError);
            showNotification('Your session expired. Please open a new tab to log in, then click Update again.', 'error');
            return false;
         }

         const { error } = await withTimeout(
            supabase.from('memo').update({
               date: date,
               head: head,
               content: content,
               type: type,
               last_edited_by: user?.email,
            }).eq('reference', referenceNumber),
            12000,
            'Updating memo timed out. Please check your internet connection.'
         );

         if (error) {
            if (error.code === '42501') {
               showNotification('Permission denied or session expired. Please re-login.', 'error');
               return false;
            } else {
               showNotification(error.message || 'Server error, please try again', 'error');
               return false;
            }
         }

         showNotification('Updated successfully!', 'success');
         return true;
      } catch (error) {
         console.error('Update error:', error);
         showNotification(error.message || 'Failed to update memo. Please try again.', 'error');
         return false;
      } finally {
         setIsAdding(false);
      }
   }

   return (
      <>
         {notification && <Notification message={notification.message} type={notification.type} />}
         <button
            id="publish-memo-btn"
            className="px-6 py-3 bg-primary/95 hover:bg-primary backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 ease-out active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            disabled={isAdding}
            onClick={updateMemo}
         >
            {isAdding ? 'Updating...' : 'Update Memo'}
         </button>
      </>
   );
});