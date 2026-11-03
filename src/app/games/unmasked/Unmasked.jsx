'use client';

// Inspired by "Unmasked!" by Ryan Mulligan (https://codepen.io/hexagoncircle/pen/xbZYyoQ).
// Original implementation for the NACOSS Arcade Arena.

import { useState, useEffect, useRef } from 'react';

const SHAPES = [
   { name: 'Circle', color: '#f97316', path: <circle cx="50" cy="50" r="30" /> },
   { name: 'Square', color: '#38bdf8', path: <rect x="22" y="22" width="56" height="56" rx="8" /> },
   { name: 'Triangle', color: '#a3e635', path: <polygon points="50,18 84,78 16,78" /> },
   { name: 'Diamond', color: '#e879f9', path: <polygon points="50,14 84,50 50,86 16,50" /> },
   { name: 'Star', color: '#facc15', path: <polygon points="50,14 61,38 87,41 67,59 73,85 50,72 27,85 33,59 13,41 39,38" /> },
   { name: 'Hexagon', color: '#34d399', path: <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" /> },
];
const PAIRS = SHAPES.length;

const deal = () =>
   [...SHAPES.keys(), ...SHAPES.keys()]
      .sort(() => Math.random() - 0.5)
      .map((shape, id) => ({ id, shape }));

export default function Unmasked({ onGameOver }) {
   const [cards, setCards] = useState([]);
   const [open, setOpen] = useState([]);
   const [matched, setMatched] = useState([]);
   const [tries, setTries] = useState(0);
   const [seconds, setSeconds] = useState(0);
   const [won, setWon] = useState(false);
   const startedAt = useRef(null);

   const reset = () => {
      setCards(deal());
      setOpen([]);
      setMatched([]);
      setTries(0);
      setSeconds(0);
      setWon(false);
      startedAt.current = null;
   };

   useEffect(() => {
      reset();
   }, []);

   useEffect(() => {
      if (won) return undefined;
      const timer = setInterval(() => {
         if (startedAt.current) setSeconds(Math.floor((Date.now() - startedAt.current) / 1000));
      }, 500);
      return () => clearInterval(timer);
   }, [won]);

   const pick = (index) => {
      if (open.length === 2 || open.includes(index) || matched.includes(index)) return;
      if (!startedAt.current) startedAt.current = Date.now();

      const next = [...open, index];
      setOpen(next);
      if (next.length < 2) return;

      const nextTries = tries + 1;
      setTries(nextTries);
      const [a, b] = next;

      if (cards[a].shape === cards[b].shape) {
         const nextMatched = [...matched, a, b];
         setMatched(nextMatched);
         setOpen([]);
         if (nextMatched.length === cards.length) {
            const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
            setSeconds(elapsed);
            setWon(true);
            // 1000 base, -40 per try beyond the 6 minimum, -2 per second, never below 100
            const score = Math.max(100, 1000 - (nextTries - PAIRS) * 40 - elapsed * 2);
            setTimeout(() => onGameOver(score), 600);
         }
      } else {
         setTimeout(() => setOpen([]), 900);
      }
   };

   const openSet = new Set(open);
   const matchedSet = new Set(matched);

   return (
      <div className="flex flex-col items-center w-full max-w-md rounded-2xl bg-slate-900 p-4 text-slate-100">
         <div className="flex justify-between w-full mb-4 px-1 font-bold">
            <span>Tries: <span className="text-sky-400 text-xl">{tries}</span></span>
            <span>Time: <span className="text-sky-400 text-xl">{seconds}s</span></span>
            <span>Pairs: <span className="text-sky-400 text-xl">{matched.length / 2} / {PAIRS}</span></span>
         </div>

         <div className="grid grid-cols-4 gap-3 w-full">
            {cards.map((card, idx) => {
               const revealed = openSet.has(idx) || matchedSet.has(idx);
               const shape = SHAPES[card.shape];
               return (
                  <button
                     key={card.id}
                     onClick={() => pick(idx)}
                     aria-label={revealed ? shape.name : 'Hidden tile'}
                     className={`aspect-square rounded-xl border flex items-center justify-center transition-all duration-300 ${
                        revealed
                           ? 'bg-slate-800 border-slate-600 scale-95'
                           : 'bg-linear-to-br from-slate-700 to-slate-800 border-slate-600 hover:-translate-y-1 hover:border-sky-400'
                     }`}
                  >
                     {revealed ? (
                        <svg viewBox="0 0 100 100" className="w-3/4 h-3/4" fill={shape.color} aria-hidden="true">
                           {shape.path}
                        </svg>
                     ) : (
                        <span className="block w-1/4 h-1/4 rounded-full bg-slate-500/50" aria-hidden="true" />
                     )}
                  </button>
               );
            })}
         </div>

         <button
            onClick={reset}
            className="mt-6 bg-sky-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-sky-500"
         >
            {won ? 'Play Again' : 'Reset game'}
         </button>
      </div>
   );
}
