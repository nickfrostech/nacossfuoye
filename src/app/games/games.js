export const GAMES = [
   {
      slug: 'blind-timer',
      name: 'Blind Timer',
      developer: 'Nick Frost',
      developerLink: 'https://github.com/nickfrostech',
      releaseDate: '12/10/2026',
      description: 'Test your internal clock. Can you guess exactly when the target time has passed without looking?',
      howToPlay: 'Look at the Target Time. Click "Start Timer" and wait. When you think the exact amount of time has passed, click "Stop Timer!". The closer you are to the target (in milliseconds), the higher your score!',
   },
   {
      slug: 'reaction-timer',
      name: 'Reaction Timer',
      developer: 'Nick Frost',
      developerLink: 'https://github.com/nickfrostech',
      releaseDate: '19/10/2026',
      description: 'How fast are your reflexes? Click as soon as the screen turns green.',
      howToPlay: 'Wait for the red box to turn green, then click as fast as you can. If you click too early, you lose points. A faster reaction gives a higher score!',
   },
   {
      slug: 'memory-match',
      name: 'Memory Match',
      developer: 'Nick Frost',
      developerLink: 'https://github.com/nickfrostech',
      releaseDate: '26/10/2026',
      description: 'Test your memory by finding all the matching pairs in the shortest amount of time.',
      howToPlay: 'Click on two cards to flip them. If they match, they stay face up. If not, they flip back over. Clear the board in the fewest moves to get a high score!',
   },
   {
      slug: 'stroop-challenge',
      name: 'Stroop Challenge',
      developer: 'apcodesphere',
      developerLink: 'https://github.com/apreezofficial',
      releaseDate: '02/11/2026',
      hidden: false,
      description: 'Match colours and text under pressure. Can you ignore the word and pick the right card?',
      howToPlay: 'Read the instruction: find the card whose background, text colour or word matches the target colour. You have 5 seconds per round and 3 lives. Wrong picks and timeouts cost a life. Tap a card or press keys 1-4. Each correct answer adds a point.',
   },
   {
      slug: 'typing-chaos',
      name: 'Typing Chaos',
      developer: 'Nick Frost',
      developerLink: 'https://github.com/nickfrostech',
      releaseDate: '09/11/2026',
      hidden: false,
      description: 'Conquer the clock by typing random sentences using a chaotic scrambled on-screen keyboard bubble grid!',
      howToPlay: 'A random sentence appears on screen. Tap the scrambled on-screen bubble tiles to type each letter in order, and tap the dedicated [ SPACE ] button between words. There is no backspace: wrong keys lose streak and deduct points! Complete sentences to earn bonus seconds and build up your high score before the 60s timer expires.',
   },
   {
      slug: 'unmasked',
      name: 'Unmasked',
      developer: 'apcodesphere',
      developerLink: 'https://github.com/apreezofficial',
      releaseDate: '16/11/2026',
      description: 'Flip the tiles and find the matching shapes in as few tries as you can.',
      howToPlay: 'Tap a tile to reveal its shape, then tap a second one. If the shapes match, they stay revealed. Find all 6 pairs using as few tries as you can, and as fast as you can. Fewer tries and less time give a higher score.',
   },
   {
      slug: 'batmobile',
      name: 'Batmobile: Gotham City Pursuit',
      developer: 'apcodesphere',
      developerLink: 'https://github.com/apreezofficial',
      releaseDate: '30/11/2026',
      description: 'Dodge Gotham traffic at full speed, collect gems and clear the road with batarangs.',
      howToPlay: 'Steer the Batmobile between three lanes with A/D or the arrow keys (or the on-screen buttons on a phone). Hold Space or the Nitro button to speed up, but nitro drains and refills slowly. Press F or the Fire button to throw a batarang and destroy the car ahead of you; you have 3 and they reload over time. Hitting traffic costs one of your 6 hull points. Collect gems for bonus points: each gem adds 50 points, and gems are saved to your wallet. Your score is distance plus 100 per car destroyed plus 50 per gem.',
   }
];

/**
 * Parses DD/MM/YYYY date strings into standard JavaScript Date objects.
 */
export const parseGameDate = (dateStr) => {
   if (!dateStr) return null;
   if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const [d, m, y] = dateStr.split('/').map((num) => parseInt(num, 10));
      if (d && m && y) {
         return new Date(y, m - 1, d, 0, 0, 0, 0);
      }
   }
   const parsed = new Date(dateStr);
   return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * A game is released only if:
 * 1. It is not manually marked hidden (hidden: true)
 * 2. Its scheduled releaseDate has arrived (date <= now)
 */
export const isGameReleased = (game) => {
   if (!game) return false;
   if (game.hidden) return false;
   if (!game.releaseDate) return true;
   const parsed = parseGameDate(game.releaseDate);
   return parsed ? new Date() >= parsed : true;
};

/**
 * A game is Coming Soon if its scheduled release date is in the future
 * and it is not hard-hidden.
 */
export const isGameComingSoon = (game) => {
   if (!game) return false;
   if (game.hidden) return false;
   if (!game.releaseDate) return false;
   const parsed = parseGameDate(game.releaseDate);
   return parsed ? new Date() < parsed : false;
};

/**
 * Returns all games to display on the Games Hub directory:
 * - Active / Released games first (sorted descending by release date)
 * - Upcoming / Coming Soon games (sorted ascending by scheduled release date)
 * Excludes games explicitly marked `hidden: true`.
 */
export const getVisibleGames = () => {
   const nonHidden = GAMES.filter((g) => !g.hidden);

   const released = nonHidden.filter(isGameReleased).sort((a, b) => {
      const dateA = parseGameDate(a.releaseDate) || new Date(0);
      const dateB = parseGameDate(b.releaseDate) || new Date(0);
      return dateB.getTime() - dateA.getTime();
   });

   const upcoming = nonHidden.filter(isGameComingSoon).sort((a, b) => {
      const dateA = parseGameDate(a.releaseDate) || new Date(0);
      const dateB = parseGameDate(b.releaseDate) || new Date(0);
      return dateA.getTime() - dateB.getTime();
   });

   return [...released, ...upcoming];
};

/**
 * The Active Game of the Week is the newest game whose releaseDate has arrived
 * and is not hidden. Coming Soon games are never selected as active weekly game.
 */
export const getActiveGame = () => {
   const released = GAMES.filter(isGameReleased).sort((a, b) => {
      const dateA = parseGameDate(a.releaseDate) || new Date(0);
      const dateB = parseGameDate(b.releaseDate) || new Date(0);
      return dateB.getTime() - dateA.getTime();
   });

   if (released.length === 0) {
      return GAMES.find((g) => !g.hidden && isGameReleased(g)) || null;
   }
   return released[0];
};

/**
 * Checks whether a specific game is the current active Game of the Week.
 */
export const isGameActive = (game) => {
   if (!game) return false;
   const active = getActiveGame();
   return active?.slug === game.slug;
};

export const getGameBySlug = (slug) => GAMES.find((game) => game.slug === slug);
