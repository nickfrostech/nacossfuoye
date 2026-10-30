import { buildPageMetadata } from '@/lib/site-config';

export const metadata = buildPageMetadata({
   title: 'Stroop Challenge Game',
   description:
      'Test your focus in the NACOSS FUOYE Stroop Challenge. Pick the right card when the word and colour disagree, and climb the departmental leaderboard.',
   pathname: '/games/stroop-challenge',
});

export default function StroopChallengeLayout({ children }) {
   return children;
}
