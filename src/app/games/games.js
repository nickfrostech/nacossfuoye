export const GAMES = [
   {
      slug: 'memory-match',
      name: 'Memory Match',
      developer: 'Nick Frost',
      developerLink: 'https://github.com/nickfrostech',
      description: 'Test your memory by finding all the matching pairs in the shortest amount of time.',
      howToPlay: 'Click on two cards to flip them. If they match, they stay face up. If not, they flip back over. Clear the board in the fewest moves to get a high score!',
      isActive: true,
   },
   {
      slug: 'reaction-timer',
      name: 'Reaction Timer',
      developer: 'Nick Frost',
      developerLink: 'https://github.com/nickfrostech',
      description: 'How fast are your reflexes? Click as soon as the screen turns green.',
      howToPlay: 'Wait for the red box to turn green, then click as fast as you can. If you click too early, you lose points. A faster reaction gives a higher score!',
      isActive: false,
   },
   {
      slug: 'blind-timer',
      name: 'Blind Timer',
      developer: 'Nick Frost',
      developerLink: 'https://github.com/nickfrostech',
      description: 'Test your internal clock. Can you guess exactly when the target time has passed without looking?',
      howToPlay: 'Look at the Target Time. Click "Start Timer" and wait. When you think the exact amount of time has passed, click "Stop Timer!". The closer you are to the target (in milliseconds), the higher your score!',
      isActive: false,
   },
   {
      slug: 'stroop-challenge',
      name: 'Stroop Challenge',
      developer: 'apcodesphere',
      developerLink: 'https://github.com/apreezofficial',
      description: 'Match colours and text under pressure. Can you ignore the word and pick the right card?',
      howToPlay: 'Read the instruction: find the card whose background, text colour or word matches the target colour. You have 5 seconds per round and 3 lives. Wrong picks and timeouts cost a life. Tap a card or press keys 1-4. Each correct answer adds a point.',
      isActive: false,
   }
];

export const getActiveGame = () => GAMES.find(game => game.isActive);
export const getGameBySlug = (slug) => GAMES.find(game => game.slug === slug);
