// Pure 2048 rules (no React) so they are easy to test.
// A tile is { id, value, r, c, isNew, merged, willMerge, dying }.
// When two tiles merge, both slide into the same cell: the one that moved in is marked
// `dying` and the one that stayed is marked `willMerge`. `settle` then removes the dying
// tile and doubles the survivor, which lets the UI animate the slide before the merge.

export const SIZE = 4;

const DIRECTIONS = ['left', 'right', 'up', 'down'];

// Position of slot `slot` (0 = the edge tiles slide towards) in line `line`
const slotToCell = (dir, line, slot) => {
   if (dir === 'left') return { r: line, c: slot };
   if (dir === 'right') return { r: line, c: SIZE - 1 - slot };
   if (dir === 'up') return { r: slot, c: line };
   return { r: SIZE - 1 - slot, c: line };
};

// Tiles of one line ordered from the edge they slide towards
const lineTiles = (tiles, dir, line) => {
   const inLine = tiles.filter((t) => (dir === 'left' || dir === 'right' ? t.r === line : t.c === line));
   const key = dir === 'left' || dir === 'right' ? 'c' : 'r';
   const ascending = dir === 'left' || dir === 'up';
   return inLine.sort((a, b) => (ascending ? a[key] - b[key] : b[key] - a[key]));
};

/**
 * Slides every tile in `dir`. Returns the new tiles (including dying ones), the points
 * gained and whether anything changed.
 */
export const move = (tiles, dir) => {
   if (!DIRECTIONS.includes(dir)) throw new Error(`Unknown direction: ${dir}`);

   const live = tiles.filter((t) => !t.dying).map((t) => ({ ...t, isNew: false, merged: false, willMerge: false }));
   const result = [];
   let score = 0;
   let moved = false;

   for (let line = 0; line < SIZE; line++) {
      let slot = 0;
      let previous = null;

      for (const tile of lineTiles(live, dir, line)) {
         if (previous && previous.value === tile.value) {
            const { r, c } = { r: previous.r, c: previous.c };
            previous.willMerge = true;
            result.push({ ...tile, r, c, dying: true });
            score += tile.value * 2;
            moved = true;
            previous = null;
            continue;
         }

         const { r, c } = slotToCell(dir, line, slot);
         if (r !== tile.r || c !== tile.c) moved = true;
         const placed = { ...tile, r, c };
         result.push(placed);
         previous = placed;
         slot += 1;
      }
   }

   return { tiles: result, score, moved };
};

/** Removes dying tiles and doubles the tiles that were merged into. */
export const settle = (tiles) =>
   tiles
      .filter((t) => !t.dying)
      .map((t) => (t.willMerge ? { ...t, value: t.value * 2, merged: true, willMerge: false } : t));

const emptyCells = (tiles) => {
   const taken = new Set(tiles.filter((t) => !t.dying).map((t) => t.r * SIZE + t.c));
   const cells = [];
   for (let i = 0; i < SIZE * SIZE; i++) {
      if (!taken.has(i)) cells.push({ r: Math.floor(i / SIZE), c: i % SIZE });
   }
   return cells;
};

/** Adds a 2 (90%) or a 4 (10%) in a random empty cell. Returns the tiles unchanged if full. */
export const spawn = (tiles, nextId, random = Math.random) => {
   const cells = emptyCells(tiles);
   if (cells.length === 0) return tiles;
   const { r, c } = cells[Math.floor(random() * cells.length)];
   return [...tiles, { id: nextId(), value: random() < 0.9 ? 2 : 4, r, c, isNew: true, merged: false, willMerge: false }];
};

/** True when at least one move would change a settled board. */
export const canMove = (tiles) => {
   const settled = tiles.filter((t) => !t.dying);
   if (settled.length < SIZE * SIZE) return true;
   return DIRECTIONS.some((dir) => move(settled, dir).moved);
};

export const newBoard = (nextId, random = Math.random) => spawn(spawn([], nextId, random), nextId, random);

export const highestTile = (tiles) => tiles.reduce((max, t) => Math.max(max, t.value), 0);
