# DATA-001 — Word Lists (Technical Plan)

## Context / Goal
Implement **[DATA-001] Word Lists** from `Docs/Context/feature_map.md`: **curated word lists for each word length (5, 6, 7, 8)** that **separate "answer" words (common, fair words) from "valid guesses" (includes obscure words)**, with **no offensive/inappropriate words in answer lists**, while keeping **total bundled data size reasonable (<500KB total)**.

## Current Implementation (Baseline)
- **Data location**: `js/words.js`
  - Defines `window.WORDS = { 5: { answers: string[], valid: string[] }, 6: ..., 7: ..., 8: ... }`
  - Words are mostly stored **uppercase**.
- **Consumption**: `index.html` loads `./js/words.js` before `./js/game.js`.
- **Runtime behavior**: `js/game.js`
  - `pickRandomTargetWord(length)` draws from `WORDS[len].answers`
  - `rebuildValidSets()` builds `VALID_SET_BY_LENGTH[len] = Set(answers ∪ valid)` (uppercased)
  - `submitGuess()` uses `isValidGuessWord()` and shows **"Not in word list"** when the guess is not in the set.
- **Existing validation helper**: `test_words.js` loads `js/words.js` in Node and prints counts.

## Gaps to Close (vs DATA-001 Acceptance Criteria)
- **Counts by length**: ensure answer list sizes land in the target ranges:
  - 5: ~500–2000, 6: ~500–1500, 7: ~500–1000, 8: ~500–1000
- **Valid list size**: ensure `valid` is **larger than `answers`** (so validation is meaningful).
- **Curation**:
  - Ensure **no offensive/inappropriate words appear in `answers`**.
  - Decide policy for `valid` (recommended: also filter obvious slurs/profanity, even if `valid` is broader).
- **Data hygiene**:
  - Normalize casing (uppercase only), trim whitespace
  - Ensure correct length for each bucket (5/6/7/8)
  - Ensure A–Z only (no punctuation/diacritics)
  - Deduplicate within each list
  - Enforce `answers ⊆ valid` for each length (even if runtime uses a union set today)

## Changes Required (Files / Functions)
### 1) Word data shape + content (primary)
- `js/words.js`
  - Keep the existing public contract: `window.WORDS[length].answers` and `.valid`
  - Update list contents to meet:
    - target answer counts per length
    - `valid` meaningfully larger than `answers`
    - offensive-word filtering (at minimum for `answers`)
    - normalization + dedupe + length correctness

### 2) Lightweight validation tooling (no dependencies)
- `test_words.js`
  - Extend checks beyond “it loads”:
    - verify keys `[5,6,7,8]` exist and have arrays
    - verify all words are uppercase A–Z and correct length
    - verify no duplicates (answers, valid)
    - verify `answers ⊆ valid`
    - verify answer counts are within the specified ranges
    - optional: verify file size budget (read file bytes and assert `< 500KB`)
    - optional: apply a simple profanity/blocklist check to `answers` (and optionally `valid`)

### 3) (Optional) Runtime guardrails (only if needed)
- `js/game.js`
  - If we decide DATA-001 must strictly enforce wordlist presence, adjust `isValidGuessWord()` fallback behavior (currently: if list missing/empty, it returns `true` to keep MVP playable).
  - Keep `window.WORDS` contract stable so other features (e.g. GAME-001 validation) don’t break.

## Data Sourcing + Build Workflow (Step-by-step)
1. **Choose source lists** for each length (5–8) from an open word list (public domain / permissive license).
2. **Split into two tiers** per length:
   - **answers**: common/fair words suitable as daily targets (curated)
   - **valid**: broader allowed-guess dictionary (superset; may include obscure words)
3. **Normalize** each word:
   - uppercase
   - strip whitespace
   - keep only `[A-Z]` characters
   - enforce exact word length (5/6/7/8)
4. **Filter**:
   - remove offensive/inappropriate terms from **answers** (required)
   - optionally filter `valid` for the most egregious terms (recommended)
5. **Deduplicate** and ensure **answers are included in valid**.
6. **Write into `js/words.js`** under `window.WORDS` without changing the structure.
7. **Run `node test_words.js`** to verify shape, hygiene, counts, and budget.

## Notes / Integration Considerations
- `js/game.js` currently uppercases at runtime, so storing uppercase in `js/words.js` is consistent and avoids subtle mismatches.
- Keeping the `window.WORDS` schema stable is important because `pickRandomTargetWord()` and `rebuildValidSets()` depend on it.
- Data size budget is currently generous for this architecture; Netlify will gzip assets, but we still should keep raw size under the `<500KB total` guideline for fast mobile loads.

