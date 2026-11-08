'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
   ArrowRight,
   ShieldCheck,
   Lock,
   Code2,
   Rocket,
   Sparkles,
   ExternalLink,
   Github,
   CheckCircle2,
   AlertCircle,
   Send,
   PlusCircle,
   Loader2,
} from 'lucide-react';
import { WomanLaptop } from '@esvigy/react';
import { SHOWCASE_PROJECTS } from '@/data/portal-updates';

const CATEGORIES = ['All', 'Web App', 'FinTech', 'EdTech', 'AI / ML', 'Developer Tool', 'Student Tool'];

export default function BuildLabPage() {
   const [activeView, setActiveView] = useState('showcase'); // 'showcase' | 'incubate' | 'submit'
   const [selectedCategory, setSelectedCategory] = useState('All');
   const [submissionType, setSubmissionType] = useState('product'); // 'product' | 'idea'
   const [submitStatus, setSubmitStatus] = useState(null); // null | 'success' | 'error'
   const [submitMessage, setSubmitMessage] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [showcaseProjects, setShowcaseProjects] = useState(SHOWCASE_PROJECTS);
   const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      level: '100',
      title: '',
      demoUrl: '',
      githubUrl: '',
      phone: '',
      desc: '',
   });

   useEffect(() => {
      const scriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!scriptUrl) return;

      let isMounted = true;
      async function fetchApprovedProjects() {
         try {
            const res = await fetch(`${scriptUrl}?sheet=ProductShowcase`);
            const json = await res.json();
            if (isMounted && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
               const liveProjects = json.data.map((item, idx) => ({
                  id: item.id || `live-${idx}`,
                  title: item.title || item.projectTitle || item.projectProductTitle || 'Student Product',
                  desc: item.desc || item.description || item.projectDescription || '',
                  category: item.category || 'Web App',
                  author: item.fullName || item.author || 'Student Developer',
                  level: item.level || item.academicLevel || 'Undergraduate',
                  tech: Array.isArray(item.tech)
                     ? item.tech
                     : (typeof item.tech === 'string' && item.tech ? item.tech.split(',').map((s) => s.trim()) : ['Live App']),
                  demoUrl: item.demoUrl || item.demoURL || item.liveDemoUrl || '',
                  githubUrl: item.githubUrl || item.gitHubUrl || item.gitHubURL || item.gitHubRepository || '',
                  featured: Boolean(item.featured),
               }));

               setShowcaseProjects((prev) => {
                  const liveTitles = new Set(liveProjects.map((p) => p.title.toLowerCase().trim()));
                  const remainingDefaults = prev.filter((p) => !liveTitles.has(p.title.toLowerCase().trim()));
                  return [...liveProjects, ...remainingDefaults];
               });
            }
         } catch (err) {
            console.log('Using static fallback for showcase projects:', err);
         }
      }

      fetchApprovedProjects();
      return () => { isMounted = false; };
   }, []);

   const filteredProjects = selectedCategory === 'All'
      ? showcaseProjects
      : showcaseProjects.filter((p) => p.category === selectedCategory);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitStatus(null);
      setSubmitMessage('');

      const payloadType = submissionType === 'product' ? 'product_showcase' : 'buildlab_submission';
      const scriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

      try {
         if (scriptUrl) {
            await fetch(scriptUrl, {
               method: 'POST',
               mode: 'no-cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  type: payloadType,
                  ...formData,
                  timestamp: new Date().toISOString(),
               }),
            });
         } else {
            await new Promise((resolve) => setTimeout(resolve, 800));
         }

         setSubmitStatus('success');
         setSubmitMessage('Submission received! The Technical Directorate will review and reach out to you shortly.');
         setFormData({
            fullName: '',
            email: '',
            level: '100',
            title: '',
            demoUrl: '',
            githubUrl: '',
            phone: '',
            desc: '',
         });
         setTimeout(() => {
            setSubmitStatus(null);
            setSubmitMessage('');
         }, 8000);
      } catch (err) {
         console.error('Submission error:', err);
         setSubmitStatus('error');
         setSubmitMessage('Unable to send submission. Please check your internet connection and try again.');
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
         {/* BuildLab Hero Section (solid bg-teal-700 with WomanLaptop watermark) */}
         <section className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-teal-700 p-6 sm:p-10 md:p-14 mb-10 text-white">
            {/* Background Watermark WomanLaptop SVG */}
            <div className="absolute -right-8 -bottom-12 sm:-right-12 sm:-bottom-16 md:-right-16 md:-bottom-20 lg:-right-12 lg:-bottom-16 w-72 h-72 sm:w-96 sm:h-96 md:w-120 md:h-120 lg:w-xl lg:h-144 opacity-20 pointer-events-none select-none">
               <WomanLaptop
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
                  BuildLab & <br />
                  <span className="text-white">
                     Student Showcase
                  </span>
               </h1>

               <p className="text-teal-50 text-base sm:text-lg leading-relaxed max-w-xl mx-auto sm:mx-0 font-medium">
                  Discover production-ready software engineered by students, submit your apps for departmental recognition, or incubate raw tech ideas under full Mutual NDA protection.
               </p>

               {/* Call to Action Buttons */}
               <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3.5">
                  <button
                     type="button"
                     onClick={() => {
                        setActiveView('showcase');
                        document.getElementById('buildlab-content')?.scrollIntoView({ behavior: 'smooth' });
                     }}
                     className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-teal-800 font-bold text-sm shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                     <span>Explore Student Showcase</span>
                     <ArrowRight size={18} />
                  </button>

                  <button
                     type="button"
                     onClick={() => {
                        setActiveView('submit');
                        document.getElementById('buildlab-content')?.scrollIntoView({ behavior: 'smooth' });
                     }}
                     className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/20 backdrop-blur-xs transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                     <PlusCircle size={16} className="text-white" />
                     <span>Submit Product or Idea</span>
                  </button>
               </div>
            </div>
         </section>

         {/* View Selector Tabs */}
         <div id="buildlab-content" className="scroll-mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="w-full sm:w-auto p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
               <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 sm:gap-1.5">
                  <button
                     type="button"
                     onClick={() => setActiveView('showcase')}
                     className={`w-full sm:w-auto px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer select-none active:scale-[0.98] ${activeView === 'showcase'
                           ? 'bg-teal-700 text-white shadow-xs'
                           : 'text-slate-600 hover:text-teal-700'
                        }`}
                  >
                     <Rocket size={15} className="shrink-0" />
                     <span className="sm:hidden">Showcase</span>
                     <span className="hidden sm:inline">Student Showcase ({showcaseProjects.length})</span>
                  </button>

                  <button
                     type="button"
                     onClick={() => setActiveView('incubate')}
                     className={`w-full sm:w-auto px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer select-none active:scale-[0.98] ${activeView === 'incubate'
                           ? 'bg-teal-700 text-white shadow-xs'
                           : 'text-slate-600 hover:text-teal-700'
                        }`}
                  >
                     <Lock size={15} className="shrink-0" />
                     <span className="sm:hidden">Incubate</span>
                     <span className="hidden sm:inline">BuildLab Incubation (NDA)</span>
                  </button>

                  <button
                     type="button"
                     onClick={() => setActiveView('submit')}
                     className={`w-full sm:w-auto px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer select-none active:scale-[0.98] ${activeView === 'submit'
                           ? 'bg-teal-700 text-white shadow-xs'
                           : 'text-slate-600 hover:text-teal-700'
                        }`}
                  >
                     <Send size={15} className="shrink-0" />
                     <span className="sm:hidden">Submit</span>
                     <span className="hidden sm:inline">Submit to Showcase / Incubate</span>
                  </button>
               </div>
            </div>

            {/* Category filter when viewing showcase */}
            {activeView === 'showcase' && (
               <div className="w-full sm:w-auto overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-0.5">
                  <div className="flex items-center gap-1.5 min-w-max">
                     {CATEGORIES.map((cat) => (
                        <button
                           key={cat}
                           type="button"
                           onClick={() => setSelectedCategory(cat)}
                           className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none active:scale-[0.97] whitespace-nowrap ${selectedCategory === cat
                                 ? 'bg-teal-700 text-white shadow-xs'
                                 : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-300 hover:text-teal-700'
                              }`}
                        >
                           {cat}
                        </button>
                     ))}
                  </div>
               </div>
            )}
         </div>

         {/* VIEW 1: STUDENT SHOWCASE GRID */}
         {activeView === 'showcase' && (
            <div className="space-y-8 mb-16">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                     <div
                        key={project.id}
                        className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-300 transition-all flex flex-col justify-between shadow-xs hover:shadow-md space-y-4"
                     >
                        <div className="space-y-3">
                           <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200/50 uppercase tracking-wider">
                                 {project.category}
                              </span>
                              {project.featured && (
                                 <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70">
                                    ★ Featured
                                 </span>
                              )}
                           </div>

                           <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                              {project.title}
                           </h3>

                           <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                              {project.desc}
                           </p>

                           {/* Tech Stack Badges */}
                           <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {(Array.isArray(project.tech) ? project.tech : []).map((t) => (
                                 <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                    {t}
                                 </span>
                              ))}
                           </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                           <div>
                              <p className="text-xs font-bold text-slate-800">{project.author}</p>
                              <p className="text-[11px] text-slate-400 font-medium">{project.level}</p>
                           </div>

                           <div className="flex items-center gap-2">
                              {project.githubUrl && (
                                 <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="View Source Code"
                                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                 >
                                    <Github size={18} />
                                 </a>
                              )}
                              {project.demoUrl && (
                                 <a
                                    href={project.demoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200/60 transition-colors"
                                 >
                                    <span>Demo</span>
                                    <ExternalLink size={13} />
                                 </a>
                              )}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Prompt to submit */}
               <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center mx-auto space-y-3">
                  <Rocket className="w-10 h-10 text-teal-700" />
                  <h4 className="text-lg font-bold text-slate-900">Built Something Remarkable?</h4>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-md font-medium">
                     Share your application with the department, inspire fellow students, and get featured on the official showcase.
                  </p>
                  <button
                     type="button"
                     onClick={() => setActiveView('submit')}
                     className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all mt-1 cursor-pointer"
                  >
                     <span>Submit Your Project</span>
                     <ArrowRight size={14} />
                  </button>
               </div>
            </div>
         )}

         {/* VIEW 2: BUILDLAB INCUBATION (UNDER NDA) */}
         {activeView === 'incubate' && (
            <div className="space-y-12 mb-16">
               {/* 3 Pillars */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                     <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                        <Lock size={20} />
                     </div>
                     <h3 className="text-lg font-bold text-slate-900">100% Student IP &amp; Mutual NDA</h3>
                     <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        Your concept remains completely your intellectual property. All consultations and pair-coding happen under binding departmental non-disclosure protection.
                     </p>
                  </div>

                  <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                     <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                        <Code2 size={20} />
                     </div>
                     <h3 className="text-lg font-bold text-slate-900">Hands-on Engineering Support</h3>
                     <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        Work with senior departmental software builders, architecture advisors, and backend developers to transform raw specs into working code.
                     </p>
                  </div>

                  <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                     <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                        <Rocket size={20} />
                     </div>
                     <h3 className="text-lg font-bold text-slate-900">Demo Day &amp; Campus Launch</h3>
                     <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        Launch to hundreds of active student users on campus, collect feedback, and demo to visiting tech founders and alumni at departmental exhibitions.
                     </p>
                  </div>
               </div>

               {/* Incubation Blueprint */}
               <div className="p-8 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-8">
                  <div className="border-b border-slate-100 pb-5">
                     <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
                        Incubation Roadmap
                     </span>
                     <h3 className="text-2xl font-bold text-slate-900 mt-1">
                        How BuildLab Takes Your Concept Forward
                     </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                           01
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">Confidential Idea Pitch</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                           Submit your problem statement and proposed software approach under digital NDA.
                        </p>
                     </div>

                     <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                           02
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">Tech Architecture Review</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                           Technical Directorate reviews feasibility, stacks, database schemas, and API design.
                        </p>
                     </div>

                     <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                           03
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">Pair-Coding Sprints</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                           Execute structured weekend build sprints to code core features and user interfaces.
                        </p>
                     </div>

                     <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                           04
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">Deploy &amp; Feature</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                           Deploy production app to cloud, onboard users, and list proudly on the departmental showcase.
                        </p>
                     </div>
                  </div>

                  <div className="pt-2 text-center">
                     <button
                        type="button"
                        onClick={() => {
                           setSubmissionType('idea');
                           setActiveView('submit');
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
                     >
                        <Lock size={16} />
                        <span>Pitch Your Concept Under NDA</span>
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* VIEW 3: SUBMISSION PORTAL (PRODUCT OR IDEA) */}
         {activeView === 'submit' && (
            <div className="max-w-2xl mx-auto mb-16">
               <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
                  {/* Selector: Finished Product vs Incubate Idea */}
                  <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
                     <button
                        type="button"
                        onClick={() => setSubmissionType('product')}
                        className={`flex-1 min-w-[140px] py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${submissionType === 'product'
                              ? 'bg-white text-teal-800 shadow-xs'
                              : 'text-slate-600 hover:text-teal-800'
                           }`}
                     >
                        Feature Finished Product
                     </button>

                     <button
                        type="button"
                        onClick={() => setSubmissionType('idea')}
                        className={`flex-1 min-w-[140px] py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${submissionType === 'idea'
                              ? 'bg-white text-teal-800 shadow-xs'
                              : 'text-slate-600 hover:text-teal-800'
                           }`}
                     >
                        Incubate Raw Idea (NDA)
                     </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="submitter-name" className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Full Name</label>
                           <input
                              id="submitter-name"
                              name="fullName"
                              type="text"
                              required
                              value={formData.fullName}
                              onChange={handleInputChange}
                              placeholder="e.g. John Doe"
                              aria-label="Your Full Name"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-600"
                           />
                        </div>
                        <div>
                           <label htmlFor="submitter-level" className="block text-xs font-bold text-slate-700 uppercase mb-1">Academic Level</label>
                           <select
                              id="submitter-level"
                              name="level"
                              required
                              value={formData.level}
                              onChange={handleInputChange}
                              aria-label="Academic Level"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-600 bg-white"
                           >
                              <option value="100">100 Level</option>
                              <option value="200">200 Level</option>
                              <option value="300">300 Level</option>
                              <option value="400">400 Level</option>
                           </select>
                        </div>
                     </div>

                     <div>
                        <label htmlFor="project-title" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                           {submissionType === 'product' ? 'Project / Product Title' : 'Idea / Startup Concept Title'}
                        </label>
                        <input
                           id="project-title"
                           name="title"
                           type="text"
                           required
                           value={formData.title}
                           onChange={handleInputChange}
                           aria-label={submissionType === 'product' ? 'Project or Product Title' : 'Idea or Startup Concept Title'}
                           placeholder={submissionType === 'product' ? 'e.g. PeerPay FUOYE' : 'e.g. Campus Automated Lost & Found'}
                           className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-600"
                        />
                     </div>

                     {submissionType === 'product' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div>
                              <label htmlFor="demo-url" className="block text-xs font-bold text-slate-700 uppercase mb-1">Live Demo URL</label>
                              <input
                                 id="demo-url"
                                 name="demoUrl"
                                 type="url"
                                 value={formData.demoUrl}
                                 onChange={handleInputChange}
                                 aria-label="Live Demo URL"
                                 placeholder="https://..."
                                 className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-600"
                              />
                           </div>
                           <div>
                              <label htmlFor="github-url" className="block text-xs font-bold text-slate-700 uppercase mb-1">GitHub Repo URL</label>
                              <input
                                 id="github-url"
                                 name="githubUrl"
                                 type="url"
                                 value={formData.githubUrl}
                                 onChange={handleInputChange}
                                 aria-label="GitHub Repository URL"
                                 placeholder="https://github.com/..."
                                 className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-600"
                              />
                           </div>
                        </div>
                     )}

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="submitter-email" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                              Your Email Address <span className="text-teal-600 font-normal">(for approval notice)</span>
                           </label>
                           <input
                              id="submitter-email"
                              name="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={handleInputChange}
                              aria-label="Your Email Address"
                              placeholder="e.g. yourname@gmail.com"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-600"
                           />
                        </div>
                        <div>
                           <label htmlFor="submitter-phone" className="block text-xs font-bold text-slate-700 uppercase mb-1">WhatsApp / Phone Number</label>
                           <input
                              id="submitter-phone"
                              name="phone"
                              type="tel"
                              required
                              value={formData.phone}
                              onChange={handleInputChange}
                              aria-label="WhatsApp or Phone Number"
                              placeholder="e.g. 08123456789"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-600"
                           />
                        </div>
                     </div>

                     <div>
                        <label htmlFor="project-desc" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                           {submissionType === 'product' ? 'Description & Technologies Used' : 'Problem Solved & What Help You Need'}
                        </label>
                        <textarea
                           id="project-desc"
                           name="desc"
                           rows={4}
                           required
                           value={formData.desc}
                           onChange={handleInputChange}
                           aria-label={submissionType === 'product' ? 'Description & Technologies Used' : 'Problem Solved & What Help You Need'}
                           placeholder={submissionType === 'product' ? 'Tell us what your product does and the tech stack you built it with...' : 'Describe what problem your idea solves and what engineering/mentor support you need...'}
                           className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-600"
                        />
                     </div>

                     {submissionType === 'idea' && (
                        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200/60 flex items-start gap-2.5 text-xs text-teal-900 font-medium">
                           <ShieldCheck size={18} className="text-teal-700 shrink-0 mt-0.5" />
                           <span>Mutual NDA Protected: Your submission is strictly confidential and protected under departmental intellectual property policy.</span>
                        </div>
                     )}

                     {/* Inline Success or Error Alert directly above the Submit button */}
                     {submitStatus === 'success' && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                           <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                           <span>{submitMessage}</span>
                        </div>
                     )}

                     {submitStatus === 'error' && (
                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                           <AlertCircle size={18} className="text-rose-600 shrink-0" />
                           <span>{submitMessage}</span>
                        </div>
                     )}

                     <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-sm shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                     >
                        {isSubmitting ? (
                           <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>Submitting...</span>
                           </>
                        ) : (
                           <span>
                              {submissionType === 'product' ? 'Submit Product to Showcase' : 'Pitch Idea to Technical Directorate'}
                           </span>
                        )}
                     </button>
                  </form>
               </div>
            </div>
         )}
      </main>
   );
}
