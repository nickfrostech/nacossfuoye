'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import PageHeader from '@/components/PageHeader';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { PaymentReceipt } from '@esvigy/react';
import Notification from '@/components/Notification';

const formatCurrency = (value) => {
   if (!value || parseFloat(value) === 0) return '';
   return '₦' + parseFloat(value).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateString) => {
   const d = new Date(dateString);
   // Use local timezone offsets to prevent off-by-one day issues
   const userTimezoneOffset = d.getTimezoneOffset() * 60000;
   const localDate = new Date(d.getTime() + userTimezoneOffset);
   return localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function LedgerPage() {
   const [transactions, setTransactions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [displayCount, setDisplayCount] = useState(10);
   const [filter, setFilter] = useState('all');
   const [sortOrder, setSortOrder] = useState('desc');

   // Form state
   const [showForm, setShowForm] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [date, setDate] = useState('');
   const [description, setDescription] = useState('');
   const [type, setType] = useState('income');
   const [amount, setAmount] = useState('');
   const [category, setCategory] = useState('');

   const [notification, setNotification] = useState(null);

   const supabase = createClient();
   const router = useRouter();

   const fetchTransactions = useCallback(async () => {
      setLoading(true);

      // 1. Role Check
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_email', user.email)
            .single();
         
         const role = roleData?.role;
         if (!['admin', 'president', 'fin_sec'].includes(role)) {
            router.replace('/admin/dashboard');
            return;
         }
      }

      try {
         const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: true })
            .order('created_at', { ascending: true });

         if (error) {
            console.error('Error fetching transactions:', error);
            return;
         }

         // Calculate running balance
         let currentBalance = 0;
         const processedData = data.map(t => {
            const inc = parseFloat(t.income) || 0;
            const exp = parseFloat(t.expense) || 0;
            currentBalance += (inc - exp);
            return { ...t, computedBalance: currentBalance };
         });

         // Reverse to show latest first
         setTransactions(processedData.reverse());
      } catch (err) {
         console.error('Unexpected error fetching transactions:', err);
      } finally {
         setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router]);

   useEffect(() => {
      fetchTransactions();
   }, [fetchTransactions]);

   // Lock body scroll when modal is open
   useEffect(() => {
      if (showForm) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
      }
      return () => {
         document.body.style.overflow = 'unset';
      };
   }, [showForm]);

   const showNotif = (message, type) => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
   };

   const handleAddTransaction = async (e) => {
      e.preventDefault();

      if (!date || !description || !amount || !category) {
         showNotif('Please fill all fields', 'error');
         return;
      }

      setIsSubmitting(true);

      try {
         const numAmount = parseFloat(amount);
         const income = type === 'income' ? numAmount : 0;
         const expense = type === 'expense' ? numAmount : 0;

         const prevBalance = transactions.length > 0 ? transactions[0].computedBalance : 0;
         const newBalance = prevBalance + income - expense;

         const { data: { user } } = await supabase.auth.getUser();

         const { error } = await supabase
            .from('transactions')
            .insert({
               date,
               description,
               income,
               expense,
               balance: newBalance,
               category,
               created_by: user?.email
            });

         if (error) {
            console.error('Error adding transaction:', error);
            showNotif('Failed to add transaction', 'error');
         } else {
            showNotif('Transaction added successfully', 'success');
            setShowForm(false);
            // Reset form
            setDate('');
            setDescription('');
            setAmount('');
            setCategory('');
            fetchTransactions();
         }
      } catch (err) {
         console.error('Error submitting transaction:', err);
         showNotif('Failed to add transaction', 'error');
      } finally {
         setIsSubmitting(false);
      }
   };

   // Overview metrics
   const totalIncome = transactions.reduce((sum, t) => sum + (parseFloat(t.income) || 0), 0);
   const totalExpense = transactions.reduce((sum, t) => sum + (parseFloat(t.expense) || 0), 0);
   const currentBalance = transactions.length > 0 ? transactions[0].computedBalance : 0;

   // Apply filters and sorting
   let processedList = [...transactions];
   
   if (filter === 'income') {
      processedList = processedList.filter(t => parseFloat(t.income) > 0);
   } else if (filter === 'expense') {
      processedList = processedList.filter(t => parseFloat(t.expense) > 0);
   }

   if (sortOrder === 'asc') {
      processedList = processedList.reverse();
   }

   const displayedTransactions = processedList.slice(0, displayCount);

   return (
      <div>
         {notification && (
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
         )}

         <PageHeader title="Financial Ledger">
            <button
               onClick={() => setShowForm(!showForm)}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all shadow-sm"
            >
               <Plus size={20} />
               <span>New Transaction</span>
            </button>
         </PageHeader>

         {/* Overview Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <p className="text-sm font-medium text-slate-500 mb-1">Total Income</p>
               <h3 className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome) || '₦0.00'}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <p className="text-sm font-medium text-slate-500 mb-1">Total Expense</p>
               <h3 className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense) || '₦0.00'}</h3>
            </div>
            <div className="bg-primary/5 p-6 rounded-2xl shadow-sm border border-primary/10">
               <p className="text-sm font-medium text-primary/80 mb-1">Current Balance</p>
               <h3 className="text-2xl font-bold text-primary">{formatCurrency(currentBalance) || '₦0.00'}</h3>
            </div>
         </div>

         {/* Add Transaction Modal */}
         {showForm && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-xl font-bold text-slate-800">Add New Transaction</h3>
                     <button onClick={() => setShowForm(false)} aria-label="Close add transaction modal" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                     </button>
                  </div>

                  <form onSubmit={handleAddTransaction} className="flex flex-col space-y-5">
                     <div>
                        <label htmlFor="tx-date" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                        <input id="tx-date" aria-label="Transaction Date" required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary outline-none transition-all duration-300 bg-slate-50 focus:bg-white" />
                     </div>
                     <div>
                        <label htmlFor="tx-type" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                        <select id="tx-type" aria-label="Transaction Type" value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary outline-none transition-all duration-300 bg-slate-50 focus:bg-white">
                           <option value="income">Income</option>
                           <option value="expense">Expense</option>
                        </select>
                     </div>
                     <div className="md:col-span-2">
                        <label htmlFor="tx-desc" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                        <input id="tx-desc" aria-label="Transaction Description" required type="text" placeholder="e.g. Student dues" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary outline-none transition-all duration-300 bg-slate-50 focus:bg-white" />
                     </div>
                     <div>
                        <label htmlFor="tx-amount" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (₦)</label>
                        <input id="tx-amount" aria-label="Transaction Amount" required type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary outline-none transition-all duration-300 bg-slate-50 focus:bg-white" />
                     </div>
                     <div>
                        <label htmlFor="tx-cat" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                        <input id="tx-cat" aria-label="Transaction Category" required type="text" placeholder="e.g. Dues, Transport" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary outline-none transition-all duration-300 bg-slate-50 focus:bg-white" />
                     </div>
                     <div className="w-full flex justify-between gap-4 mt-2">
                        <button type="button" onClick={() => setShowForm(false)} className="bg-red-600 rounded-xl font-medium text-white hover:bg-red-700 transition-colors w-full h-12 flex items-center justify-center">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="h-12 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-70 transition-all shadow-sm flex items-center justify-center w-full">
                           {isSubmitting ? 'Saving...' : 'Save Transaction'}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Filter and Sort Controls */}
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 mt-8">
            <h3 className="text-lg font-bold text-slate-800">Transaction History</h3>
            <div className="flex gap-2 w-full sm:w-auto">
               <select 
                  id="tx-filter"
                  aria-label="Filter transactions by type"
                  value={filter} 
                  onChange={(e) => { setFilter(e.target.value); setDisplayCount(10); }}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 outline-none focus:border-primary/50 transition-colors shadow-sm flex-1 sm:flex-none cursor-pointer"
               >
                  <option value="all">All Types</option>
                  <option value="income">Income Only</option>
                  <option value="expense">Expenses Only</option>
               </select>
               <select 
                  id="tx-sort"
                  aria-label="Sort transactions by date"
                  value={sortOrder} 
                  onChange={(e) => { setSortOrder(e.target.value); setDisplayCount(10); }}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 outline-none focus:border-primary/50 transition-colors shadow-sm flex-1 sm:flex-none cursor-pointer"
               >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
               </select>
            </div>
         </div>

         {/* Transactions Table */}
         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-175">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Income</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Expense</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Balance</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {loading ? (
                        <tr>
                           <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">Loading transactions...</td>
                        </tr>
                     ) : displayedTransactions.length === 0 ? (
                        <tr>
                           <td colSpan="6" className="py-16 text-center text-slate-400 font-medium">
                              <div className="flex flex-col items-center justify-center">
                                 <PaymentReceipt animated={true} color="#2563eb" secondaryColor="rgba(37,99,235,0.08)" className="w-28 h-28 mb-3 opacity-90" />
                                 <p className="text-slate-600 font-semibold text-base">No transactions recorded yet</p>
                                 <p className="text-slate-400 text-xs mt-1">Use the "New Transaction" button above to log income or expenses.</p>
                              </div>
                           </td>
                        </tr>
                     ) : (
                        displayedTransactions.map((tx) => (
                           <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{formatDate(tx.date)}</td>
                              <td className="py-4 px-6 text-sm font-medium text-slate-900 max-w-50 sm:max-w-75 whitespace-normal wrap-break-word leading-relaxed">{tx.description}</td>
                              <td className="py-4 px-6 text-sm text-green-600 text-right font-medium">{formatCurrency(tx.income)}</td>
                              <td className="py-4 px-6 text-sm text-red-600 text-right font-medium">{formatCurrency(tx.expense)}</td>
                              <td className="py-4 px-6 text-sm text-slate-800 text-right font-bold">{formatCurrency(tx.computedBalance)}</td>
                              <td className="py-4 px-6 text-sm">
                                 <span className="inline-flex items-center text-[11px] font-bold tracking-wide  text-slate-600">
                                    {tx.category}
                                 </span>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>

            {/* Pagination / Load More */}
            {!loading && processedList.length > displayCount && (
               <div className="p-4 border-t border-slate-100 flex justify-center gap-4 bg-slate-50/50">
                  <button
                     onClick={() => setDisplayCount(prev => prev + 10)}
                     className="px-5 py-2.5 rounded-xl text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                     Load 10 More
                  </button>
                  <button
                     onClick={() => setDisplayCount(processedList.length)}
                     className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors"
                  >
                     Load All ({processedList.length})
                  </button>
               </div>
            )}
         </div>
      </div>
   );
}
