'use client';

import GameWrapper from '../GameWrapper';
import Batmobile from './Batmobile';

export default function BatmobilePage() {
   return (
      <GameWrapper
         slug="batmobile"
         GameComponent={Batmobile}
      />
   );
}
