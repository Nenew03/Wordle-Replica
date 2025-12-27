# DATA-001 — Word Lists (Code Review)

## Summary
DATA-001 is **implemented end-to-end**:
- `js/words.js` defines `window.WORDS` with `{ answers, valid }` buckets for lengths **5–8**.
- `index.html` loads `js/words.js` before `js/game.js` (both `defer`).
- `js/game.js` consumes `window.WORDS[len].answers` for targets and builds `VALID_SET_BY_LENGTH[len] = Set(answers ∪ valid)` for O(1) validation.
- `test_words.js` loads `js/words.js` in Node (via `vm`) and checks schema + basic constraints, and currently **passes**.

## Plan Implementation Check (vs `Docs/Features/DATA-001_PLAN.md`)
- **Schema contract (`window.WORDS[length].answers/.valid`)**: ✅ matches.
- **Runtime selection uses `answers`**: ✅ (`pickRandomTargetWord()`).
- **Validation uses union Set**: ✅ (`rebuildValidSets()` + `isValidGuessWord()`).
- **Node validation script**: ✅ present and runnable.
- **Data size budget (<500KB)**: ✅ currently enforced by `test_words.js` and passing.

## High-Impact Issues / Gaps
### 1) Curation requirement not met for `valid` (and not enforced for `answers`)
The DATA-001 acceptance criteria requires **no offensive/inappropriate words in `answers`**, and the plan recommends filtering egregious terms in `valid` too.

- **What I verified (sanitized runtime lists)**:
  - 5-letter `valid` still contains: `BITCH`, `PENIS`, `PORNO`, `PRICK`, `WHORE`, `JIHAD`
  - 7-letter `valid` still contains: `ASSHOLE`
  - (I did *not* find these terms in `answers`, but there is no general profanity/slur filtering in place.)

**Impact**: Players can submit/see inappropriate guesses as “valid”, and without stronger checks you may accidentally ship inappropriate *answers* if they enter the `answers` lists later.

**Recommendation**:
- Add a small **blocklist check** in `test_words.js` for **answers** (required) and optionally for **valid** (recommended).
- Remove/replace those words from the source lists in `js/words.js` (preferred), or add a runtime filter step (less ideal but quick).

### 2) `js/words.js` relies on a runtime “hygiene pass” to correct many bad entries
`js/words.js` includes an IIFE that:
- uppercases + trims
- filters wrong-length / non `[A-Z]`
- dedupes
- forces `answers ⊆ valid`

This makes the runtime data “look clean” (and makes tests pass), but it also means the raw data file contains many invalid entries that are silently dropped.

**Impact**:
- Hard to maintain: future edits may silently do nothing (word gets filtered).
- Hard to review: human readers can’t trust the literal list contents.
- Wasted bytes: invalid entries still ship over the wire even if dropped at runtime.

**Recommendation**:
- Prefer keeping `js/words.js` **already clean** (uppercase, correct length, deduped) so the hygiene pass becomes a small safety net (or can be removed).
- If you keep the hygiene pass, consider adding a lightweight **dev-only warning** (or `test_words.js` check) that asserts “filtered count is ~0” so you don’t silently regress.

## Medium/Low Impact Notes
### 1) Validation fallback in `game.js`
If the valid set is missing/empty, `isValidGuessWord()` returns `true` to keep the game playable.

This is reasonable for early MVPs, but once DATA-001 is “done” you may want to fail closed (invalid unless in list), or at least surface a clear developer-facing error if `window.WORDS` didn’t load.

### 2) Style / maintainability (functional preference)
Most logic is clean and small, but the codebase is still fairly stateful/imperative (expected for vanilla JS).
The main “functional” wins are already present:
- `evaluateGuess()` is effectively pure.
- `normalizeList()` is pure and easy to test.

If you want to align more with “functional style”, the main improvement would be to keep `js/words.js` as “data-only” and move hygiene/normalization into `test_words.js` (and/or a one-off script you run manually) so runtime has fewer side effects.

## Evidence (key code locations)
Runtime hygiene pass in `js/words.js`:
- Normalization + filtering + dedupe + `answers ⊆ valid`

Validation script in `test_words.js`:
- Size budget, schema, counts, uppercase A–Z, length correctness, dedupe, `answers ⊆ valid`

## Recommended Next Actions (priority order)
1. **Blocklist enforcement (required)**: add a small banned-word list check for `answers` in `test_words.js`; optionally apply it to `valid` too.
2. **Remove the known inappropriate terms from `valid`** (at minimum the ones confirmed above).
3. **Clean the source lists** so the hygiene pass filters near-zero entries (or add a test that fails if too many entries get filtered).

