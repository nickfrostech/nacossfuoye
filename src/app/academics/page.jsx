'use client';

import { useState } from 'react';
import {
   ArrowRight,
   Send,
   Laptop,
   CheckCircle2,
   AlertCircle,
   BookOpen,
   ExternalLink
} from 'lucide-react';
import { DocumentFolders } from '@esvigy/react';
import COURSES_DATA from '@/data/courses.json';

const VP_WHATSAPP_NUMBER = '2347043068635';
const MATERIAL_CONTRIBUTION_MSG = encodeURIComponent(
   `Hello Vice President, I would like to contribute academic materials or software to the NACOSS FUOYE Portal.\n\n` +
   `• Contributor Name: \n` +
   `• Course Code / Material Title: \n` +
   `• Academic Level (100L-400L): \n` +
   `• Drive Link / File Attachment: `
);
const CONTRIBUTE_MATERIALS_URL = `https://wa.me/${VP_WHATSAPP_NUMBER}?text=${MATERIAL_CONTRIBUTION_MSG}`;
const DEFAULT_DRIVE_URL = 'https://drive.google.com/drive/folders/1xx2xCsIKWdqYBSSZb4eCVnidQTTm_515?usp=sharing';

const LEVEL_DRIVE_LINKS = {
   '100': DEFAULT_DRIVE_URL,
   '200': DEFAULT_DRIVE_URL,
   '300': DEFAULT_DRIVE_URL,
   '400': DEFAULT_DRIVE_URL,
};

const getLevelDriveUrl = (level) => LEVEL_DRIVE_LINKS[level] || DEFAULT_DRIVE_URL;

const LEVELS = [
   { id: 'all', label: 'All Levels' },
   { id: '100', label: '100 Level' },
   { id: '200', label: '200 Level' },
   { id: '300', label: '300 Level' },
   { id: '400', label: '400 Level' },
];

