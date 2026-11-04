'use client';

import GameWrapper from '../GameWrapper';
import TypingChaos from './TypingChaos';

export default function TypingChaosPage() {
   return (
      <GameWrapper
         slug="typing-chaos"
         GameComponent={TypingChaos}
      />
   );
}
