import { buildPageMetadata } from '@/lib/site-config';

export const metadata = buildPageMetadata({
   title: 'Batmobile: Gotham City Pursuit',
   description:
      'Steer the Batmobile through Gotham traffic in the NACOSS FUOYE Batmobile game. Dodge cars, collect gems, use nitro and climb the departmental leaderboard.',
   pathname: '/games/batmobile',
});

export default function BatmobileLayout({ children }) {
   return children;
}
