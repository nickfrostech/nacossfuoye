'use client';

import GameWrapper from '../GameWrapper';
import Unmasked from './Unmasked';

export default function UnmaskedPage() {
   return (
      <GameWrapper
         slug="unmasked"
         GameComponent={Unmasked}
      />
   );
}
