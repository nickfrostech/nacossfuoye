'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { getGameBySlug, isGameReleased, isGameActive, isGameComingSoon } from './games';
import { ArrowLeft, Trophy, Code, Settings, Star, Lock, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { GamePad } from '@esvigy/react';

import { submitScore, getLeaderboard, createGameSession } from './actions';

export default function GameWrapper({ slug, GameComponent }) {
   const router = useRouter();
   const game = getGameBySlug(slug);

   const [player, setPlayer] = useState(null);
   const [showStartModal, setShowStartModal] = useState(true);
   const [showSwitchModal, setShowSwitchModal] = useState(false);
   const [gameOverScore, setGameOverScore] = useState(null);
   const [formData, setFormData] = useState({ name: '', level: '100L' });
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [leaderboard, setLeaderboard] = useState([]);
   const [loadingBoard, setLoadingBoard] = useState(true);

   // Anti-Cheat: Tracks verified physical human hardware interactions
   const humanInputsRef = useRef({ count: 0, startTime: 0, lastTime: 0 });
   // Anti-Cheat: Cryptographic server-signed session token (no public salt)
   const sessionTokenRef = useRef(null);

   const handleInteraction = useCallback((e) => {
      // Browser strictly guarantees isTrusted = true only for real hardware inputs (mouse, touch, keyboard)
      if (e?.isTrusted) {
         if (humanInputsRef.current.count === 0) {
            humanInputsRef.current.startTime = Date.now();
         }
         humanInputsRef.current.count += 1;
         humanInputsRef.current.lastTime = Date.now();
      }
   }, []);

   const refreshSession = useCallback(async () => {
      if (!game?.slug) return;
      try {
         const res = await createGameSession(game.slug);
         if (res?.success && res.sessionToken) {
            sessionTokenRef.current = res.sessionToken;
         }
      } catch (err) {
         console.error('Failed to init secure game session:', err);
      }
   }, [game?.slug]);

   useEffect(() => {
      refreshSession();
   }, [refreshSession]);

   const fetchBoard = useCallback(async () => {
      if (!game?.slug) return;
      const data = await getLeaderboard(game.slug);
      if (data && data.length > 0) {
         const ranked = data.map((item, index) => ({
            rank: index + 1,
            name: item.gaming_name,
            level: item.level,
            score: item.score
         }));
         setLeaderboard(ranked);
      }
      setLoadingBoard(false);
   }, [game?.slug]);

   useEffect(() => {
      fetchBoard();
   }, [fetchBoard]);

   useEffect(() => {
      const savedPlayer = localStorage.getItem('nacoss_player_v1') || localStorage.getItem('nacoss_player');
      if (savedPlayer) {
         try {
            setPlayer(JSON.parse(savedPlayer));
            setShowStartModal(false);
         } catch {
            // ignore JSON parse error
         }
      }
   }, []);

   if (!game || game.hidden) {
      notFound();
   }

   const isDev = process.env.NODE_ENV !== 'production';
   const isDevBypass = isDev && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === 'true';

   if ((isGameComingSoon(game) || !isGameReleased(game)) && !isDevBypass) {
      return (
         <main className="max-w-2xl mx-auto p-4 md:p-8">
            <button
               onClick={() => router.push('/games')}
               className="inline-flex items-center text-slate-500 hover:text-indigo-700 font-medium mb-6 transition-colors"
            >
               <ArrowLeft size={18} className="mr-2" /> Back to Games Hub
            </button>

            <div className="bg-white border-2 border-dashed border-amber-300 rounded-3xl p-6 sm:p-10 text-center shadow-xs">
               <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                  <Lock size={28} />
               </div>

               <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-200">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>Coming Soon to Arcade Arena</span>
               </div>

               <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  {game.name}
               </h1>

               <div className="text-xs sm:text-sm text-slate-500 font-medium mb-6">
                  Crafted by{' '}
                  <a
                     href={game.developerLink}
                     target="_blank"
                     rel="noreferrer"
                     className="text-indigo-700 hover:underline font-bold"
                  >
                     {game.developer}
                  </a>
               </div>

               <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6 text-left space-y-3">
                  <div>
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Game Concept
                     </span>
                     <p className="text-slate-600 text-sm leading-relaxed">
                        {game.description}
                     </p>
                  </div>
                  {game.howToPlay && (
                     <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                           How to Play (Preview)
                        </span>
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                           {game.howToPlay}
                        </p>
                     </div>
                  )}
               </div>

               <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 mb-6">
                  <div className="text-xs sm:text-sm font-bold text-amber-900 flex items-center justify-center gap-2">
                     <Clock size={16} className="text-amber-600" />
                     <span>Official Release Date: <strong className="text-amber-700">{game.releaseDate}</strong></span>
                  </div>
                  <p className="text-xs text-amber-700/80 mt-1">
                     This game is currently locked. It will automatically unlock on its release date for live tournament play.
                  </p>
               </div>

               <button
                  onClick={() => router.push('/games')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer"
               >
                  <span>Play This Week's Active Game</span>
                  <ArrowRight size={16} />
               </button>
            </div>
         </main>
      );
   }

   const handleStart = (e) => {
      e.preventDefault();
      if (!formData.name) return;

      localStorage.setItem('nacoss_player_v1', JSON.stringify(formData));
      setPlayer(formData);
      setShowStartModal(false);
      setShowSwitchModal(false);
   };

   const handleGameOver = (finalScore) => {
      setGameOverScore(finalScore);

      const { count, startTime } = humanInputsRef.current;
      const elapsedSeconds = startTime > 0 ? (Date.now() - startTime) / 1000 : 0;

      // 🛑 Anti-Cheat Check: Reject if no physical human hardware interactions were detected
      if (count === 0 || elapsedSeconds < 0.2) {
         console.warn("Anti-cheat notice: Submission lacked verified physical human interactions.");
         humanInputsRef.current = { count: 0, startTime: 0, lastTime: 0 };
         return;
      }

      // Reset human interaction tracker for next game round
      humanInputsRef.current = { count: 0, startTime: 0, lastTime: 0 };

      if (!player) return;

      const tokenToSubmit = sessionTokenRef.current;
      sessionTokenRef.current = null; // Single-use: clear immediately to prevent replay
      refreshSession(); // Fetch fresh session token for next play

      if (!tokenToSubmit) {
         console.warn("Anti-cheat notice: Missing server security session token.");
         return;
      }

      setIsSubmitting(true);

      // Fire and forget: save happens in parallel in the background
      submitScore({
         game_slug: game.slug,
         gaming_name: player.name,
         level: player.level,
         score: finalScore
      }, tokenToSubmit)
         .then(() => fetchBoard()) // Refresh the game's leaderboard
         .catch(err => console.error("Failed to submit score:", err))
         .finally(() => setIsSubmitting(false));
   };

   // Renders the player form used in both start modal and switch modal
   const renderPlayerForm = () => (
      <form onSubmit={handleStart} className="flex flex-col gap-4 text-left w-full max-w-sm mx-auto">
         <div>
            <label htmlFor="gaming_name_input" className="block text-sm font-bold text-slate-700 mb-1">Unique Gaming Name</label>
            <input
               id="gaming_name_input"
               type="text"
               placeholder="e.g. ShadowHunter"
               className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
               value={formData.name}
               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
               required
            />
         </div>
         <div>
            <label htmlFor="player_level_select" className="block text-sm font-bold text-slate-700 mb-1">Level</label>
            <select
               id="player_level_select"
               aria-label="Level"
               className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
               value={formData.level}
               onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            >
               <option value="100L">100 Level</option>
               <option value="200L">200 Level</option>
               <option value="300L">300 Level</option>
               <option value="400L">400 Level</option>
               <option value="Alumni">Alumni</option>
            </select>
         </div>
         <div className="flex gap-3 mt-2">
            {showSwitchModal && (
               <button
                  type="button"
                  onClick={() => setShowSwitchModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-200 transition-all"
               >
                  Cancel
               </button>
            )}
            <button type="submit" className="flex-1 bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-800 transition-all active:scale-95">
               {showSwitchModal ? 'Update Player' : 'Start Playing'}
            </button>
         </div>
      </form>
   );

   return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 relative">
         <button onClick={() => router.push('/games')} className="inline-flex items-center text-slate-500 hover:text-indigo-700 font-medium mb-6 transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Back to Games Hub
         </button>

         {isDevBypass && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 font-bold">
               <span>🛠️ Local Dev Testing Mode &bull; Unreleased Game ({game.releaseDate})</span>
               <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase">?dev=true</span>
            </div>
         )}

         <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
               <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 flex items-center flex-wrap gap-3">
                  {game.name}
                  {isGameActive(game)
                     ? <span className="bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full font-bold uppercase tracking-wider">Weekly Live</span>
                     : <span className="bg-slate-100 text-slate-500 text-sm px-3 py-1 rounded-full font-bold uppercase tracking-wider">Archived</span>
                  }
               </h1>

               <a href={game.developerLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors w-fit">
                  <Code size={16} className="mr-2" /> Built by {game.developer}
               </a>
            </div>

            <p className="text-slate-600 text-lg mb-6">{game.description}</p>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm text-slate-700 leading-relaxed shadow-inner">
               <strong className="text-slate-900 block mb-1">How to play:</strong>
               {game.howToPlay}
            </div>
         </div>

         {showStartModal ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl max-w-md mx-auto text-center">
               <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
                  <GamePad animated={true} color="#9333ea" secondaryColor="rgba(147,51,234,0.12)" className="w-24 h-24 filter drop-shadow-md" />
               </div>
               <h2 className="text-2xl font-bold mb-2 text-slate-800">Join the Leaderboard</h2>
               <p className="text-slate-500 mb-6 text-sm">Enter your gaming profile to save your high scores.</p>
               {renderPlayerForm()}
            </div>
         ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl relative">

               {/* Player Header */}
               <div className="flex flex-wrap justify-between items-center mb-8 border-b border-slate-100 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                        {player?.name?.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <div className="font-extrabold text-slate-800">{player?.name}</div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{player?.level}</div>
                     </div>
                  </div>
                  <button
                     onClick={() => {
                        setFormData({ name: player?.name || '', level: player?.level || '100L' });
                        setShowSwitchModal(true);
                     }}
                     className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-700 font-semibold transition-colors bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg"
                  >
                     <Settings size={16} className="mr-2" /> Switch Player
                  </button>
               </div>

               {/* Game Rendering area with DOM Event Capture */}
               <div
                  onPointerDownCapture={handleInteraction}
                  onKeyDownCapture={handleInteraction}
                  className="flex justify-center items-center min-h-100"
               >
                  {GameComponent ? (
                     <GameComponent onGameOver={handleGameOver} player={player} />
                  ) : (
                     <div className="p-10 text-slate-400 font-medium">Game logic not found.</div>
                  )}
               </div>

               {/* Game Over Overlay Modal */}
               {gameOverScore !== null && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-20 animate-in fade-in duration-300">
                     <div className="bg-white border border-slate-200 shadow-2xl p-8 rounded-2xl max-w-sm w-full text-center">
                        <Trophy size={48} className="mx-auto text-yellow-400 mb-4" />
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Game Over!</h2>
                        <div className="text-slate-500 font-medium mb-6">
                           Your Score: <span className="text-4xl block text-indigo-700 font-black mt-2">{gameOverScore}</span>
                        </div>

                        {isSubmitting ? (
                           <div className="text-sm text-slate-500 animate-pulse mb-6">Saving to leaderboard...</div>
                        ) : null}

                        <button
                           onClick={() => {
                              setGameOverScore(null);
                              humanInputsRef.current = { count: 0, startTime: 0, lastTime: 0 };
                              refreshSession();
                           }}
                           className="w-full bg-indigo-700 text-white font-bold py-3 rounded-xl hover:bg-indigo-800 transition"
                        >
                           Play Again
                        </button>
                     </div>
                  </div>
               )}

               {/* Switch Player Overlay Modal */}
               {showSwitchModal && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center z-30 animate-in fade-in duration-200">
                     <h2 className="text-2xl font-bold mb-6 text-slate-800">Switch Player Details</h2>
                     {renderPlayerForm()}
                  </div>
               )}

            </div>
         )}

         {/* Game Leaderboard */}
         {!showStartModal && (
            <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
               <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center border-b pb-3">
                  <Trophy className="text-yellow-500 mr-2" size={20} /> {game.name} Leaderboard
               </h3>

               {loadingBoard ? (
                  <div className="text-center text-slate-400 py-6">Loading scores...</div>
               ) : leaderboard.length === 0 ? (
                  <div className="text-center text-slate-400 py-6">No scores yet. Be the first to set a record!</div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="text-xs text-slate-400 uppercase tracking-wider border-b">
                              <th className="pb-2 font-semibold w-16">Rank</th>
                              <th className="pb-2 font-semibold">Player</th>
                              <th className="pb-2 font-semibold">Level</th>
                              <th className="pb-2 font-semibold text-right">Score</th>
                           </tr>
                        </thead>
                        <tbody>
                           {leaderboard.map((s) => (
                              <tr key={s.id || `${s.name}-${s.score}-${s.rank || ''}`} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                                 <td className="py-3 text-sm font-bold">
                                    {s.rank === 1 && <Star className="inline text-yellow-500 fill-yellow-500" size={16} />}
                                    {s.rank === 2 && <Star className="inline text-gray-400 fill-gray-400" size={16} />}
                                    {s.rank === 3 && <Star className="inline text-amber-600 fill-amber-600" size={16} />}
                                    {s.rank > 3 && <span className="text-slate-400 pl-1">#{s.rank}</span>}
                                 </td>
                                 <td className="py-3 font-bold text-slate-700 text-sm">
                                    {s.name}
                                 </td>
                                 <td className="py-3 text-xs text-slate-400">
                                    {s.level}
                                 </td>
                                 <td className="py-3 font-mono font-bold text-slate-800 text-right text-sm">
                                    {s.score}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
