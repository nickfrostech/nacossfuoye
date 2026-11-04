'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { getGameBySlug, isGameActive, isGameReleased } from './games';
import { ArrowLeft, Trophy, Code, Settings, Star, Flame } from 'lucide-react';
import { GamePad } from '@esvigy/react';

import { submitScore, getLeaderboard, createGameSession } from './actions';

export default function GameWrapper({ slug, GameComponent }) {
   const router = useRouter();
   const game = getGameBySlug(slug);

   const [player, setPlayer] = useState(null);
   const [showStartModal, setShowStartModal] = useState(true);
   const [showSwitchModal, setShowSwitchModal] = useState(false);
   const [gameOverScore, setGameOverScore] = useState(null);
   const [gameOverStats, setGameOverStats] = useState(null);
   const [gameSessionKey, setGameSessionKey] = useState(0);
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

   const isDev = process.env.NODE_ENV !== 'production';
   const isVercelPreview =
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
      (typeof window !== 'undefined' && (
         window.location.hostname.includes('-git-') ||
         (window.location.hostname.endsWith('.vercel.app') && !window.location.hostname.startsWith('nacossfuoye.vercel.app'))
      ));
   const isPreviewOrDev = isDev || isVercelPreview;

   if (!game || game.hidden || (!isGameReleased(game) && !isPreviewOrDev)) {
      notFound();
   }



   const handleStart = (e) => {
      e.preventDefault();
      if (!formData.name) return;

      localStorage.setItem('nacoss_player_v1', JSON.stringify(formData));
      setPlayer(formData);
      setShowStartModal(false);
      setShowSwitchModal(false);
   };

   const handleGameOver = (finalScore, stats = null) => {
      setGameOverScore(finalScore);
      setGameOverStats(stats);

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
      <div className="max-w-4xl mx-auto p-1.5 sm:p-4 md:p-6 relative">
         <button onClick={() => router.push('/games')} className="inline-flex items-center text-slate-500 hover:text-indigo-700 font-medium mb-1.5 sm:mb-4 transition-colors text-xs sm:text-sm">
            <ArrowLeft size={15} className="mr-1" /> Back to Games Hub
         </button>

         <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-xs mb-2 sm:mb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-4 mb-1.5 sm:mb-3">
               <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 flex items-center flex-wrap gap-1.5 sm:gap-3">
                  {game.name}
                  {isGameActive(game)
                     ? <span className="bg-indigo-100 text-indigo-700 text-[10px] sm:text-sm px-2 py-0.5 sm:py-1 rounded-full font-bold uppercase tracking-wider">Weekly Live</span>
                     : <span className="bg-slate-100 text-slate-500 text-[10px] sm:text-sm px-2 py-0.5 sm:py-1 rounded-full font-bold uppercase tracking-wider">Archived</span>
                  }
               </h1>

               <a href={game.developerLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-[11px] sm:text-sm font-semibold bg-slate-100 text-slate-600 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg hover:bg-slate-200 transition-colors w-fit">
                  <Code size={13} className="mr-1" /> Built by {game.developer}
               </a>
            </div>

            <p className="text-slate-600 text-xs sm:text-base mb-2 sm:mb-4 leading-relaxed font-medium">{game.description}</p>

            <div className="bg-slate-50 border border-slate-100 p-2 sm:p-4 rounded-xl text-[11px] sm:text-sm text-slate-700 leading-relaxed shadow-inner">
               <strong className="text-slate-900 block mb-0.5">How to play:</strong>
               {game.howToPlay}
            </div>
         </div>

         {showStartModal ? (
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl max-w-md mx-auto text-center">
               <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-2 flex items-center justify-center">
                  <GamePad animated={true} color="#9333ea" secondaryColor="rgba(147,51,234,0.12)" className="w-16 h-16 sm:w-24 sm:h-24 filter drop-shadow-md" />
               </div>
               <h2 className="text-xl sm:text-2xl font-bold mb-1 text-slate-800">Join the Leaderboard</h2>
               <p className="text-slate-500 mb-3 sm:mb-6 text-xs sm:text-sm">Enter your gaming profile to save your high scores.</p>
               {renderPlayerForm()}
            </div>
         ) : (
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-2 sm:p-6 shadow-xl relative overflow-hidden">

               {/* Player Header */}
               <div className="flex flex-wrap justify-between items-center mb-1.5 sm:mb-4 border-b border-slate-100 pb-1.5 sm:pb-3 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                     <div className="w-7 h-7 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs sm:text-sm">
                        {player?.name?.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <div className="font-extrabold text-slate-800 text-xs sm:text-sm">{player?.name}</div>
                        <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">{player?.level}</div>
                     </div>
                  </div>
                  <button
                     onClick={() => {
                        setFormData({ name: player?.name || '', level: player?.level || '100L' });
                        setShowSwitchModal(true);
                     }}
                     className="inline-flex items-center text-xs sm:text-sm text-slate-500 hover:text-indigo-700 font-semibold transition-colors bg-slate-50 hover:bg-indigo-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg"
                  >
                     <Settings size={13} className="mr-1" /> Switch Player
                  </button>
               </div>

               {/* Game Rendering area with DOM Event Capture */}
               <div
                  onPointerDownCapture={handleInteraction}
                  onKeyDownCapture={handleInteraction}
                  className="flex justify-center items-center min-h-0 sm:min-h-96 w-full"
               >
                  {GameComponent ? (
                     <GameComponent key={gameSessionKey} onGameOver={handleGameOver} player={player} />
                  ) : (
                     <div className="p-10 text-slate-400 font-medium">Game logic not found.</div>
                  )}
               </div>

               {/* Game Over Overlay Modal: Solid clean card isolating the result view */}
               {gameOverScore !== null && (
                  <div className="absolute inset-0 bg-white rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center z-20 animate-in fade-in duration-200 p-4">
                     <div className="bg-white border border-slate-200 shadow-xl p-5 sm:p-7 rounded-2xl max-w-sm w-full text-center">
                        <Trophy size={42} className="mx-auto text-amber-400 mb-2" />
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1">Game Over!</h2>
                        <div className="text-slate-500 font-medium mb-3">
                           Your Score: <span className="text-3xl sm:text-4xl block text-indigo-700 font-black mt-0.5">{gameOverScore}</span>
                        </div>

                        {/* Rich stats breakdown (Sentences, Accuracy, Streak) */}
                        {gameOverStats && (
                           <div className="grid grid-cols-3 gap-1.5 text-center text-xs mb-3.5">
                              {gameOverStats.sentences !== undefined && (
                                 <div className="bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-100 font-bold">
                                    <span className="block text-slate-800 text-sm font-black">{gameOverStats.sentences}</span>
                                    <span className="text-slate-400 text-[10px]">Sentences</span>
                                 </div>
                              )}
                              {gameOverStats.accuracy !== undefined && (
                                 <div className="bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-100 font-bold">
                                    <span className="block text-slate-800 text-sm font-black">{gameOverStats.accuracy}%</span>
                                    <span className="text-slate-400 text-[10px]">Accuracy</span>
                                 </div>
                              )}
                              {gameOverStats.maxStreak !== undefined && (
                                 <div className="bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-100 font-bold">
                                    <span className="block text-amber-600 text-sm font-black flex items-center justify-center gap-0.5">
                                       {gameOverStats.maxStreak} <Flame size={12} className="fill-amber-500" />
                                    </span>
                                    <span className="text-slate-400 text-[10px]">Streak</span>
                                 </div>
                              )}
                           </div>
                        )}

                        {isSubmitting ? (
                           <div className="text-xs text-slate-500 animate-pulse mb-3">Saving to leaderboard...</div>
                        ) : null}

                        <button
                           onClick={() => {
                              setGameOverScore(null);
                              setGameOverStats(null);
                              setGameSessionKey(k => k + 1);
                              humanInputsRef.current = { count: 0, startTime: 0, lastTime: 0 };
                              refreshSession();
                           }}
                           className="w-full bg-indigo-700 text-white font-bold py-3 rounded-xl hover:bg-indigo-800 active:scale-95 transition cursor-pointer text-sm shadow-md shadow-indigo-600/20"
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
