import { buildPageMetadata } from '@/lib/site-config';

export const metadata = buildPageMetadata({
   title: '2048 Game',
   description:
      'Slide and merge matching tiles in the NACOSS FUOYE 2048 game. Chase the biggest tile, build a high score and climb the departmental leaderboard.',
   pathname: '/games/2048',
});

export default function Game2048Layout({ children }) {
   return children;
}
