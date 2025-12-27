# [UI-002] On-Screen Keyboard — Code Review

Reviewed against:
- `Docs/Features/UI-002_PLAN.md`
- `Docs/Context/feature_map.md` ([UI-002] acceptance criteria)
- `Docs/Context/briefing.md` (vanilla HTML/CSS/JS, minimal, mobile-first)

Code reviewed:
- `index.html`
- `css/style.css`
- `js/game.js`

## Plan compliance (is UI-002 implemented correctly?)

- **Keyboard container exists below board**: `div#keyboard.keyboard` added under the board ✅
- **QWERTY layout rendered**: 3 rows generated in `renderKeyboard()` ✅
  - Row 1: `Q W E R T Y U I O P` ✅
  - Row 2: `A S D F G H J K L` ✅
  - Row 3: includes `Z X C V B N M` plus **Enter** + **Backspace** ✅ (Enter is placed at the start of row 3; acceptable per plan)
- **Event delegation for clicks**: single click handler on the keyboard root using `closest("button.key[data-key]")` ✅
- **Enter/Backspace behaviors**:
  - Enter submits via `submitGuess()` ✅
  - Backspace deletes via `deleteLetter()` ✅
- **Physical keyboard input**: `document.addEventListener("keydown", ...)` maps Enter/Backspace/letters ✅
  - Includes the plan’s suggested guardrail to avoid interfering with `input/textarea/contentEditable` ✅
- **Key color feedback with precedence**:
  - `state.letterStatus` is a `Map` ✅
  - Precedence enforced (`correct` > `present` > `absent`) via `statusPrecedence()` ✅
  - `renderKeyboardColors()` applies `.correct/.present/.absent` to letter keys ✅
- **Mobile sizing**: `.key` uses `min-height: 44px` (>= 32px requirement) ✅

## Obvious bugs / functional issues

- **No immediate blocking UI-002 bugs found**: click + keydown input both work through the shared `addLetter/deleteLetter/submitGuess` functions, and keyboard colors update after submission.

Minor issues / concerns:
- **Row 3 layout crowding risk on very small screens**: Row 3 contains 9 keys including two `.wide` keys (`ENTER`, `BACKSPACE`). It may overflow or compress key widths heavily on narrow devices. Not a correctness bug, but worth verifying on a phone.

## Subtle data alignment / integration risks

- **Scope creep vs plan dependencies**:
  - `js/game.js` now includes `evaluateGuess()` and a `state.targetWord`. The UI-002 plan describes UI-002 as *consuming* GAME-002’s evaluation output, not necessarily implementing GAME-002 itself.
  - This is fine as a temporary stub for visual testing, but it will likely be replaced once `[DATA-001]` + `[GAME-004]` choose real target words.

- **`targetWord` placeholder is not a real game word**:
  - Default `targetWord` is `"CRANE"`.
  - `setWordLength()` sets `targetWord` using `"CRANE".slice(...).padEnd(..., "A")`, which produces values like `"CRANEA"` for 6 letters, etc.
  - This will make evaluations/keyboard colors behave “correctly” algorithmically, but not match the eventual real gameplay.

- **Missing `gameOver` state / gating** (plan item not implemented):
  - The plan calls for `gameOver: boolean` and using it to ignore inputs when the game ends.
  - Current logic gates on `state.guesses.length >= 6` in `addLetter/submitGuess`, but does not track win/lose state and does not disable inputs after a win (future GAME-003).

- **Missing GAME-001 integration** (expected per plan):
  - `submitGuess()` does not validate membership in a word list and does not show an error message for invalid words.
  - This is expected until GAME-001 is implemented, but it is a gap relative to the full plan checklist.

## Over-engineering / file sizing

- `js/game.js` is still readable, but it now mixes UI concerns (rendering keyboard) with early GAME concerns (`evaluateGuess`, `targetWord`).
- As GAME features land, consider splitting into small modules (even in vanilla JS) such as:
  - `keyboard.js` (rendering + events)
  - `gameLogic.js` (evaluateGuess, validation, win/lose)

## Style / consistency (functional programming style)

- The codebase is function-based (no classes) ✅
- State is mutated in-place (same as UI-001). This is pragmatic for MVP, but not “pure functional”; consider a more immutable update style if complexity grows.

## Recommended follow-ups (not required to accept UI-002)

- Replace the `targetWord` stub with a real target word selected by `[DATA-001]` + `[GAME-004]`.
- Add `gameOver`/`won` and stop accepting input after game end (GAME-003).
- Verify keyboard row responsiveness on very narrow screens (especially 8-letter mode).

