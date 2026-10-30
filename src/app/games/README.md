# NACOSS Games Hub

Welcome to the Games Hub for NACOSS! This directory contains weekly rotating mini-games played by students.

## Rules for Adding a Game
If you want to contribute a game to the hub, please follow these simple rules:

1. **Single-Player Only**: Since the platform tracks high scores on a leaderboard, all games must be single-player where the user can achieve a numerical score. Multiplayer games (like regular Tic-Tac-Toe) will not work with the leaderboard.
2. **Folder Structure**: Every game MUST be completely contained in its own folder within `src/app/games/`. Do not pollute the global components directory. 
   - `src/app/games/your-game/page.jsx` (The Next.js route)
   - `src/app/games/your-game/YourGame.jsx` (The actual game logic)
   - Any other components or assets specifically for your game go inside your folder.
3. **Use the GameWrapper**: Your `page.jsx` should simply render the global `<GameWrapper />` component. This wrapper automatically handles the player modal, stores user details in `localStorage`, and handles submitting the score to the database.
4. **The `onGameOver` Prop**: Your game logic component (`YourGame.jsx`) will receive a prop called `onGameOver`. Whenever your game ends, you MUST call this function with the final score as an integer. Example: `onGameOver(150)`. Higher score is better.
5. **Config Registration**: Once your game is built, add an entry to `src/app/games/games.js` filling out your `developer`, `developerLink`, `howToPlay`, etc.
   - **`releaseDate`**: Add your scheduled release date in **`DD/MM/YYYY`** format targeting the **next Monday** (e.g. `'09/11/2026'`). Upcoming games automatically display as an unplayable **Coming Soon** preview card on the Games Hub so students can learn how to play and anticipate the release.
   - **`hidden`**: Set `hidden: true` only if a game must be entirely hidden from the public hub (e.g. unfinished drafts or multiple games submitted for the same week).

## Example Structure

```text
src/app/games/
├── games.js
├── GameWrapper.jsx
├── page.jsx
├── README.md
└── super-mario-clone/
    ├── page.jsx
    ├── SuperMario.jsx
    └── MarioSprite.png
```
