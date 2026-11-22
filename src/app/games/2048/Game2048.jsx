'use client';

// Inspired by 2048 by Gabriele Cirulli (https://github.com/gabrielecirulli/2048).
// Original implementation for the NACOSS Arcade Arena.

import { useCallback, useEffect, useRef, useState } from 'react';
import { canMove, highestTile, move, newBoard, settle, spawn, SIZE } from './logic';

const BEST_KEY = 'nacoss_2048_best';
const SLIDE_MS = 120;
const SWIPE_MIN_PX = 24;

const KEY_TO_DIRECTION = {
   ArrowLeft: 'left',
   ArrowRight: 'right',
   ArrowUp: 'up',
   ArrowDown: 'down',
   a: 'left',
   d: 'right',
   w: 'up',
   s: 'down',
};

// Every text/background pair has at least 4.8:1 contrast (WCAG AA is 4.5:1)
const TILE_STYLES = {
   2: { bg: '#ecfdf5', fg: '#14532d' },
   4: { bg: '#d1fae5', fg: '#14532d' },
   8: { bg: '#6ee7b7', fg: '#052e16' },
   16: { bg: '#34d399', fg: '#052e16' },
   32: { bg: '#facc15', fg: '#422006' },
   64: { bg: '#fb923c', fg: '#431407' },
   128: { bg: '#f97316', fg: '#431407' },
   256: { bg: '#dc2626', fg: '#ffffff' },
   512: { bg: '#be123c', fg: '#ffffff' },
   1024: { bg: '#7c3aed', fg: '#ffffff' },
   2048: { bg: '#0f172a', fg: '#fbbf24' },
};
const BEYOND_STYLE = { bg: '#020617', fg: '#fbbf24' };

const fontSizeFor = (value) => {
   const digits = String(value).length;
   if (digits <= 2) return '9.5cqw';
   if (digits === 3) return '8cqw';
   if (digits === 4) return '6.5cqw';
   return '5cqw';
};

const readBest = () => {
   try {
      return Number(localStorage.getItem(BEST_KEY)) || 0;
   } catch {
      return 0;
   }
};

const writeBest = (value) => {
   try {
      localStorage.setItem(BEST_KEY, String(value));
   } catch {
      // storage can be blocked (private mode), the best score is only a convenience
   }
};

