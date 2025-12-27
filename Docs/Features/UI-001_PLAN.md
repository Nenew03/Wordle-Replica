# [UI-001] Game Board Grid — Technical Plan

This plan implements **[UI-001] Game Board Grid** from `Docs/Context/feature_map.md` for the **current vanilla HTML/CSS/JS architecture** described in `Docs/Context/Architecture.md`.

## Repo alignment note (important)

The current workspace contains **only `Docs/`** (no `index.html`, `css/`, `js/`, `package.json`, or `src/`). This plan assumes you will create the baseline app files described in `Docs/Context/Architecture.md`:

- `index.html`
- `css/style.css`
- `js/game.js`

If you already have code elsewhere (different folder / separate repo), move/copy it into this workspace or tell Cursor to open the correct folder before implementing.

## Feature requirements (verbatim)

From `Docs/Context/feature_map.md` **[UI-001] Game Board Grid**:

- Display a grid of letter tiles.
- Grid dimensions adapt to word length (**5-8 columns**) and always has **6 rows** (guesses).
- Each tile shows a letter and background color based on feedback.
- Grid displays correct number of columns based on selected word length.
- Empty tiles show as outlined boxes.
- Filled tiles show the letter clearly.
- Tiles are large enough to tap on mobile (**min 44px**).
- Technical note: **CSS Grid**; use **CSS custom properties** for easy column adjustment.

## Data model / state needed by the board

In `js/game.js` (or equivalent state module), the board renderer should read from a minimal, UI-friendly state shape:

- `wordLength: number` (5–8)
- `currentGuess: string` (uppercase typing buffer)
- `guesses: Array<{ word: string; evaluation?: Array<'correct' | 'present' | 'absent'> }>`
  - `word` is the submitted guess (uppercase)
  - `evaluation` is optional until [GAME-002] exists; when present, it drives tile colors
- Derived:
  - `activeRowIndex = guesses.length` (0–5)

Notes:

- The board should not care how guesses are validated (GAME-001) or how evaluation is computed (GAME-002); it just consumes `guesses` + `currentGuess`.
- Keep `currentGuess.length <= wordLength`.

## DOM structure (board grid)

In `index.html`, add a dedicated board container:

- Root board element: `div#board.board`
- The board contains **6 × wordLength** tiles.

Implementation options:

- **Option A (recommended):** Render tiles dynamically from JS on each state change (simple and keeps HTML minimal).
- **Option B:** Pre-render 6 rows in HTML and query/update tiles (more markup, less JS DOM creation).

This plan assumes **Option A**.

## Styling requirements (CSS Grid + touch targets)

In `css/style.css`, implement:

### CSS custom properties

- `--word-length`: number of columns (5–8)
- `--tile-size`: tile size with **minimum 44px** touch target
- `--gap`: spacing between tiles

Recommended approach:

- Set `--word-length` on the board element (or `:root`) from JS whenever word length changes.
- Define `--tile-size` using `clamp()` so it’s at least 44px but can shrink/grow to fit small screens and longer words.

### Grid layout

- `.board` uses CSS Grid:
  - `grid-template-columns: repeat(var(--word-length), var(--tile-size))`
  - `grid-template-rows: repeat(6, var(--tile-size))`
  - `gap: var(--gap)`

### Tile visuals

- Empty tile:
  - outlined box (border)
  - neutral background
- Filled (typed/submitted) tile:
  - letter is centered, large, high contrast
  - consider a slightly stronger border/weight than empty so it reads as “filled”
- Status colors (driven by `evaluation` once GAME-002 exists):
  - `.correct`, `.present`, `.absent`

## Rendering algorithm (step-by-step)

Create a single source of truth render function, called after any state change:

### `renderBoard()`

1. Find board root: `const boardEl = document.getElementById('board')`.
2. Apply `--word-length` CSS variable based on `state.wordLength`.
3. Clear board contents (simple MVP approach): `boardEl.innerHTML = ''`.
4. For each row index `r` in `[0..5]`:
   - Determine if row is:
     - **submitted** (`r < guesses.length`)
     - **active** (`r === guesses.length`)
     - **future/empty** (`r > guesses.length`)
   - Determine row word:
     - submitted: `guesses[r].word`
     - active: `currentGuess`
     - future: `''`
   - Determine row evaluation (optional):
     - submitted: `guesses[r].evaluation` (if present)
     - otherwise: undefined
5. For each column index `c` in `[0..wordLength-1]`:
   - `letter = rowWord[c] ?? ''`
   - Compute tile classes:
     - Always include `.tile`
     - If `letter === ''`: add `.empty`
     - Else: add `.filled`
     - If row is submitted and evaluation exists: add `.correct`/`.present`/`.absent` for this position
6. Append tile elements in row-major order so CSS grid lays them out naturally.

### Tile element contents

- Use `textContent = letter` (single character or empty string).
- Ensure letters are stored/displayed uppercase consistently.

## Functions to implement / connect

In `js/game.js`, implement (or confirm and wire up) these board-related functions:

- `renderBoard()`
  - The main renderer described above.
- `setWordLength(nextLength: number)`
  - Updates `state.wordLength`
  - Resets board-related typing state as needed (usually also triggers a new game later via GAME-004)
  - Calls `renderBoard()`
- Input hooks used by UI-002:
  - `addLetter(letter: string)` → updates `currentGuess`, then `renderBoard()`
  - `deleteLetter()` → updates `currentGuess`, then `renderBoard()`
  - `submitGuess()` → pushes into `guesses`, clears `currentGuess`, then `renderBoard()`

## Integration points / dependencies

- **UI-003 (word length selector)** will call `setWordLength()`, which must update `--word-length` and rerender the board at the new width.
- **GAME-002 (letter feedback)** will provide `evaluation` arrays per submitted guess; UI-001 should apply the per-tile classes so the board displays feedback colors.
- **UI-002 (keyboard)** depends on `renderBoard()` being called by `addLetter`/`deleteLetter` so typed letters show up in the active row immediately.

## Files to change / create

Create (if missing):

- `index.html`
  - Add `div#board.board` in the main layout.
- `css/style.css`
  - Add `.board` grid styles + `.tile` + status classes.
  - Use CSS custom properties (`--word-length`, `--tile-size`, `--gap`) for easy column adjustment.
- `js/game.js`
  - Add `renderBoard()` and the small set of state + functions needed to keep the grid in sync.

## Manual test checklist

- Word length rendering:
  - Board shows **6 rows** always.
  - Board shows **5 columns** when `wordLength = 5` and scales up through **8 columns**.
- Empty vs filled:
  - Empty tiles are outlined boxes with no letter.
  - Typing fills letters left-to-right in the active row; letters are legible.
- Touch target:
  - Tiles are at least **44px** in both dimensions on mobile.
- Feedback colors (once GAME-002 exists):
  - Submitted rows show green/yellow/gray backgrounds per tile based on evaluation.
  - Active row remains “filled” styling without feedback colors until submitted.

