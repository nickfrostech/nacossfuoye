'use client';

import GameWrapper from '../GameWrapper';
import Game2048 from './Game2048';

export default function Game2048Page() {
   return (
      <GameWrapper
         slug="2048"
         GameComponent={Game2048}
      />
   );
}