export default function Game2048({ onGameOver }) {
   const nextId = useRef(0);
   const makeId = useCallback(() => ++nextId.current, []);

   const [tiles, setTiles] = useState([]);
   const [score, setScore] = useState(0);
   const [best, setBest] = useState(0);
   const [over, setOver] = useState(false);
   const [reached2048, setReached2048] = useState(false);

   const tilesRef = useRef([]);
   const scoreRef = useRef(0);
   const bestRef = useRef(0);
   const busyRef = useRef(false);
   const pendingRef = useRef(null);
   const doneRef = useRef(false);
   const celebratedRef = useRef(false);
   const timersRef = useRef([]);
   const boardRef = useRef(null);
   const swipeStart = useRef(null);

   const later = useCallback((fn, ms) => {
      timersRef.current.push(setTimeout(fn, ms));
   }, []);

   const start = useCallback(() => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      const board = newBoard(makeId);
      tilesRef.current = board;
      scoreRef.current = 0;
      busyRef.current = false;
      pendingRef.current = null;
      doneRef.current = false;
      celebratedRef.current = false;
      setTiles(board);
      setScore(0);
      setOver(false);
      setReached2048(false);
      boardRef.current?.focus({ preventScroll: true });

      // On a phone the board can start below the fold, so scroll just enough to show all of it
      later(() => {
         const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
         boardRef.current?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
      }, 250);
   }, [makeId, later]);

   useEffect(() => {
      start();
      bestRef.current = readBest();
      setBest(bestRef.current);
      const timers = timersRef;
      return () => timers.current.forEach(clearTimeout);
   }, [start]);

   const slide = useCallback(
      function run(direction) {
         if (doneRef.current) return;
         if (busyRef.current) {
            // a key pressed mid-slide is kept and played right after it
            pendingRef.current = direction;
            return;
         }

         const result = move(tilesRef.current, direction);
         if (!result.moved) return;

         busyRef.current = true;
         const withSpawn = spawn(result.tiles, makeId);
         tilesRef.current = withSpawn;
         setTiles(withSpawn);

         const nextScore = scoreRef.current + result.score;
         scoreRef.current = nextScore;
         setScore(nextScore);
         if (nextScore > bestRef.current) {
            bestRef.current = nextScore;
            setBest(nextScore);
            writeBest(nextScore);
         }

         later(() => {
            const settled = settle(withSpawn);
            tilesRef.current = settled;
            setTiles(settled);
            busyRef.current = false;

            if (!celebratedRef.current && highestTile(settled) >= 2048) {
               celebratedRef.current = true;
               setReached2048(true);
            }

            if (!canMove(settled)) {
               doneRef.current = true;
               pendingRef.current = null;
               setOver(true);
               later(() => onGameOver(scoreRef.current), 700);
               return;
            }

            const queued = pendingRef.current;
            pendingRef.current = null;
            if (queued) run(queued);
         }, SLIDE_MS);
      },
      [later, makeId, onGameOver]
   );

   const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const direction = KEY_TO_DIRECTION[event.key] ?? KEY_TO_DIRECTION[event.key.toLowerCase()];
      if (!direction) return;
      event.preventDefault(); // stop the arrow keys from scrolling the page
      slide(direction);
   };

   const handlePointerDown = (event) => {
      boardRef.current?.focus({ preventScroll: true });
      swipeStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
      try {
         // keeps receiving the pointer if the finger leaves the board mid-swipe
         event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
         // the pointer may already be gone, the swipe still works without capture
      }
   };

   const handlePointerUp = (event) => {
      const startPoint = swipeStart.current;
      swipeStart.current = null;
      if (!startPoint || startPoint.id !== event.pointerId) return;

      const dx = event.clientX - startPoint.x;
      const dy = event.clientY - startPoint.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return;

      if (Math.abs(dx) > Math.abs(dy)) slide(dx > 0 ? 'right' : 'left');
      else slide(dy > 0 ? 'down' : 'up');
   };

   const cancelSwipe = () => {
      swipeStart.current = null;
   };

   return (
      <div className="flex flex-col items-center w-full max-w-sm sm:max-w-md gap-4">
         <div className="flex items-stretch justify-between w-full gap-3">
            <div className="flex-1 min-w-0 rounded-xl bg-emerald-50 border border-emerald-200 px-2 sm:px-3 py-2 text-center">
               <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Score</div>
               <div className="text-xl sm:text-2xl font-extrabold text-emerald-900 tabular-nums">{score}</div>
            </div>
            <div className="flex-1 min-w-0 rounded-xl bg-amber-50 border border-amber-200 px-2 sm:px-3 py-2 text-center">
               <div className="text-[11px] font-bold uppercase tracking-wide text-amber-700">Best</div>
               <div className="text-xl sm:text-2xl font-extrabold text-amber-900 tabular-nums">{best}</div>
            </div>
            <button
               type="button"
               onClick={start}
               className="shrink-0 whitespace-nowrap rounded-xl bg-emerald-700 px-3 sm:px-4 text-sm font-bold text-white hover:bg-emerald-600 active:scale-[0.97] transition"
            >
               New game
            </button>
         </div>

         <div
            ref={boardRef}
            tabIndex={0}
            role="application"
            aria-label="2048 board. Use the arrow keys or swipe to slide the tiles."
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={cancelSwipe}
            style={{
               touchAction: 'none',
               WebkitTapHighlightColor: 'transparent',
               WebkitTouchCallout: 'none',
               // leaves room for the navbar and score row on short (landscape) phones
               maxWidth: 'min(100%, max(200px, calc(100svh - 170px)))',
            }}
            className="relative w-full aspect-square scroll-mb-4 rounded-2xl bg-emerald-950 select-none outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/60"
         >
            <div className="absolute inset-0" style={{ containerType: 'inline-size' }}>
               <div className="absolute" style={{ inset: '2.5cqw' }}>
                  {Array.from({ length: SIZE * SIZE }, (_, i) => (
                     <div
                        key={i}
                        className="absolute"
                        style={{
                           width: `${100 / SIZE}%`,
                           height: `${100 / SIZE}%`,
                           left: `${(i % SIZE) * (100 / SIZE)}%`,
                           top: `${Math.floor(i / SIZE) * (100 / SIZE)}%`,
                           padding: '1.25cqw',
                        }}
                     >
                        <div className="h-full w-full rounded-lg bg-emerald-900/70" />
                     </div>
                  ))}

                  {tiles.map((tile) => {
                     const style = TILE_STYLES[tile.value] ?? BEYOND_STYLE;
                     return (
                        <div
                           key={tile.id}
                           className="absolute transition-transform ease-out motion-reduce:transition-none"
                           style={{
                              width: `${100 / SIZE}%`,
                              height: `${100 / SIZE}%`,
                              padding: '1.25cqw',
                              transform: `translate(${tile.c * 100}%, ${tile.r * 100}%)`,
                              transitionDuration: `${SLIDE_MS}ms`,
                              zIndex: tile.dying ? 1 : tile.willMerge ? 2 : 3,
                           }}
                        >
                           <div
                              className={`flex h-full w-full items-center justify-center rounded-lg font-extrabold shadow-sm ${
                                 tile.isNew || tile.merged ? 'animate-in zoom-in-75 duration-150' : ''
                              }`}
                              style={{ background: style.bg, color: style.fg, fontSize: fontSizeFor(tile.value) }}
                           >
                              {tile.value}
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>

            {over && (
               <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-emerald-950/70 text-xl font-extrabold text-white">
                  No more moves
               </div>
            )}
         </div>

         <p className="text-center text-sm text-slate-500" aria-live="polite">
            {reached2048
               ? 'You made 2048! Keep going for a higher score.'
               : 'Swipe or use the arrow keys / WASD. Merge matching tiles to reach 2048.'}
         </p>
      </div>
   );
}
