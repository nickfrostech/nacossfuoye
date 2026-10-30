'use client';

import GameWrapper from '../GameWrapper';
import Stroop from './Stroop';

export default function StroopChallengePage() {
   return (
      <GameWrapper
         slug="stroop-challenge"
         GameComponent={Stroop}
      />
   );
}
