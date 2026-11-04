import { buildPageMetadata } from '@/lib/site-config';

export const metadata = buildPageMetadata({
   title: 'Typing Chaos Game',
   description:
      'Type sentences against the clock using a chaotic scrambled keyboard bubble grid on the NACOSS FUOYE Games Hub.',
   pathname: '/games/typing-chaos',
});

export default function TypingChaosLayout({ children }) {
   return children;
}
