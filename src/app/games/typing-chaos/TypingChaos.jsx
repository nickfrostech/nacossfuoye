'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Volume2, VolumeX, Sparkles, Timer, Flame, RotateCcw, Trophy, Zap, Keyboard, AlertTriangle } from 'lucide-react';

// Pool of fast-paced tech, computer science, and NACOSS FUOYE sentences
const SENTENCES = [
   'HELLO WORLD',
   'CODE NEVER SLEEPS',
   'GIT PUSH ORIGIN MAIN',
   'DEBUGGING IS DETECTIVE WORK',
   'NACOSS FUOYE TO THE WORLD',
   'REACT STATE IS IMMUTABLE',
   'ALWAYS WRITE CLEAN CODE',
   'FOUR OH FOUR NOT FOUND',
   'TERMINAL OVER GRAPHICAL GUI',
   'TURING COMPLETE AUTOMATON',
   'ALGORITHMS SHAPE OUR WORLD',
   'TYPESCRIPT SAVES TIME',
   'CSS GRID AND FLEXBOX',
   'STACK OVERFLOW TO THE RESCUE',
   'BINARY DIGITS ZERO AND ONE',
   'PULL REQUEST APPROVED',
   'CACHE INVALIDATION IS TRICKY',
   'INFINITE LOOP DETECTED',
   'DATABASE INDEXES ACCELERATE',
   'KNOW THY TIME COMPLEXITY',
   'SEMICOLONS ARE OPTIONAL',
   'MERGE CONFLICT INCOMING',
   'RECURSION NEEDS A BASE CASE',
   'KEEP CALM AND CODE ON',
   'FUTURE TECH LEADERS OF FUOYE',
   'SOFTWARE CRAFTSMANSHIP',
   'BYTE ME IF YOU CAN',
   'ZERO WARNINGS ZERO ERRORS',
   'NODE EVENT LOOP MAGIC',
   'IN SILICON WE TRUST',
   'GARBAGE COLLECTION SWEEP',
   'COMPILERS TRANSFORM LOGIC',
   'OBJECT ORIENTED PARADIGM',
   'ASYNC AWAIT PROMISES',
   'DOCKER CONTAINERS EVERYWHERE',
   'CYBER SECURITY MATTERS',
   'NEVER STOP CODING',
   'PYTHON INDENTATION RULES',
   'ARTIFICIAL INTELLIGENCE ERA',
   'COMPUTER SCIENCE EXCELLENCE',
   'MODERN FULL STACK WEB',
   'LOGIC GATES AND BOOLEANS'
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const INITIAL_TIME_SECONDS = 60;
const BONUS_SECONDS_PER_SENTENCE = 3;
const MAX_TIME_CAP = 65;

// Fisher-Yates array shuffle helper
function shuffleArray(arr) {
   const copy = [...arr];
   for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
   }
   return copy;
}

// Generate curated tile bubble grid for a sentence:
// Extracts unique letters required + adds 4-6 random distractor letters
function generateRound(previousSentence = '') {
   let nextSentence = previousSentence;
   const available = SENTENCES.filter((s) => s !== previousSentence);
   nextSentence = available[Math.floor(Math.random() * available.length)];

   // Unique uppercase letters in the sentence
   const neededLetters = Array.from(new Set(nextSentence.replace(/[^A-Z]/g, '')));
   const neededSet = new Set(neededLetters);

   // Unused letters from alphabet to pick distractors from
   const distractorPool = ALPHABET.split('').filter((ch) => !neededSet.has(ch));
   const shuffledDistractors = shuffleArray(distractorPool);

   // Choose distractors: target total between 13 and 16 tiles for optimal bubble grid
   let distractorCount = Math.max(4, Math.min(6, 15 - neededLetters.length));
   if (neededLetters.length <= 8) distractorCount = 6;
   const distractors = shuffledDistractors.slice(0, distractorCount);

   // Scramble tiles once for the entire sentence
   const tiles = shuffleArray([...neededLetters, ...distractors]);

   return {
      sentence: nextSentence,
      tiles,
      charIndex: 0
   };
}

