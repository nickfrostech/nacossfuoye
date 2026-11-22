'use client';

// Inspired by "Batmobile: Gotham City Pursuit", a standalone prototype supplied by the contributor.
// Adapted for the NACOSS Arcade Arena: cheat codes removed so scores can't be inflated, gems added.

import { useEffect, useRef, useState } from 'react';
import { AMMO_MAX, LIVES, createGame } from './engine';

const WALLET_KEY = 'nacoss_batmobile_gems';
const KEY_TO_CONTROL = {
   ArrowLeft: 'left',
   a: 'left',
   A: 'left',
   ArrowRight: 'right',
   d: 'right',
   D: 'right',
   ' ': 'nitro',
   ArrowUp: 'nitro',
   w: 'nitro',
   W: 'nitro',
};

const readWallet = () => {
   try {
      return Number(localStorage.getItem(WALLET_KEY)) || 0;
   } catch {
      // storage can be blocked (private mode), the wallet is only a convenience
      return 0;
   }
};

const writeWallet = (value) => {
   try {
      localStorage.setItem(WALLET_KEY, String(value));
   } catch {
      // see readWallet
   }
};

const INITIAL_HUD = { distance: 0, lives: LIVES, ammo: AMMO_MAX, nitro: 100, speed: 0, kills: 0, gems: 0, over: false };

function ControlButton({ label, onDown, onUp, tone = 'default', wide = false }) {
   const tones = {
      default: 'border-slate-500/60 text-slate-100',
      nitro: 'border-cyan-400/70 text-cyan-300',
      fire: 'border-rose-500/70 text-rose-300',
   };
   return (
      <button
         type="button"
         aria-label={label}
         onPointerDown={(event) => {
            event.preventDefault();
            onDown();
         }}
         onPointerUp={onUp}
         onPointerLeave={onUp}
         onPointerCancel={onUp}
         onContextMenu={(event) => event.preventDefault()}
         style={{ touchAction: 'none', WebkitTouchCallout: 'none', userSelect: 'none' }}
         className={`flex items-center justify-center rounded-2xl border-2 bg-slate-900/80 font-extrabold uppercase tracking-wider active:scale-[0.96] active:bg-slate-700 transition ${tones[tone]} ${
            wide ? 'h-16 flex-[1.4]' : 'h-16 flex-1'
         }`}
      >
         {label}
      </button>
   );
}

export default function Batmobile({ onGameOver }) {
   const canvasRef = useRef(null);
   const gameRef = useRef(null);
   const onOverRef = useRef(onGameOver);
   const [hud, setHud] = useState(INITIAL_HUD);
   const [wallet, setWallet] = useState(0);

   useEffect(() => {
      onOverRef.current = onGameOver;
   }, [onGameOver]);

   useEffect(() => {
      setWallet(readWallet());
      const game = createGame(canvasRef.current, {
         onHud: setHud,
         onOver: (score, runGems) => {
            writeWallet(readWallet() + runGems);
            setWallet(readWallet());
            onOverRef.current?.(score);
         },
      });
      gameRef.current = game;
      return () => {
         game.dispose();
         gameRef.current = null;
      };
   }, []);

   const control = (name, down) => gameRef.current?.setKey(name, down);
   const release = () => gameRef.current?.releaseKeys();

   const handleKeyDown = (event) => {
      if (event.key === 'f' || event.key === 'F') {
         event.preventDefault();
         gameRef.current?.fire();
         return;
      }
      const name = KEY_TO_CONTROL[event.key];
      if (!name) return;
      event.preventDefault(); // stop the arrow keys and space from scrolling the page
      control(name, true);
   };

   const handleKeyUp = (event) => {
      const name = KEY_TO_CONTROL[event.key];
      if (name) control(name, false);
   };

   const lifeRatio = hud.lives / LIVES;
   const pips = Array.from({ length: LIVES }, (_, i) => i < hud.lives);

   return (
      <div className="flex flex-col w-full max-w-md gap-3">
         <div className="flex items-stretch justify-between gap-2">
            <div className="flex-1 min-w-0 rounded-xl bg-slate-900 border border-slate-700 px-2 py-2 text-center">
               <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Distance</div>
               <div className="text-xl font-extrabold text-white tabular-nums">{hud.distance}</div>
            </div>
            <div className="flex-1 min-w-0 rounded-xl bg-slate-900 border border-slate-700 px-2 py-2 text-center">
               <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Gems</div>
               <div className="text-xl font-extrabold text-cyan-300 tabular-nums">{hud.gems}</div>
            </div>
            <div className="flex-1 min-w-0 rounded-xl bg-slate-900 border border-slate-700 px-2 py-2 text-center">
               <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Wallet</div>
               <div className="text-xl font-extrabold text-amber-300 tabular-nums">{wallet}</div>
            </div>
         </div>

         <div
            className="relative w-full overflow-hidden rounded-2xl bg-black aspect-[3/4] sm:aspect-[16/10] max-h-[70vh]"
            tabIndex={0}
            role="application"
            aria-label="Batmobile game. Steer with A and D or the arrow keys, hold Space for nitro and press F to fire."
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onBlur={release}
            onPointerDown={(event) => event.currentTarget.focus({ preventScroll: true })}
            style={{ touchAction: 'none' }}
         >
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

            <div className="pointer-events-none absolute left-2 top-2 flex gap-1">
               {pips.map((alive, i) => (
                  <span
                     key={i}
                     className={`h-2 w-4 rounded-sm ${alive ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-rose-950'}`}
                  />
               ))}
            </div>
            <div className="pointer-events-none absolute right-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-white tabular-nums">
               {hud.speed} mph
            </div>
            <div className="pointer-events-none absolute left-2 bottom-2 flex items-center gap-2 rounded-lg bg-black/60 px-2 py-1 text-[11px] font-bold uppercase text-slate-200">
               <span>Ammo</span>
               {Array.from({ length: AMMO_MAX }, (_, i) => (
                  <span key={i} className={`h-3 w-2 ${i < hud.ammo ? 'bg-sky-400' : 'bg-slate-700'}`} />
               ))}
            </div>
            <div className="pointer-events-none absolute right-2 bottom-2 w-28 rounded-lg bg-black/60 px-2 py-1">
               <div className="text-[10px] font-bold uppercase text-slate-300">Nitro</div>
               <div className="mt-1 h-2 w-full overflow-hidden rounded bg-slate-800">
                  <div className="h-full bg-gradient-to-r from-cyan-700 to-cyan-300" style={{ width: `${hud.nitro}%` }} />
               </div>
            </div>
            <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 text-[10px] font-bold text-slate-400 tabular-nums">
               {Math.round(lifeRatio * 100)}% hull
            </div>
         </div>

         <div className="grid grid-cols-[1fr_1fr_1.4fr_1fr] gap-2">
            <ControlButton label="◀" onDown={() => control('left', true)} onUp={() => control('left', false)} />
            <ControlButton label="▶" onDown={() => control('right', true)} onUp={() => control('right', false)} />
            <ControlButton
               label="Nitro"
               tone="nitro"
               wide
               onDown={() => control('nitro', true)}
               onUp={() => control('nitro', false)}
            />
            <ControlButton label="Fire" tone="fire" onDown={() => gameRef.current?.fire()} onUp={() => {}} />
         </div>

         <p className="text-center text-sm text-slate-500">
            Dodge traffic and collect gems. Batarangs clear cars ahead. Keyboard: A/D or arrows to steer, Space for nitro,
            F to fire.
         </p>
      </div>
   );
}
