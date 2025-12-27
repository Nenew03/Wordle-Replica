# UI-003: Word Length Selector — Code Review

## Plan compliance (UI-003_PLAN.md)

- **Button group markup above the board**: Implemented in `index.html` as `.length-selector` with four `.length-btn` buttons (5–8).
- **Default is 5 letters**: `state.wordLength` defaults to `5` and the 5 button is initially marked `.active` + `aria-pressed="true"`.
- **Event delegation**: Implemented via a single click listener on `.length-selector` using `.closest("button.length-btn[data-length]")`.
- **Active state**: Implemented via `syncLengthSelectorUI()` which toggles `.active` and updates `aria-pressed`.
- **Changing selection starts a new game**: Implemented via `setWordLength()` → `newGame()`.
- **CSS requirements**: Implemented `.length-selector` flex layout and `.length-btn` with `min-width/min-height: 44px` and a distinct `.active` style.

## Issues / risks found

- **`newGame()` doesn’t currently ensure keyboard colors are reset *after* the keyboard is rendered**: In practice it’s fine because `renderKeyboard()` calls `renderKeyboardColors()` at the end, but the initial call order is slightly odd (`newGame()` then `renderKeyboard()`), so the first `renderKeyboardColors()` in `newGame()` is redundant.
- **Word lists are placeholders**: `WORD_LISTS_BY_LENGTH` is a small curated set. This satisfies UI-003’s “new word of that length” behavior, but it does **not** satisfy `DATA-001` acceptance criteria (hundreds/thousands of words) yet.
- **Naming mismatch vs plan**: The plan references `gameState` and `newGame()` integration; the codebase uses `state`. This is fine functionally, but worth noting for doc/code consistency.

## Subtle alignment / data shape checks

- **Length parsing**: `data-length` is parsed with `Number(...)` and normalized through `clampWordLength()`. Non-numeric values safely fall back.
- **Board sizing**: `renderBoard()` sets the CSS custom property `--word-length` on the board element each render, keeping CSS grid and `--tile-size` aligned with the selected length.
- **Target word casing**: Random picks are normalized to uppercase before use, consistent with evaluation logic and rendering.

## Over-engineering / refactor notes

- **No over-engineering**: Selector integration is small and cohesive (`syncLengthSelectorUI`, `newGame`, `setWordLength`).
- **Future split**: When `DATA-001` grows (large word lists), consider moving `WORD_LISTS_BY_LENGTH` into a separate `js/words.js` module to keep `js/game.js` readable.

## Style consistency

- **Matches existing style**: Uses small, single-purpose functions and event delegation consistent with the on-screen keyboard code.
- **Minor doc inconsistency**: `.cursorrules` mentions a React/Tailwind stack, but the implemented app is vanilla HTML/CSS/JS per `Docs/Context/briefing.md`. No action needed for UI-003, but it’s confusing in repo-level guidance.

## Manual verification checklist

- [ ] Four buttons (5, 6, 7, 8) visible above the board
- [ ] Current selection shows `.active` styling
- [ ] Clicking a different length clears board + resets keyboard colors + changes grid width
- [ ] Default is 5 on initial load
- [ ] Buttons are touch-friendly (>= 44px)