export default function TypingChaos({ onGameOver }) {
   // Game State
   const [status, setStatus] = useState('idle'); // 'idle' | 'playing' | 'over'
   const [currentRound, setCurrentRound] = useState(() => generateRound());
   const [score, setScore] = useState(0);
   const [streak, setStreak] = useState(0);
   const [maxStreak, setMaxStreak] = useState(0);
   const [sentencesDone, setSentencesDone] = useState(0);
   const [totalKeystrokes, setTotalKeystrokes] = useState(0);
   const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
   const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_SECONDS);
   const [soundEnabled, setSoundEnabled] = useState(true);
   const [lastRunStats, setLastRunStats] = useState(null);

   // Visual Feedback States
   const [activeFeedback, setActiveFeedback] = useState(null); // { key: string, type: 'correct' | 'wrong' }
   const [bonusNotification, setBonusNotification] = useState(null); // '+3s & +100 PTS'
   const [scoreGlow, setScoreGlow] = useState(false);

   // Refs
   const deadlineRef = useRef(0);
   const timerIntervalRef = useRef(null);
   const reportedScoreRef = useRef(false);
   const audioCtxRef = useRef(null);

   // Sound Synthesizer via Web Audio API (Zero dependencies)
   const playAudioBeep = useCallback((type) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
         const AudioCtx = window.AudioContext || window.webkitAudioContext;
         if (!AudioCtx) return;
         if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioCtx();
         }
         const ctx = audioCtxRef.current;
         if (ctx.state === 'suspended') {
            ctx.resume();
         }

         const now = ctx.currentTime;
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();
         osc.connect(gain);
         gain.connect(ctx.destination);

         if (type === 'correct') {
            // Crisp, pleasant high beep
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
         } else if (type === 'wrong') {
            // Low error buzz
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
         } else if (type === 'sentence') {
            // Ascending celebratory chime
            [523.25, 659.25, 783.99].forEach((freq, idx) => {
               const o = ctx.createOscillator();
               const g = ctx.createGain();
               o.connect(g);
               g.connect(ctx.destination);
               o.type = 'triangle';
               o.frequency.setValueAtTime(freq, now + idx * 0.07);
               g.gain.setValueAtTime(0.14, now + idx * 0.07);
               g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18);
               o.start(now + idx * 0.07);
               o.stop(now + idx * 0.07 + 0.18);
            });
         } else if (type === 'gameover') {
            // Descending chime
            [600, 450, 300].forEach((freq, idx) => {
               const o = ctx.createOscillator();
               const g = ctx.createGain();
               o.connect(g);
               g.connect(ctx.destination);
               o.type = 'sine';
               o.frequency.setValueAtTime(freq, now + idx * 0.1);
               g.gain.setValueAtTime(0.15, now + idx * 0.1);
               g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.18);
               o.start(now + idx * 0.1);
               o.stop(now + idx * 0.1 + 0.18);
            });
         }
      } catch {
         // Silently ignore audio context restrictions
      }
   }, [soundEnabled]);

   // Start Game
   const handleStart = () => {
      reportedScoreRef.current = false;
      const initialRound = generateRound();
      setCurrentRound(initialRound);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setSentencesDone(0);
      setTotalKeystrokes(0);
      setCorrectKeystrokes(0);
      setActiveFeedback(null);
      setBonusNotification(null);

      const durationMs = INITIAL_TIME_SECONDS * 1000;
      deadlineRef.current = Date.now() + durationMs;
      setTimeLeft(INITIAL_TIME_SECONDS);
      setStatus('playing');

      // Initialize audio on gesture
      playAudioBeep('correct');
   };

   // Clock countdown effect
   useEffect(() => {
      if (status !== 'playing') {
         if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
         return undefined;
      }

      timerIntervalRef.current = setInterval(() => {
         const remainingMs = deadlineRef.current - Date.now();
         const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
         setTimeLeft(remainingSec);

         if (remainingSec <= 0) {
            clearInterval(timerIntervalRef.current);
            setStatus('over');
            playAudioBeep('gameover');
         }
      }, 100);

      return () => {
         if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };
   }, [status, playAudioBeep]);

   // Submit score to GameWrapper once when game ends
   useEffect(() => {
      if (status === 'over') {
         const acc = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
         setLastRunStats({
            score,
            sentences: sentencesDone,
            accuracy: acc,
            maxStreak
         });
         if (!reportedScoreRef.current) {
            reportedScoreRef.current = true;
            onGameOver?.(score, {
               sentences: sentencesDone,
               accuracy: acc,
               maxStreak
            });
         }
      }
   }, [status, score, sentencesDone, totalKeystrokes, correctKeystrokes, maxStreak, onGameOver]);

   // Multiplier based on current streak
   const streakMultiplier = useMemo(() => {
      if (streak >= 15) return 2.0;
      if (streak >= 10) return 1.6;
      if (streak >= 5) return 1.3;
      return 1.0;
   }, [streak]);

   // Handle key input (from on-screen bubble tiles or dedicated space bar)
   const handleKey = useCallback((pressedKey) => {
      if (status !== 'playing') return;

      const { sentence, charIndex } = currentRound;
      const expectedChar = sentence[charIndex];

      setTotalKeystrokes((prev) => prev + 1);

      if (pressedKey === expectedChar) {
         // --- CORRECT KEY ---
         playAudioBeep('correct');
         setActiveFeedback({ key: pressedKey, type: 'correct' });

         setCorrectKeystrokes((prev) => prev + 1);
         setStreak((prev) => {
            const next = prev + 1;
            setMaxStreak((currMax) => Math.max(currMax, next));
            return next;
         });

         // Add points with multiplier
         const pointsEarned = Math.round(10 * streakMultiplier);
         setScore((prev) => prev + pointsEarned);
         setScoreGlow(true);
         setTimeout(() => setScoreGlow(false), 200);

         const nextCharIndex = charIndex + 1;

         if (nextCharIndex >= sentence.length) {
            // --- SENTENCE COMPLETE! ---
            playAudioBeep('sentence');
            setSentencesDone((prev) => prev + 1);

            // Bonus points + bonus seconds
            setScore((prev) => prev + 100);
            setBonusNotification(`+${BONUS_SECONDS_PER_SENTENCE}s BONUS & +100 PTS!`);
            setTimeout(() => setBonusNotification(null), 1400);

            // Extend deadline capped at MAX_TIME_CAP
            const now = Date.now();
            const currentRemainingMs = Math.max(0, deadlineRef.current - now);
            const addedMs = BONUS_SECONDS_PER_SENTENCE * 1000;
            const maxMs = MAX_TIME_CAP * 1000;
            deadlineRef.current = now + Math.min(maxMs, currentRemainingMs + addedMs);
            setTimeLeft(Math.ceil((deadlineRef.current - now) / 1000));

            // Load next round with fresh scrambled curated tiles
            setCurrentRound(generateRound(sentence));
         } else {
            // Advance within same sentence
            setCurrentRound((prev) => ({ ...prev, charIndex: nextCharIndex }));
         }
      } else {
         // --- WRONG KEY (No backspace! Streak reset & -5 penalty) ---
         playAudioBeep('wrong');
         setActiveFeedback({ key: pressedKey, type: 'wrong' });

         setStreak(0);
         setScore((prev) => Math.max(0, prev - 5));

         // Vibrate device briefly if supported on mobile
         if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(50); } catch { /* ignore */ }
         }
      }

      // Clear button feedback flash after 180ms
      setTimeout(() => {
         setActiveFeedback((curr) => (curr?.key === pressedKey ? null : curr));
      }, 180);
   }, [status, currentRound, streakMultiplier, playAudioBeep]);

   // Accuracy calculation
   const accuracy = totalKeystrokes > 0
      ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
      : 100;

   // Expected character indicator
   const expectedChar = currentRound.sentence[currentRound.charIndex] || '';
   const isSpaceExpected = expectedChar === ' ';

   // ----------------------------------------------------
   // VIEW 1: Idle Screen
   // ----------------------------------------------------
   if (status === 'idle') {
      return (
         <div className="flex flex-col items-center justify-center w-full max-w-sm sm:max-w-md text-center py-2 sm:py-6 px-1 sm:px-4">
            <style>{`
               @keyframes floatSlow {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-4px); }
               }
               .animate-float-slow {
                  animation: floatSlow 3s ease-in-out infinite;
               }
            `}</style>

            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 sm:mb-4 border-2 border-emerald-200/80 shadow-xs animate-float-slow">
               <Keyboard size={30} className="stroke-[2.2] sm:w-9 sm:h-9" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 tracking-tight">
               Typing Chaos
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-5 max-w-sm font-medium">
               Conquer scrambled keys under the clock! Type each sentence in order with the chaotic bubble tiles, and tap <span className="font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">[ SPACE ]</span> between words.
            </p>

            {/* Last Run Stats Summary if available */}
            {lastRunStats && (
               <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 mb-3 text-left">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                     <span>Last Run Results</span>
                     <span className="text-emerald-600 font-extrabold">{lastRunStats.score} pts</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                     <div className="bg-white p-1.5 rounded-xl border border-slate-100 font-bold">
                        <span className="block text-slate-800 text-sm font-black">{lastRunStats.sentences}</span>
                        <span className="text-slate-400 text-[10px]">Sentences</span>
                     </div>
                     <div className="bg-white p-1.5 rounded-xl border border-slate-100 font-bold">
                        <span className="block text-slate-800 text-sm font-black">{lastRunStats.accuracy}%</span>
                        <span className="text-slate-400 text-[10px]">Accuracy</span>
                     </div>
                     <div className="bg-white p-1.5 rounded-xl border border-slate-100 font-bold">
                        <span className="text-amber-600 text-sm font-black flex items-center justify-center gap-0.5">
                           {lastRunStats.maxStreak} <Flame size={12} className="fill-amber-500" />
                        </span>
                        <span className="text-slate-400 text-[10px]">Streak</span>
                     </div>
                  </div>
               </div>
            )}

            <div className="grid grid-cols-3 gap-2 w-full mb-3 sm:mb-5 text-xs font-bold text-slate-700">
               <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center shadow-xs">
                  <Timer size={16} className="text-emerald-600 mb-0.5" />
                  <span className="text-emerald-600 text-sm sm:text-base font-black">60s</span>
                  <span className="text-slate-500 text-[10px]">Time Attack</span>
               </div>
               <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center shadow-xs">
                  <Sparkles size={16} className="text-amber-500 mb-0.5" />
                  <span className="text-amber-500 text-sm sm:text-base font-black">+3s</span>
                  <span className="text-slate-500 text-[10px]">Per Sentence</span>
               </div>
               <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center shadow-xs">
                  <Zap size={16} className="text-rose-500 mb-0.5" />
                  <span className="text-rose-500 text-sm sm:text-base font-black">Zero</span>
                  <span className="text-slate-500 text-[10px]">Backspace</span>
               </div>
            </div>

            <div className="w-full flex items-center gap-2 bg-amber-50/70 border border-amber-200/70 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl mb-3 sm:mb-5 text-[11px] sm:text-xs text-amber-900 text-left font-medium">
               <AlertTriangle size={16} className="text-amber-600 shrink-0" />
               <span><strong>No Backspace</strong>: Wrong keys break streak and dock 5 points. Stay sharp!</span>
            </div>

            <button
               type="button"
               onClick={handleStart}
               className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-base sm:text-lg py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
               <Zap size={20} className="fill-white" />
               Start Chaos Mode
            </button>
         </div>
      );
   }

   // ----------------------------------------------------
   // VIEW 2: Over Screen (Results only, no playing card)
   // ----------------------------------------------------
   if (status === 'over') {
      return (
         <div className="flex flex-col items-center justify-center w-full max-w-sm text-center py-2 sm:py-4 px-2 animate-pop">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center mx-auto mb-2 shadow-xs">
               <Trophy size={28} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-0.5">Time Up!</h3>
            <p className="text-slate-500 text-xs mb-3">Here is your typing performance report:</p>

            <div className="grid grid-cols-2 gap-2 text-left w-full mb-4">
               <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Final Score</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-600">{score}</span>
               </div>
               <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Sentences</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-800">{sentencesDone}</span>
               </div>
               <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Accuracy</span>
                  <span className="text-lg sm:text-xl font-extrabold text-slate-800">{accuracy}%</span>
               </div>
               <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Max Streak</span>
                  <span className="text-lg sm:text-xl font-extrabold text-amber-600 inline-flex items-center gap-1">
                     {maxStreak} <Flame size={14} className="text-amber-500 fill-amber-500" />
                  </span>
               </div>
            </div>

            <button
               type="button"
               onClick={handleStart}
               className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
               <RotateCcw size={16} />
               Play Again
            </button>
         </div>
      );
   }

   // ----------------------------------------------------
   // VIEW 3: Playing Screen (Compact, screen + keys close together)
   // ----------------------------------------------------
   const timerPercent = Math.min(100, Math.max(0, (timeLeft / INITIAL_TIME_SECONDS) * 100));
   const isUrgent = timeLeft <= 10;
   const isWarning = timeLeft <= 20;

   return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto select-none px-0.5 sm:px-1 py-0">
         {/* Custom Keyframe animations */}
         <style>{`
            @keyframes shakeKey {
               0%, 100% { transform: translateX(0); }
               20%, 60% { transform: translateX(-3px); }
               40%, 80% { transform: translateX(3px); }
            }
            .animate-shake {
               animation: shakeKey 0.2s ease-in-out;
            }
            @keyframes popBounce {
               0% { transform: scale(0.9); opacity: 0; }
               50% { transform: scale(1.06); }
               100% { transform: scale(1); opacity: 1; }
            }
            .animate-pop {
               animation: popBounce 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
         `}</style>

         {/* Header Bar: Timer, Score, Streak, Sound Toggle */}
         <div className="flex items-center justify-between w-full mb-1 sm:mb-1.5 px-0.5">
            {/* Timer Badge */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-black text-xs sm:text-sm border transition-colors ${isUrgent
               ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
               : isWarning
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
               }`}>
               <Timer size={13} />
               <span>{timeLeft}s</span>
            </div>

            {/* Streak & Multiplier */}
            <div className="flex items-center gap-1">
               {streak >= 3 ? (
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-700 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-black animate-pop">
                     <Flame size={12} className="text-amber-500 fill-amber-500" />
                     <span>{streak} ({streakMultiplier}x)</span>
                  </div>
               ) : (
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-500">
                     Sentences: <span className="font-bold text-slate-700">{sentencesDone}</span>
                  </div>
               )}
            </div>

            {/* Score & Sound Toggle */}
            <div className="flex items-center gap-1.5">
               <div className={`text-xs sm:text-sm font-black transition-transform ${scoreGlow ? 'scale-110 text-emerald-600' : 'text-slate-800'}`}>
                  Score: <span className="text-sm sm:text-base text-emerald-600">{score}</span>
               </div>
               <button
                  type="button"
                  onClick={() => setSoundEnabled((v) => !v)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
                  aria-label={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
               >
                  {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
               </button>
            </div>
         </div>

         {/* Countdown Progress Bar */}
         <div className="w-full h-1 sm:h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5 sm:mb-2 border border-slate-200/50">
            <div
               className={`h-full transition-all duration-150 rounded-full ${isUrgent ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
               style={{ width: `${timerPercent}%` }}
            />
         </div>

         {/* Bonus Celebration Notification Banner */}
         {bonusNotification && (
            <div className="mb-1 px-2.5 py-0.5 bg-emerald-600 text-white text-[11px] font-extrabold rounded-full shadow-xs animate-pop flex items-center gap-1">
               <Sparkles size={12} />
               <span>{bonusNotification}</span>
            </div>
         )}

         {/* ---------------------------------------------------------------- */}
         {/* Sentence Card with Progress Highlighting (Directly above Keys) */}
         {/* ---------------------------------------------------------------- */}
         <div className="w-full bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 mb-1 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
               <span>Sentence #{sentencesDone + 1}</span>
               <span>{currentRound.charIndex} / {currentRound.sentence.length}</span>
            </div>

            {/* Sentence Letters Rendering */}
            <div className="text-base sm:text-lg md:text-xl font-black text-center tracking-normal sm:tracking-wider leading-snug wrap-break-word font-mono min-h-6 sm:min-h-8 flex items-center justify-center flex-wrap gap-x-0.5">
               {currentRound.sentence.split('').map((char, index) => {
                  const isCompleted = index < currentRound.charIndex;
                  const isCurrent = index === currentRound.charIndex;

                  if (char === ' ') {
                     return (
                        <span
                           key={index}
                           className={`inline-flex items-center justify-center mx-0.5 px-1 py-0.5 rounded text-[10px] sm:text-xs transition-all ${isCompleted
                              ? 'text-emerald-400 font-extrabold'
                              : isCurrent
                                 ? 'bg-amber-400/25 text-amber-300 border border-amber-400/60 scale-105 font-bold'
                                 : 'text-slate-600'
                              }`}
                        >
                           {isCurrent ? '␣' : '·'}
                        </span>
                     );
                  }

                  return (
                     <span
                        key={index}
                        className={`inline-block transition-colors duration-75 ${isCompleted
                           ? 'text-emerald-400 font-black'
                           : isCurrent
                              ? 'text-amber-300 underline underline-offset-2 decoration-amber-400 decoration-2 font-black scale-110 drop-shadow-xs'
                              : 'text-slate-500 font-bold'
                           }`}
                     >
                        {char}
                     </span>
                  );
               })}
            </div>
         </div>

         {/* ---------------------------------------------------------------- */}
         {/* Option A: Curated Tile Bubble Grid (Directly under Sentence) */}
         {/* ---------------------------------------------------------------- */}
         <div className="w-full bg-slate-50 border border-slate-200/90 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-xs mb-1">
            <div className="flex items-center justify-between mb-1 px-0.5">
               <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Keys ({currentRound.tiles.length})
               </span>
               <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">
                  Target: <strong className="text-slate-900">{isSpaceExpected ? '[ SPACE ]' : expectedChar}</strong>
               </span>
            </div>

            {/* Chunky Bubble Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-1 sm:gap-1.5 w-full justify-items-center">
               {currentRound.tiles.map((letter, idx) => {
                  const isFeedback = activeFeedback?.key === letter;
                  const isCorrectFeedback = isFeedback && activeFeedback.type === 'correct';
                  const isWrongFeedback = isFeedback && activeFeedback.type === 'wrong';

                  return (
                     <button
                        key={`${letter}-${idx}`}
                        type="button"
                        disabled={status !== 'playing'}
                        onClick={() => handleKey(letter)}
                        className={`w-full aspect-square max-w-13 h-10 sm:h-12 min-h-10 rounded-lg sm:rounded-xl font-black text-base sm:text-xl flex items-center justify-center transition-all duration-75 select-none touch-manipulation cursor-pointer border-2 ${isCorrectFeedback
                           ? 'bg-emerald-500 text-white border-emerald-600 scale-95 shadow-none'
                           : isWrongFeedback
                              ? 'bg-rose-500 text-white border-rose-600 animate-shake shadow-none'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 active:scale-90 active:border-emerald-400 active:bg-emerald-100 shadow-xs'
                           }`}
                     >
                        {letter}
                     </button>
                  );
               })}
            </div>
         </div>

         {/* ---------------------------------------------------------------- */}
         {/* Option B: Dedicated On-Screen [ SPACE ] Button */}
         {/* ---------------------------------------------------------------- */}
         <div className="w-full">
            {(() => {
               const isSpaceFeedback = activeFeedback?.key === ' ';
               const isCorrectSpace = isSpaceFeedback && activeFeedback.type === 'correct';
               const isWrongSpace = isSpaceFeedback && activeFeedback.type === 'wrong';

               return (
                  <button
                     type="button"
                     disabled={status !== 'playing'}
                     onClick={() => handleKey(' ')}
                     className={`w-full h-9 sm:h-11 min-h-9 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-1.5 border-2 transition-all duration-75 select-none touch-manipulation cursor-pointer ${isCorrectSpace
                        ? 'bg-emerald-500 text-white border-emerald-600 scale-98 shadow-none'
                        : isWrongSpace
                           ? 'bg-rose-500 text-white border-rose-600 animate-shake shadow-none'
                           : isSpaceExpected
                              ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs scale-[1.01]'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50 active:scale-95 shadow-xs'
                        }`}
                  >
                     <span className="text-sm sm:text-base">␣</span>
                     <span>SPACE</span>
                     {isSpaceExpected && (
                        <span className="text-[9px] sm:text-[10px] bg-slate-900/10 px-1.5 py-0.5 rounded-full font-bold">
                           TAP
                        </span>
                     )}
                  </button>
               );
            })()}
         </div>
      </div>
   );
}

