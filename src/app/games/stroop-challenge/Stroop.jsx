'use client';

import { useReducer, useEffect, useRef } from 'react';

const COLORS = [
   { name: 'RED', hex: '#ef4444' },
   { name: 'BLUE', hex: '#3b82f6' },
   { name: 'GREEN', hex: '#22c55e' },
   { name: 'YELLOW', hex: '#eab308' },
];
const RULES = ['BACKGROUND', 'TEXT COLOR', 'WORD'];
const ROUND_MS = 5000;
const TICK_MS = 50;
const LIVES = 3;

const pick = (list) => list[Math.floor(Math.random() * list.length)];

const pickOther = (list, exclude) => pick(list.filter((item) => item.name !== exclude.name));

const matchesRule = (card, rule, target) => {
   if (rule === 'BACKGROUND') return card.bg.name === target.name;
   if (rule === 'TEXT COLOR') return card.text.name === target.name;
   return card.word.name === target.name;
};

// Builds a round where exactly one card matches the instruction
function buildRound() {
   const rule = pick(RULES);
   const target = pick(COLORS);
   let cards;
   do {
      cards = Array.from({ length: 4 }, () => {
         const bg = pick(COLORS);
         return { bg, text: pickOther(COLORS, bg), word: pick(COLORS) };
      });
   } while (cards.filter((card) => matchesRule(card, rule, target)).length !== 1);

   return {
      rule,
      target,
      cards,
      correct: cards.findIndex((card) => matchesRule(card, rule, target)),
   };
}

function createInitialState() {
   return {
      round: buildRound(),
      score: 0,
      streak: 0,
      lives: LIVES,
      deadline: Date.now() + ROUND_MS,
      timeLeft: ROUND_MS,
      feedback: null,
      status: 'playing',
   };
}

function loseLife(state, action, feedback) {
   const lives = state.lives - 1;
   if (lives === 0) {
      return { ...state, lives, streak: 0, timeLeft: 0, feedback, status: 'over' };
   }
   return {
      ...state,
      lives,
      streak: 0,
      round: action.next,
      deadline: action.now + ROUND_MS,
      timeLeft: ROUND_MS,
      feedback,
   };
}

function reducer(state, action) {
   switch (action.type) {
      case 'answer': {
         if (state.status !== 'playing') return state;
         if (action.index !== state.round.correct) return loseLife(state, action, 'wrong');
         return {
            ...state,
            score: state.score + 1,
            streak: state.streak + 1,
            round: action.next,
            deadline: action.now + ROUND_MS,
            timeLeft: ROUND_MS,
            feedback: 'correct',
         };
      }
      case 'tick':
         if (state.status !== 'playing') return state;
         return { ...state, timeLeft: Math.max(0, state.deadline - action.now) };
      case 'timeout':
         if (state.status !== 'playing' || state.timeLeft !== 0) return state;
         return loseLife(state, action, 'timeout');
      case 'restart':
         return { ...createInitialState(), round: action.next, deadline: action.now + ROUND_MS };
      default:
         return state;
   }
}

const FEEDBACK_TEXT = {
   correct: { text: 'Nice!', className: 'text-green-600' },
   wrong: { text: 'Wrong card! -1 life', className: 'text-red-500' },
   timeout: { text: 'Too slow! -1 life', className: 'text-red-500' },
};

const INSTRUCTION_LABEL = {
   BACKGROUND: 'background is',
   'TEXT COLOR': 'text colour is',
   WORD: 'word says',
};

export default function Stroop({ onGameOver }) {
   const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
   const reported = useRef(false);

   const answer = (index) => dispatch({ type: 'answer', index, next: buildRound(), now: Date.now() });

   // Countdown: refresh the time left while a round is running
   useEffect(() => {
      if (state.status !== 'playing') return undefined;
      const id = setInterval(() => dispatch({ type: 'tick', now: Date.now() }), TICK_MS);
      return () => clearInterval(id);
   }, [state.status, state.round]);

   // Out of time: lose a life and move on
   useEffect(() => {
      if (state.status === 'playing' && state.timeLeft === 0) {
         dispatch({ type: 'timeout', next: buildRound(), now: Date.now() });
      }
   }, [state.status, state.timeLeft]);

   // Report the final score once per run
   useEffect(() => {
      if (state.status === 'over' && !reported.current) {
         reported.current = true;
         onGameOver(state.score);
      }
   }, [state.status, state.score, onGameOver]);

   // Keys 1-4 pick the cards on desktop
   useEffect(() => {
      const onKey = (e) => {
         const index = Number(e.key) - 1;
         if (index >= 0 && index < 4) answer(index);
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
   });

   const restart = () => {
      reported.current = false;
      dispatch({ type: 'restart', next: buildRound(), now: Date.now() });
   };

   const { round, score, streak, lives, timeLeft, feedback, status } = state;
   const feedbackInfo = feedback ? FEEDBACK_TEXT[feedback] : null;

   return (
      <div className="flex flex-col items-center w-full max-w-md">
         <div className="flex justify-between w-full mb-4 px-2 font-bold text-slate-600">
            <span>Score: <span className="text-purple-600 text-xl">{score}</span></span>
            <span>Streak: <span className="text-purple-600 text-xl">{streak}</span></span>
            <span className="text-red-500">{'♥'.repeat(lives)}</span>
         </div>

         <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-purple-600" style={{ width: `${(timeLeft / ROUND_MS) * 100}%` }} />
         </div>

         <p className="text-lg font-bold text-slate-700 mb-6 text-center">
            Find the card whose {INSTRUCTION_LABEL[round.rule]}{' '}
            <span className="text-slate-900 underline">{round.target.name}</span>
         </p>

         <div className="grid grid-cols-2 gap-3 w-full">
            {round.cards.map((card, index) => (
               <button
                  key={index}
                  type="button"
                  disabled={status !== 'playing'}
                  onClick={() => answer(index)}
                  style={{ backgroundColor: card.bg.hex, color: card.text.hex }}
                  className="min-h-28 rounded-2xl text-2xl font-extrabold uppercase shadow-md transition-transform active:scale-95 disabled:opacity-60 touch-manipulation"
               >
                  {card.word.name}
               </button>
            ))}
         </div>

         <p className={`mt-4 h-6 font-bold text-sm ${feedbackInfo ? feedbackInfo.className : ''}`}>
            {feedbackInfo?.text}
         </p>

         {status === 'over' && (
            <button
               type="button"
               onClick={restart}
               className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700"
            >
               Play Again
            </button>
         )}
      </div>
   );
}
