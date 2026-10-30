'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getActiveGame, getVisibleGames, isGameActive, isGameComingSoon } from './games';
import { Trophy, ArrowRight, ExternalLink, Sparkles, Lock } from 'lucide-react';
import { GamePad } from '@esvigy/react';
import { getLeaderboard } from './actions';

export default function GamesDirectory() {
   const activeGame = getActiveGame();
   const [topScores, setTopScores] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      let isMounted = true;
      const fetchScores = async () => {
         if (!activeGame) {
            if (isMounted) setLoading(false);
            return;
         }

         const data = await getLeaderboard(activeGame.slug);

         if (!isMounted) return;

         if (data && data.length > 0) {
            const ranked = data.map((item, index) => ({
               rank: index + 1,
               name: item.gaming_name,
               level: item.level,
               score: item.score
            }));
            setTopScores(ranked);
         }
         setLoading(false);
      };

      fetchScores();
      return () => {
         isMounted = false;
      };
   }, [activeGame]);

   const allGames = getVisibleGames();

   return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
         {/* Games Hub Hero Section (only section with the background) */}
         <section className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-indigo-700 p-6 sm:p-10 md:p-14 mb-12 text-white">
            {/* Background Watermark GamePad SVG from @esvigy/react */}
            <div className="absolute -right-8 -bottom-12 sm:-right-12 sm:-bottom-16 md:-right-16 md:-bottom-20 lg:-right-12 lg:-bottom-16 w-72 h-72 sm:w-96 sm:h-96 md:w-120 md:h-120 lg:w-xl lg:h-144 opacity-20 pointer-events-none select-none">
               <GamePad
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
                  Games Hub &amp; <br />
                  <span className="text-white">
                     Arcade Arena
                  </span>
               </h1>

               <p className="text-indigo-100 text-base sm:text-lg leading-relaxed max-w-xl mx-auto sm:mx-0 font-medium">
                  Play weekly mini-games crafted by departmental open-source contributors, test your skills, and compete on the live leaderboard.
               </p>

               {/* Call to Action Buttons */}
               <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3.5">
                  <a
                     href="#featured-game"
                     className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-indigo-700 font-bold text-sm transition-all duration-300 active:scale-95"
                  >
                     <span>Play Game of the Week</span>
                     <ArrowRight size={18} />
                  </a>

                  <a
                     href="#all-games"
                     className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/20 backdrop-blur-xs transition-all duration-300 active:scale-95"
                  >
                     <Trophy size={16} className="text-white" />
                     <span>Browse All Games</span>
                  </a>
               </div>
            </div>
         </section>

         {/* GAME OF THE WEEK SECTION (NO BACKGROUND, 50-50 SPLIT, VERTICALLY CENTERED) */}
         <div id="featured-game" className="scroll-mt-6 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
               {/* Left Column: Game Details */}
               <div className="flex flex-col justify-center space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider w-fit border border-indigo-200/60">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span>Game of the Week</span>
                  </div>

                  <div>
                     <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">
                        {activeGame?.name}
                     </h2>

                     <div className="text-xs sm:text-sm text-slate-500 font-medium mb-4">
                        Built by{' '}
                        <a
                           href={activeGame?.developerLink}
                           target="_blank"
                           rel="noreferrer"
                           className="font-bold text-indigo-700 hover:underline"
                        >
                           {activeGame?.developer}
                        </a>
                     </div>

                     <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium max-w-xl">
                        {activeGame?.description}
                     </p>
                  </div>

                  <div className="pt-2">
                     <Link
                        href={`/games/${activeGame?.slug}`}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-base transition-all active:scale-95"
                     >
                        <Trophy size={20} className="text-yellow-400" />
                        <span>Play Game of the Week</span>
                        <ArrowRight size={18} />
                     </Link>
                  </div>
               </div>

               {/* Right Column: Leaderboard Table (50% width, no shadow, clean border) */}
               <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-center">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                     <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                           <Trophy size={18} />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-slate-900 leading-tight">
                              Leaderboard Top 10
                           </h3>
                           <p className="text-xs text-slate-500 font-medium">
                              {activeGame?.name} Live Scores
                           </p>
                        </div>
                     </div>
                     <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        Live Rankings
                     </span>
                  </div>

                  <div className="overflow-y-auto pr-1" style={{ maxHeight: '340px' }}>
                     {loading ? (
                        <div className="text-center text-slate-400 py-10 text-sm font-medium">Loading scores...</div>
                     ) : topScores.length === 0 ? (
                        <div className="text-center text-slate-400 py-10 text-sm font-medium">
                           No scores recorded yet this week. Be the first to play and set a record!
                        </div>
                     ) : (
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                           <thead>
                              <tr className="text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-100">
                                 <th className="pb-3 pl-2">Rank</th>
                                 <th className="pb-3 px-2">Player</th>
                                 <th className="pb-3 pr-2 text-right">Score</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {topScores.map((s) => (
                                 <tr key={s.id || `${s.name}-${s.score}-${s.rank || ''}`} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="py-3 pl-2 font-bold w-16">
                                       {s.rank === 1 && <span className="text-amber-500 font-extrabold flex items-center gap-1">🥇 1st</span>}
                                       {s.rank === 2 && <span className="text-slate-400 font-bold flex items-center gap-1">🥈 2nd</span>}
                                       {s.rank === 3 && <span className="text-amber-700 font-bold flex items-center gap-1">🥉 3rd</span>}
                                       {s.rank > 3 && <span className="text-slate-400 font-semibold pl-1">#{s.rank}</span>}
                                    </td>
                                    <td className="py-3 px-2">
                                       <div className="font-bold text-slate-800 text-sm">{s.name}</div>
                                       <div className="text-[11px] text-slate-400 font-medium">{s.level}</div>
                                    </td>
                                    <td className="py-3 pr-2 font-mono font-bold text-indigo-700 text-right text-sm sm:text-base">
                                       {s.score}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* ALL GAMES SECTION */}
         <div id="all-games" className="mb-6 border-b border-slate-200 pb-3 mt-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">All Games</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Play any past or present game and climb their individual leaderboards.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {allGames.map((game) => {
               const isActive = isGameActive(game);
               const isComing = isGameComingSoon(game);

               return (
                  <div
                     key={game.slug}
                     className={`rounded-3xl border-2 ${isComing
                        ? 'bg-gradient-to-b from-white to-amber-50/25 border-dashed border-amber-300'
                        : isActive
                           ? 'bg-white border-indigo-600'
                           : 'bg-white border-slate-200 hover:border-indigo-300'
                        } p-6 transition-all flex flex-col relative`}
                  >
                     {isActive && (
                        <div className="absolute -top-3 -right-3 bg-indigo-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                           Active Weekly
                        </div>
                     )}
                     {isComing && (
                        <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                           <Sparkles size={12} />
                           <span>Coming Soon</span>
                        </div>
                     )}
                     <h3 className="text-2xl font-extrabold mb-1 text-slate-900">{game.name}</h3>
                     <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 inline-block w-fit">
                           By <a href={game.developerLink} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline font-bold">{game.developer}</a>
                        </div>
                        {game.releaseDate && (
                           <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${isComing
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-400 border-slate-100'
                              }`}>
                              {isComing ? `Releases ${game.releaseDate}` : game.releaseDate}
                           </span>
                        )}
                     </div>
                     <p className="text-slate-600 mb-6 grow text-sm leading-relaxed font-medium">{game.description}</p>

                     {isComing ? (
                        <button
                           type="button"
                           disabled
                           aria-disabled="true"
                           className="w-full text-center font-bold py-3 px-4 rounded-xl bg-amber-50 text-amber-700/80 border border-amber-200/70 mt-auto flex items-center justify-center gap-2 text-sm cursor-not-allowed select-none pointer-events-none"
                        >
                           <Lock size={15} className="text-amber-600/80" />
                           <span>Coming Soon &bull; {game.releaseDate}</span>
                        </button>
                     ) : (
                        <Link
                           href={`/games/${game.slug}`}
                           className={`w-full text-center font-bold py-3 rounded-xl transition-colors mt-auto cursor-pointer ${isActive
                              ? 'bg-indigo-700 hover:bg-indigo-800 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                        >
                           Play Now
                        </Link>
                     )}
                  </div>
               );
            })}
         </div>

         {/* Game Contribution Notice */}
         <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 text-center flex flex-col items-center mx-auto">
            <GamePad animated={true} color="#4338ca" secondaryColor="rgba(67,56,202,0.12)" className="w-20 h-20 mb-3" />
            <h4 className="text-xl font-bold text-slate-900 mb-2">Have a Mini-Game to Build or Submit?</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-md font-medium">
               Are you a student developer or game creator? Build a React single-player mini-game, plug into our GameWrapper leaderboard system, and have your game featured in the departmental weekly tournament.
            </p>
            <a
               href="https://github.com/nickfrostech/nacossfuoye/blob/main/CONTRIBUTING.md#adding-a-game-to-the-games-hub"
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-700 hover:border-indigo-300 text-sm font-bold shadow-xs hover:shadow-sm transition-all active:scale-95"
            >
               <span>View Game Contribution Guide</span>
               <ExternalLink size={15} />
            </a>
         </div>
      </main>
   );
}