export default function AcademicsPage() {
   const [activeLevel, setActiveLevel] = useState('all');
   const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'software'

   // Software Request Form State (to be wired to Google Apps Script)
   const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      matricNo: '',
      level: '100 Level',
      softwareName: '',
      courseCode: '',
      os: 'Windows (64-bit)',
      deliveryMethod: 'Flash Drive Pickup at Lab',
      phone: '',
      notes: '',
   });
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isSubmitted, setIsSubmitted] = useState(false);
   const [submitError, setSubmitError] = useState('');

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSoftwareSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitError('');

      try {
         const scriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
         if (scriptUrl) {
            await fetch(scriptUrl, {
               method: 'POST',
               mode: 'no-cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  type: 'software_request',
                  ...formData,
                  timestamp: new Date().toISOString(),
               }),
            });
         } else {
            await new Promise((resolve) => setTimeout(resolve, 800));
         }
         setIsSubmitted(true);
      } catch (err) {
         console.error('Submission error:', err);
         setSubmitError('Unable to send request. Please check your internet connection and try again.');
      } finally {
         setIsSubmitting(false);
      }
   };

   const resetForm = () => {
      setFormData({
         fullName: '',
         email: '',
         matricNo: '',
         level: '100 Level',
         softwareName: '',
         courseCode: '',
         os: 'Windows (64-bit)',
         deliveryMethod: 'Flash Drive Pickup at Lab',
         phone: '',
         notes: '',
      });
      setIsSubmitted(false);
   };

   const filteredVaults = activeLevel === 'all'
      ? COURSES_DATA
      : COURSES_DATA.filter((item) => item.level === activeLevel);

   return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
         {/* Academic & Software Materials Hero Section */}
         <section className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-blue-700 p-6 sm:p-10 md:p-14 mb-10 text-white">
            {/* Background Watermark DocumentFolders SVG */}
            <div className="absolute -right-8 -bottom-12 sm:-right-12 sm:-bottom-16 md:-right-16 md:-bottom-20 lg:-right-12 lg:-bottom-16 w-72 h-72 sm:w-96 sm:h-96 md:w-120 md:h-120 lg:w-xl lg:h-144 opacity-20 pointer-events-none select-none">
               <DocumentFolders
                  animated={true}
                  color="#ffffff"
                  secondaryColor="rgba(255,255,255,0.2)"
                  className="w-full h-full"
               />
            </div>

            {/* Foreground Details & Call to Action */}
            <div className="relative z-10 max-w-3xl space-y-5 text-center sm:text-left">
               <p className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white/90">
                  Department of Computer Science &bull; FUOYE
               </p>

               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                  Academic &amp; <br />
                  <span className="text-white">
                     Software Materials
                  </span>
               </h1>

               <p className="text-blue-50 text-base sm:text-lg leading-relaxed max-w-xl mx-auto sm:mx-0 font-medium">
                  Official departmental curriculum, registered units, course outlines, and verified software programmes and lab packages curated for FUOYE Computer Science students.
               </p>

               {/* Call to Action Buttons */}
               <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3.5">
                  <a
                     href="#academics-tabs"
                     onClick={() => setActiveTab('courses')}
                     className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-blue-700 font-bold text-sm shadow-sm hover:shadow-md transition-all duration-300 active:scale-95"
                  >
                     <span>Explore Course Vaults</span>
                     <ArrowRight size={18} />
                  </a>

                  <a
                     href="#academics-tabs"
                     onClick={() => setActiveTab('software')}
                     className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/20 backdrop-blur-xs transition-all duration-300 active:scale-95"
                  >
                     <Laptop size={16} className="text-white" />
                     <span>Software &amp; Programmes</span>
                  </a>
               </div>
            </div>
         </section>

         {/* Navigation Tabs (Courses vs Software) */}
         <div id="academics-tabs" className="scroll-mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="w-full sm:w-auto p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
               <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5">
                  <button
                     type="button"
                     onClick={() => setActiveTab('courses')}
                     className={`w-full sm:w-auto px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.98] ${activeTab === 'courses'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-blue-700'
                        }`}
                  >
                     <BookOpen size={16} className="shrink-0" />
                     <span className="sm:hidden">Courses</span>
                     <span className="hidden sm:inline">Course Vaults &amp; Units</span>
                  </button>

                  <button
                     type="button"
                     onClick={() => setActiveTab('software')}
                     className={`w-full sm:w-auto px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.98] ${activeTab === 'software'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-blue-700'
                        }`}
                  >
                     <Laptop size={16} className="shrink-0" />
                     <span className="sm:hidden">Software</span>
                     <span className="hidden sm:inline">Software &amp; Programmes</span>
                  </button>
               </div>
            </div>

            {/* Level Filter Tabs (Shown when in courses tab) */}
            {activeTab === 'courses' && (
               <div className="w-full sm:w-auto overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-0.5">
                  <div className="flex items-center gap-1.5 min-w-max">
                     {LEVELS.map((lvl) => (
                        <button
                           key={lvl.id}
                           type="button"
                           onClick={() => setActiveLevel(lvl.id)}
                           className={`shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none active:scale-[0.97] whitespace-nowrap ${activeLevel === lvl.id
                              ? 'bg-blue-700 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700'
                              }`}
                        >
                           {lvl.label}
                        </button>
                     ))}
                  </div>
               </div>
            )}
         </div>

         {/* TAB 1: COURSE VAULTS & REGISTERED UNITS */}
         {activeTab === 'courses' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-16">
               {filteredVaults.map((vault) => (
                  <div
                     key={vault.level}
                     className="relative flex flex-col p-5 sm:p-7 rounded-3xl bg-white border border-slate-200 overflow-hidden"
                  >
                     {/* Card Header: Level Name, Total Units, Courses Count, Request Software */}
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-2.5">
                           <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                              {vault.title}
                           </h3>
                           <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                              {vault.totalUnits} Units
                           </span>
                           <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              {vault.courses.length} Courses
                           </span>
                        </div>

                        <a
                           href={getLevelDriveUrl(vault.level)}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs sm:text-sm border border-blue-200/60 transition-colors shrink-0 self-start sm:self-center"
                        >
                           <span>View All Materials</span>
                           <ExternalLink size={14} />
                        </a>
                     </div>

                     {/* Courses Table */}
                     <div className="overflow-x-auto -mx-2 sm:mx-0">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                           <thead>
                              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                                 <th className="py-2.5 px-3">Code</th>
                                 <th className="py-2.5 px-3">Course Title</th>
                                 <th className="py-2.5 px-3 text-center">Status</th>
                                 <th className="py-2.5 px-3 text-center">Units</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {vault.courses.map((course) => (
                                 <tr key={course.code} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                                       {course.code}
                                    </td>
                                    <td className="py-2.5 px-3 font-medium text-slate-700">
                                       {course.title}
                                    </td>
                                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                       <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${course.status === 'C' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                                          course.status === 'R' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' :
                                             course.status === 'E' ? 'bg-sky-50 text-sky-700 border border-sky-200/60' :
                                                'bg-purple-50 text-purple-700 border border-purple-200/60'
                                          }`}>
                                          {course.status}
                                       </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-bold text-slate-800 whitespace-nowrap">
                                       {course.units}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                           <tfoot>
                              <tr className="border-t-2 border-slate-200 bg-slate-50/50 font-bold text-slate-800">
                                 <td colSpan={3} className="py-2.5 px-3 text-right text-xs uppercase tracking-wider text-slate-600">
                                    Total Registered Units:
                                 </td>
                                 <td className="py-2.5 px-3 text-center font-extrabold text-blue-700 text-sm">
                                    {vault.totalUnits}
                                 </td>
                              </tr>
                           </tfoot>
                        </table>
                     </div>

                     {/* Status Legend */}
                     <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                        <span className="font-bold text-slate-600">Status:</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> C = Compulsory</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> R = Required</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500" /> E = Elective</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> G = General</span>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* TAB 2: SOFTWARE & PROGRAMMES (Direct Request Form) */}
         {activeTab === 'software' && (
            <div className="max-w-3xl mx-auto mb-16">
               <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs relative overflow-hidden">
                  {/* Form Header */}
                  <div className="mb-8 pb-6 border-b border-slate-100">
                     <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Request Software or Programme
                     </h2>
                     <p className="text-slate-600 text-sm sm:text-base mt-2 font-medium leading-relaxed">
                        Need a specialized IDE, compiler, simulator, database suite, or course development package? Fill out the form below. Once provisioned, verified installers will be made available for flash-drive pickup at the department lab or shared via direct repository access.
                     </p>
                  </div>

                  {isSubmitted ? (
                     /* Confirmation Screen */
                     <div className="text-center py-8 px-4 flex flex-col items-center animate-in fade-in duration-300">
                        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-5">
                           <CheckCircle2 size={40} />
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900 mb-2">
                           Request Submitted Successfully!
                        </h3>

                        <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed mb-6 font-medium">
                           Thank you, <strong className="text-slate-800">{formData.fullName}</strong>. Your request for <strong className="text-blue-700">{formData.softwareName}</strong> has been logged with the Technical Directorate.
                        </p>

                        {/* Request Summary Card */}
                        <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs sm:text-sm text-slate-600 space-y-2 mb-8">
                           <div className="flex justify-between py-1 border-b border-slate-200/60">
                              <span className="font-semibold text-slate-500">Matric No:</span>
                              <span className="font-bold text-slate-800">{formData.matricNo}</span>
                           </div>
                           <div className="flex justify-between py-1 border-b border-slate-200/60">
                              <span className="font-semibold text-slate-500">Level:</span>
                              <span className="font-bold text-slate-800">{formData.level}</span>
                           </div>
                           <div className="flex justify-between py-1 border-b border-slate-200/60">
                              <span className="font-semibold text-slate-500">Operating System:</span>
                              <span className="font-bold text-slate-800">{formData.os}</span>
                           </div>
                           <div className="flex justify-between py-1">
                              <span className="font-semibold text-slate-500">Delivery Preference:</span>
                              <span className="font-bold text-blue-700">{formData.deliveryMethod}</span>
                           </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3">
                           <button
                              type="button"
                              onClick={resetForm}
                              className="px-6 py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
                           >
                              Submit Another Request
                           </button>

                           <button
                              type="button"
                              onClick={() => {
                                 setActiveTab('courses');
                                 document.getElementById('academics-tabs')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-95 cursor-pointer"
                           >
                              Return to Course Vaults
                           </button>
                        </div>
                     </div>
                  ) : (
                     /* Software Request Form */
                     <form onSubmit={handleSoftwareSubmit} className="space-y-6">
                        {/* Full Name & Matric Number */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                 Full Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                 id="fullName"
                                 name="fullName"
                                 type="text"
                                 required
                                 value={formData.fullName}
                                 onChange={handleInputChange}
                                 placeholder="e.g. Adebayo Emmanuel"
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
                              />
                           </div>

                           <div className="space-y-1.5">
                              <label htmlFor="matricNo" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                 Matric Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                 id="matricNo"
                                 name="matricNo"
                                 type="text"
                                 required
                                 value={formData.matricNo}
                                 onChange={handleInputChange}
                                 placeholder="e.g. CSC/2021/1045"
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
                              />
                           </div>
                        </div>

                        {/* Level & Course Code */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label htmlFor="level" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                 Level of Study <span className="text-red-500">*</span>
                              </label>
                              <select
                                 id="level"
                                 name="level"
                                 value={formData.level}
                                 onChange={handleInputChange}
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
                              >
                                 <option value="100 Level">100 Level</option>
                                 <option value="200 Level">200 Level</option>
                                 <option value="300 Level">300 Level</option>
                                 <option value="400 Level">400 Level</option>
                                 <option value="Postgraduate / Other">Postgraduate / Other</option>
                              </select>
                           </div>

                           <div className="space-y-1.5">
                              <label htmlFor="courseCode" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                 Relevant Course Code <span className="text-slate-400 font-normal">(Optional)</span>
                              </label>
                              <input
                                 id="courseCode"
                                 name="courseCode"
                                 type="text"
                                 value={formData.courseCode}
                                 onChange={handleInputChange}
                                 placeholder="e.g. CSC 201, CSC 303, CSC 407"
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
                              />
                           </div>
                        </div>

                        {/* Software or Programme Name */}
                        <div className="space-y-1.5">
                           <label htmlFor="softwareName" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                              Software or Programme Name <span className="text-red-500">*</span>
                           </label>
                           <input
                              id="softwareName"
                              name="softwareName"
                              type="text"
                              required
                              value={formData.softwareName}
                              onChange={handleInputChange}
                              placeholder="e.g. MATLAB R2023b, Cisco Packet Tracer 8.2, Android Studio, Oracle VirtualBox"
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
                           />
                        </div>

                        {/* Operating System & Delivery Preference */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label htmlFor="os" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                 Target Operating System <span className="text-red-500">*</span>
                              </label>
                              <select
                                 id="os"
                                 name="os"
                                 value={formData.os}
                                 onChange={handleInputChange}
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
                              >
                                 <option value="Windows (64-bit)">Windows (64-bit)</option>
                                 <option value="Windows (32-bit)">Windows (32-bit)</option>
                                 <option value="macOS (Apple Silicon M-Series)">macOS (Apple Silicon M-Series)</option>
                                 <option value="macOS (Intel)">macOS (Intel)</option>
                                 <option value="Linux (Ubuntu / Debian)">Linux (Ubuntu / Debian)</option>
                              </select>
                           </div>

                           <div className="space-y-1.5">
                              <label htmlFor="deliveryMethod" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                 Preferred Delivery Method <span className="text-red-500">*</span>
                              </label>
                              <select
                                 id="deliveryMethod"
                                 name="deliveryMethod"
                                 value={formData.deliveryMethod}
                                 onChange={handleInputChange}
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
                              >
                                 <option value="Flash Drive Pickup at Lab">Flash Drive Pickup at Department Lab</option>
                                 <option value="Google Drive / Cloud Link">Google Drive / Direct Cloud Link</option>
                                 <option value="Either / Whichever is Faster">Either / Whichever is Faster</option>
                              </select>
                           </div>
                        </div>

                        {/* Email & Phone / WhatsApp Number */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                 Email Address <span className="text-red-500">*</span>
                              </label>
                              <input
                                 id="email"
                                 name="email"
                                 type="email"
                                 required
                                 value={formData.email}
                                 onChange={handleInputChange}
                                 placeholder="e.g. student@gmail.com"
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
                              />
                           </div>

                           <div className="space-y-1.5">
                              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                 Phone or WhatsApp Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                 id="phone"
                                 name="phone"
                                 type="tel"
                                 required
                                 value={formData.phone}
                                 onChange={handleInputChange}
                                 placeholder="e.g. 08123456789"
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
                              />
                           </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="space-y-1.5">
                           <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                              Additional Notes / Specific Version Details <span className="text-slate-400 font-normal">(Optional)</span>
                           </label>
                           <textarea
                              id="notes"
                              name="notes"
                              rows={3}
                              value={formData.notes}
                              onChange={handleInputChange}
                              placeholder="Mention any specific plugins, extension packs, license keys, or hardware constraints (e.g. 4GB RAM laptop)..."
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all resize-y"
                           />
                        </div>

                        {/* Notice Banner */}
                        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-3 text-xs text-blue-900">
                           <p className="leading-relaxed font-medium">
                              Requests are processed on departmental lab days. All installers provided through the Technical Directorate are virus-scanned and pre-tested to save your personal internet data.
                           </p>
                        </div>

                        {/* Error Alert directly above submit button */}
                        {submitError && (
                           <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <AlertCircle size={18} className="text-rose-600 shrink-0" />
                              <span>{submitError}</span>
                           </div>
                        )}

                        {/* Submit Button */}
                        <button
                           type="submit"
                           disabled={isSubmitting}
                           className="w-full py-4 px-6 rounded-2xl bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                        >
                           {isSubmitting ? (
                              <>
                                 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                 <span>Submitting Request...</span>
                              </>
                           ) : (
                              <>
                                 <Send size={18} />
                                 <span>Submit Software Request</span>
                              </>
                           )}
                        </button>
                     </form>
                  )}
               </div>
            </div>
         )}

         {/* Contribution Notice */}
         <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 text-center flex flex-col items-center mx-auto">
            <DocumentFolders animated={true} color="#1d4ed8" secondaryColor="rgba(29,78,216,0.12)" className="w-20 h-20 mb-3" />
            <h4 className="text-xl font-bold text-slate-900 mb-2">Have Materials or Software to Contribute?</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-md font-medium">
               If you are a lecturer, course representative, or student with past questions, lecture notes, textbooks, or useful software packages and installers to share with fellow students, please get in touch with the academic and technical committee.
            </p>
            <a
               href={CONTRIBUTE_MATERIALS_URL}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 text-sm font-bold shadow-xs hover:shadow-sm transition-all active:scale-95"
            >
               <span>Message VP with Materials</span>
               <ArrowRight size={16} />
            </a>
         </div>
      </main>
   );
}
