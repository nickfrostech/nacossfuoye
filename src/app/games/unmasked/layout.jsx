import { buildPageMetadata } from '@/lib/site-config';

export const metadata = buildPageMetadata({
   title: 'Unmasked Game',
   description:
      'Flip the tiles and match the shapes in the NACOSS FUOYE Unmasked game. Use fewer tries, finish faster and climb the departmental leaderboard.',
   pathname: '/games/unmasked',
});

export default function UnmaskedLayout({ children }) {
   return children;
}
