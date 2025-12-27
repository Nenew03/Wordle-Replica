# [UI-002] On-Screen Keyboard — Technical Plan

This plan implements **[UI-002] On-Screen Keyboard** from `Docs/Context/feature_map.md` for the **current vanilla HTML/CSS/JS architecture** described in `Docs/Context/Architecture.md`.

## Repo alignment note (important)

The current workspace contains **only `Docs/`** (no `index.html`, `css/`, `js/`, `package.json`, or `src/`). This plan assumes you will create the baseline app files described in `Docs/Context/Architecture.md`:

- `index.html`
- `css/style.css`
- `js/game.js`

If you already have code elsewhere (different folder / separate repo), move/copy it into this workspace or tell Cursor to open the correct folder before implementing.

## Feature requirements (verbatim)

From `Docs/Context/feature_map.md` **[UI-002] On-Screen Keyboard**:

- QWERTY keyboard layout displayed below the game board.
- Keys show color feedback matching the best result for each letter across all guesses.
- Includes Enter and Backspace keys.
- Enter key submits current guess.
- Backspace key deletes last letter.
- Keys update color based on letter feedback (**green > yellow > gray**).
- Keys are large enough for mobile touch (**min 32px height**).
- Physical keyboard input also works (for desktop).
- Technical note: event listeners for both click and keydown; track “best” color per letter in a Map.

## Data model / state additions

In `js/game.js` (or equivalent state module), add/standardize these state pieces:

- `currentGuess: string`
- `guesses: string[]` (submitted guesses)
- `wordLength: number` (5–8)
- `gameOver: boolean`
- `letterStatus: Map<string, 'absent' | 'present' | 'correct'>`
  - Stores the **best** known status for each letter across all submitted guesses.

### Status precedence

Define a strict precedence used everywhere:

1. `correct` (green)
2. `present` (yellow)
3. `absent` (gray)

“Best” means: once a letter becomes green, it never downgrades to yellow/gray; yellow never downgrades to gray.

## DOM structure (keyboard)

In `index.html`, create a keyboard container below the board:

- Root container element: e.g. `div#keyboard.keyboard`
- Three rows for QWERTY letters:
  - Row 1: `Q W E R T Y U I O P`
  - Row 2: `A S D F G H J K L`
  - Row 3: `Z X C V B N M` plus **Backspace**
- Add a distinct **Enter** key (either within row 3 or a dedicated row) consistent with your layout.

Implementation detail:

- Use **event delegation**: attach one click handler to the keyboard root and read a `data-key` attribute from the clicked button.
- Normalize keys to uppercase letters for storage/display and to lowercase/semantic tokens for special keys (e.g. `ENTER`, `BACKSPACE`).

## Styling requirements (mobile-first)

In `css/style.css`, add keyboard styles:

- Layout:
  - `.keyboard` is a vertical stack of rows with gaps (touch-friendly).
  - Each row uses flex layout and centers keys.
- Key sizing:
  - Letter keys: **min-height 32px** (per acceptance criteria); recommended to use a larger touch target (44px) if it doesn’t crowd the layout.
  - Enter/Backspace: wider than letter keys.
- Visual states:
  - Default key style (unused)
  - `.absent`, `.present`, `.correct` styles matching tile colors (and readable text color)

## Event handling

Implement two input paths that both call the same core functions:

### 1) On-screen click/tap

- Attach `click` listener to the keyboard root element.
- On click:
  - If `data-key` is a letter: call `addLetter(letter)`
  - If `data-key` is Enter: call `submitGuess()`
  - If `data-key` is Backspace: call `deleteLetter()`

### 2) Physical keyboard

- Attach `keydown` listener at `document` level.
- On keydown:
  - `Enter` → `submitGuess()`
  - `Backspace` → `deleteLetter()`
  - `[a-zA-Z]` single letters → `addLetter(letter)`
- Guard rails:
  - If `gameOver` is true, ignore input (or only allow “new game” shortcut if you add it later).
  - If the focused element is an input/textarea, either prevent interference or ensure your app doesn’t use text inputs.

## Core functions to implement / connect

In `js/game.js`, define these functions (or confirm they exist and wire them up):

- `renderKeyboard()`
  - Creates the keyboard buttons (or finds them) and ensures each has `data-key`.
- `addLetter(letter: string)`
  - Appends to `currentGuess` up to `wordLength`.
  - Updates the board UI (UI-001 dependency will ultimately render `currentGuess` in the active row).
- `deleteLetter()`
  - Removes last char from `currentGuess`.
  - Updates the board UI.
- `submitGuess()`
  - Validates length == `wordLength`.
  - Validates word membership (GAME-001) before consuming a turn.
  - Evaluates guess into per-position statuses (GAME-002).
  - Calls `updateLetterStatusFromEvaluation(guess, evaluation)` (see next section).
  - Calls `renderKeyboardColors()` to reflect latest statuses.
- `renderKeyboardColors()`
  - For each key button, apply the CSS class based on `letterStatus`.

## Algorithm: update “best” color per letter

Inputs:

- `guess` (uppercase string)
- `evaluation` (array of statuses per position: `correct | present | absent`)

Steps:

1. For each position `i` in `guess`:
   - `letter = guess[i]`
   - `newStatus = evaluation[i]`
2. Look up existing: `prevStatus = letterStatus.get(letter)` (or undefined).
3. Compare precedence:
   - If there is no `prevStatus`, set it to `newStatus`.
   - Else set to whichever status has **higher precedence** (`correct` > `present` > `absent`).

Notes:

- This approach correctly produces “best across all guesses” behavior even with duplicate letters and repeated guesses.
- Duplicate-letter correctness still primarily depends on GAME-002’s evaluation algorithm; UI-002 just consumes the resulting per-position statuses.

## Integration points / dependencies

- **UI-001 (board rendering)**: `addLetter`/`deleteLetter` should update the “active row” tiles as the user types.
- **GAME-001 (validation)**: `submitGuess` must not advance the row for invalid words; show a short error message (implementation can be planned/added in GAME-001).
- **GAME-002 (evaluation)**: `submitGuess` needs an `evaluateGuess(guess, targetWord)` function that returns per-position statuses; UI-002 uses that output to update `letterStatus`.

## Files to change / create

Create (if missing):

- `index.html` (add keyboard container markup below the board)
- `css/style.css` (add keyboard layout + status styles)
- `js/game.js` (keyboard rendering, input handlers, letterStatus Map, update algorithm)

## Manual test checklist

- Clicking/tapping letter keys fills tiles up to `wordLength`.
- Backspace deletes last typed letter (both on-screen and physical keyboard).
- Enter:
  - Does nothing (or shows feedback) if `currentGuess.length !== wordLength`.
  - Submits when valid; advances to next row; clears `currentGuess`.
- After submission, keyboard colors update and follow precedence:
  - If a letter ever becomes green, it stays green even if later guesses would mark it yellow/gray.
  - Yellow stays yellow even if later guesses mark it gray.
- Mobile layout:
  - Keys are at least **32px** high and are not too cramped on 5–8 letter modes.

