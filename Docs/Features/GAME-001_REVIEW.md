# [GAME-001] Word Validation — Code Review

Reviewed against:
- `Docs/Features/GAME-001_PLAN.md`
- `Docs/Context/briefing.md` (vanilla HTML/CSS/JS, minimal, mobile-first)

Code reviewed:
- `js/game.js` (updated with validation logic + messaging)
- `js/words.js` (new word data file)
- `index.html` (existing `#status` element reused)
- `css/style.css` (existing `.status.error` styling reused)

## Plan compliance (is GAME-001 implemented correctly?)

- **Word data structure**: `js/words.js` exports `window.WORDS[length].{answers[], valid[]}` with answers ∪ valid stored as uppercase arrays ✅
- **VALID_SET_BY_LENGTH index**: Built as `Record<number, Set<string>>` with O(1) lookup, populated from `words ∪ validGuesses`, normalized to uppercase ✅
- **Validation timing**: `submitGuess()` calls `isValidGuessWord(state.currentGuess)` **before** consuming a turn ✅
- **Invalid guess handling**:
  - Shows "Not in word list" error message ✅
  - **Does not** push to `state.guesses` ✅
  - **Does not** clear `state.currentGuess` ✅
  - **Does not** update keyboard colors ✅
  - Returns early without consuming turn ✅
- **Valid guess flow**: Proceeds with `evaluateGuess()`, pushes result, updates letter status, clears currentGuess, re-renders ✅
- **UI messaging**: Reuses existing `#status` element with `role="status" aria-live="polite"` and `setStatus(message, "error", 1200)` ✅
- **Message auto-clear**: Timer-based clearing with 1200ms duration, cancels previous timers to prevent overlap ✅

## Obvious bugs / functional issues

- **No blocking functional bugs found**. Invalid words show error and don't consume turns; valid words proceed normally.
- **Edge case: missing word lists** handled gracefully - `isValidGuessWord()` returns `true` (allows all guesses) if `VALID_SET_BY_LENGTH[wordLength]` is empty/missing, keeping MVP playable while lists are being expanded.

## Subtle data alignment / integration risks

- **Word normalization consistency**: All word data stored uppercase in `words.js`, all lookups use `String(word).toUpperCase()`, matches existing `state.currentGuess` behavior ✅
- **Fallback for missing lists**: If `WORDS` object is missing/corrupted, `getWordsData()` returns `{}`, `rebuildValidSets()` creates empty sets, validation allows all guesses (safe for MVP) ✅
- **DATA-001 dependency**: Implementation correctly separates word data (`words.js`) from game logic (`game.js`), allowing word lists to expand without touching game code ✅

## Over-engineering / file sizing

- **Appropriate complexity**: Validation is a simple O(1) set lookup + early return in `submitGuess()` ✅
- **File sizes remain reasonable**: `game.js` still under 450 lines, `words.js` is pure data ✅
- **No unnecessary abstractions**: Direct set lookup is simpler and more performant than regex/array.includes for this use case ✅

## Style / consistency (functional programming style)

- **Function-based approach**: All logic in pure functions (`isValidGuessWord`, `rebuildValidSets`), no classes/methods ✅
- **State mutations**: Consistent with existing codebase style (direct `state` object mutations rather than immutable updates) ✅
- **Data loading**: Clean separation via `getWordsData()` helper function ✅
- **Error handling**: Defensive programming with `Array.isArray()` checks and `String()` conversions ✅

## UX / accessibility notes

- **Error feedback timing**: 1200ms auto-clear is reasonable for "not in word list" - long enough to read, short enough to not block gameplay ✅
- **Screen reader support**: `aria-live="polite"` on status element ensures errors are announced ✅
- **Visual feedback**: Red text (`.status.error`) clearly indicates errors without being too harsh ✅

## Recommended follow-ups (not required for GAME-001 MVP)

- **Word list expansion**: Current lists are minimal placeholders - consider expanding to full Wordle-sized lists for production use
- **Performance monitoring**: With large word lists (10k+ words), ensure `rebuildValidSets()` doesn't block initial page load
- **Length validation message**: Plan mentioned optional "Not enough letters" message - could add if UX testing shows it's helpful
- **Testing coverage**: Manual verification checklist from plan covers the basics, but consider automated tests for edge cases (mixed case input, special characters, etc.)

## Verification checklist (from plan) ✅

- Typing non-word of correct length (e.g., "AAAAA") shows "Not in word list" and does **not** fill next row ✅
- Submitting valid word of correct length consumes exactly one row and updates keyboard colors ✅
- Submitting invalid word repeatedly does not clear current guess and does not advance turns ✅