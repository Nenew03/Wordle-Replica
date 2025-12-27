# Wordle — Feature Map

**Project:** Wordle
**Version:** 2.0
**Last Updated:** 2025-12-28
**Briefing Reference:** `Docs/Context/briefing.md` (v2)

## Changelog
- **v4 (2025-12-28):** Implemented UI-006 (session streak counters) - displays win streaks for each word length on the side of the screen
- **v3 (2025-12-28):** Implemented GAME-007 (basic pattern validation) - adds lightweight validation to prevent obvious non-word entries while maintaining relaxed gameplay
- **v2 (2025-12-28):** Added BUG-001 (responsive layout fix), GAME-005 (relaxed validation), GAME-006 (dynamic max tries), UI-004 (definitions on game end), UI-005 (hint after 4th try), DATA-002 (dictionary API integration)
- **v1 (2025-12-27):** Initial feature breakdown

---

## Scope

This feature map covers: A complete, playable Wordle game as a static web app with educational word definitions.

**Out of scope** (explicitly not building):
- User accounts / authentication
- Statistics tracking (games played, win streak, etc.)
- Share results functionality
- Hard mode
- Daily word sync (same word for all players)
- Dark mode / themes
- Backend / database (except external dictionary API calls)

---

## MVP Scope

**P0 Features (must ship together):**
- [UI-001]: Game board grid ✓ Complete
- [UI-002]: On-screen keyboard ✓ Complete
- [UI-003]: Word length selector ✓ Complete
- [GAME-001]: Word validation ✓ Complete
- [GAME-002]: Letter feedback (colors) ✓ Complete
- [GAME-003]: Win/lose detection ✓ Complete
- [GAME-004]: New game functionality ✓ Complete
- [DATA-001]: Word lists (5-8 letters) ✓ Complete

**P1 Features (V2 enhancements):**
- [BUG-001]: Fix responsive layout for 7-8 letter words ✓ Complete
- [GAME-005]: Relaxed word validation (accept all inputs) ✓ Complete
- [GAME-006]: Dynamic max tries based on word length ✓ Complete
- [UI-004]: Word definition & example on game end ✓ Complete
- [UI-005]: Definition hint after 4th try ✓ Complete
- [DATA-002]: Dictionary API integration ✓ Complete

**Deferred to post-MVP:**
- [GAME-007]: Basic pattern validation (prevent obvious non-words) ✓ Complete
- [UI-006]: Session streak counters (by word length) ✓ Complete (reviewed)
- Animations/transitions (nice-to-have if time permits)
- Sound effects
- Install as PWA
- Dark mode
- Statistics

**Estimated effort:** 2-3 hours for v2 features

---

## Feature Inventory

### [UI-001] Game Board Grid

**Priority:** P0
**Status:** Complete
**Dependencies:** None

**Description:**
Display a grid of letter tiles. Grid dimensions adapt to word length (5-8 columns) and has 6 rows initially (now dynamic with GAME-006). Each tile shows a letter and background color based on feedback.

**Acceptance Criteria:**
- [x] Grid displays correct number of columns based on selected word length
- [x] Grid has 6 rows for guesses (now dynamic)
- [x] Empty tiles show as outlined boxes
- [x] Filled tiles show the letter clearly
- [x] Tiles are large enough to tap on mobile (min 44px)

**Technical Notes:**
CSS Grid. Use CSS custom properties for easy column adjustment.

---

### [UI-002] On-Screen Keyboard

**Priority:** P0
**Status:** Complete
**Dependencies:** None

**Description:**
QWERTY keyboard layout displayed below the game board. Keys show color feedback matching the best result for each letter across all guesses. Includes Enter and Backspace keys.

**Acceptance Criteria:**
- [x] Full QWERTY layout rendered
- [x] Enter key submits current guess
- [x] Backspace key deletes last letter
- [x] Keys update color based on letter feedback (green > yellow > gray)
- [x] Keys are large enough for mobile touch (min 32px height)
- [x] Physical keyboard input also works (for desktop)

**Technical Notes:**
Event listeners for both click and keydown. Track "best" color per letter in a Map.

---

### [UI-003] Word Length Selector

**Priority:** P0
**Status:** Complete
**Dependencies:** [GAME-004]

**Description:**
Simple selector (buttons or dropdown) to choose between 5, 6, 7, or 8 letter words. Changing length starts a new game.

**Acceptance Criteria:**
- [x] Options for 5, 6, 7, 8 clearly visible
- [x] Current selection is visually indicated
- [x] Changing selection resets the game with new word of that length
- [x] Default is 5 letters

**Technical Notes:**
Simple button group. Store current length in a variable. Trigger newGame() on change.

---

### [GAME-001] Word Validation

**Priority:** P0
**Status:** Complete
**Dependencies:** [DATA-001]

**Description:**
When player submits a guess, validate that it's a real word from the word list. Reject invalid words with feedback.

**Acceptance Criteria:**
- [x] Guess must be correct length (matches selected word length)
- [x] Guess must exist in the valid words list
- [x] Invalid guess shows brief error message (e.g., "Not in word list")
- [x] Invalid guess does NOT consume a turn

**Technical Notes:**
Use a Set for O(1) lookup. Word lists include both "answer" words and "valid guess" words.

**Note:** Being relaxed/removed in [GAME-005].

---

### [GAME-002] Letter Feedback (Colors)

**Priority:** P0
**Status:** Complete
**Dependencies:** [GAME-001]

**Description:**
After valid guess, color each letter tile:
- 🟩 Green: Letter is correct and in correct position
- 🟨 Yellow: Letter is in word but wrong position
- ⬛ Gray: Letter is not in word

**Acceptance Criteria:**
- [x] Green for exact position match
- [x] Yellow for letter exists but wrong position
- [x] Gray for letter not in word
- [x] Handle duplicate letters correctly (e.g., if word is "APPLE" and guess is "PAPER")
- [x] Colors are accessible (sufficient contrast)

**Technical Notes:**
Algorithm must handle duplicates: process greens first, then yellows with remaining letter count. Use CSS classes: `.correct`, `.present`, `.absent`.

---

### [GAME-003] Win/Lose Detection

**Priority:** P0
**Status:** Complete
**Dependencies:** [GAME-002]

**Description:**
Detect when game ends. Win: all letters green. Lose: max guesses used without winning.

**Acceptance Criteria:**
- [x] Win detected when guess matches target word exactly
- [x] Win shows congratulations message
- [x] Lose detected after max incorrect guesses
- [x] Lose reveals the correct word
- [x] "Play Again" button appears on game end

**Technical Notes:**
Simple string comparison for win. Counter for guess count.

**Note:** Max guesses now dynamic per [GAME-006].

---

### [GAME-004] New Game Functionality

**Priority:** P0
**Status:** Complete
**Dependencies:** [DATA-001]

**Description:**
Start a fresh game with a randomly selected word from the appropriate word list.

**Acceptance Criteria:**
- [x] Clears the game board
- [x] Resets keyboard colors
- [x] Selects new random word of current length
- [x] Resets guess counter

**Technical Notes:**
`Math.random()` to pick from word list. Encapsulate all game state in reset function.

---

### [DATA-001] Word Lists

**Priority:** P0
**Status:** Complete
**Dependencies:** None

**Description:**
Curated word lists for each word length (5, 6, 7, 8). Separate "answer" words (common, fair words) from "valid guesses" (includes obscure words).

**Acceptance Criteria:**
- [x] 5-letter answer words: ~500-2000 words
- [x] 6-letter answer words: ~500-1500 words
- [x] 7-letter answer words: ~500-1000 words
- [x] 8-letter answer words: ~500-1000 words
- [x] Valid guess lists are larger (for validation)
- [x] No offensive/inappropriate words in answer lists

**Technical Notes:**
Can source from open word lists online. Bundle as JS arrays/objects. Keep file size reasonable (<500KB total).

---

### [BUG-001] Fix Responsive Layout for 7-8 Letter Words

**Priority:** P1
**Status:** Complete
**Dependencies:** [UI-001]

**Description:**
7 and 8 letter words currently stretch beyond the screen width on mobile devices. The tile sizing calculation needs adjustment to ensure all tiles fit within the viewport.

**Acceptance Criteria:**
- [ ] 7-letter game board fits on screen without horizontal scroll
- [ ] 8-letter game board fits on screen without horizontal scroll
- [ ] Tiles remain readable (minimum font size maintained)
- [ ] Layout works on devices as narrow as 320px width
- [ ] Tiles maintain 44px minimum touch target where possible

**Technical Notes:**
Adjust `--tile-size` CSS calculation in `:root`. Current formula: `clamp(44px, calc((100vw - 48px) / var(--word-length)), 62px)` may need smaller minimum or adjusted padding. Consider reducing gap size for longer words.

---

### [GAME-005] Relaxed Word Validation

**Priority:** P1
**Status:** Complete
**Dependencies:** [GAME-001]

**Description:**
Remove strict word validation to improve playability. Players can try any letter combination of the correct length. This makes the game more experimental and fun, especially for longer words with limited vocabulary.

**Acceptance Criteria:**
- [ ] Any combination of letters (correct length) is accepted as a guess
- [ ] No "Not in word list" error messages
- [ ] Guesses still consume a turn (same evaluation logic)
- [ ] Target word selection still uses curated answer list

**Technical Notes:**
Modify `isValidGuessWord()` to return `true` unconditionally, or remove validation check entirely from `submitGuess()`. Keep word lists for answer selection only.

---

### [GAME-006] Dynamic Max Tries Based on Word Length

**Priority:** P1
**Status:** Complete
**Dependencies:** [GAME-003], [UI-001]

**Description:**
Adjust maximum allowed guesses based on word length for fairer difficulty scaling:
- 5-letter words: 6 tries (current default)
- 6-letter words: 6 tries
- 7-letter words: 7 tries
- 8-letter words: 8 tries

**Acceptance Criteria:**
- [ ] 5-letter games allow 6 guesses maximum
- [ ] 6-letter games allow 6 guesses maximum
- [ ] 7-letter games allow 7 guesses maximum
- [ ] 8-letter games allow 8 guesses maximum
- [ ] Game board renders correct number of rows for current word length
- [ ] Win/lose detection uses dynamic max value

**Technical Notes:**
Add function `getMaxTries(wordLength)` that returns appropriate value. Update `renderBoard()` to use dynamic row count instead of hardcoded 6. Update `submitGuess()` and lose condition to check against dynamic max.

**Formula:** `maxTries = wordLength <= 6 ? 6 : wordLength`

---

### [UI-004] Word Definition & Example on Game End

**Priority:** P1
**Status:** Complete
**Dependencies:** [GAME-003], [DATA-002]

**Description:**
When game ends (win or lose), display the word's definition and an example sentence using the word. Show this information prominently before the "Play Again" button, adding educational value.

**Acceptance Criteria:**
- [ ] Definition appears on win screen
- [ ] Definition appears on lose screen
- [ ] Example sentence shown below definition
- [ ] Content is readable and well-formatted
- [ ] "Play Again" button appears below definition content
- [ ] Handles missing definitions gracefully (fallback message)

**Technical Notes:**
Fetch from Free Dictionary API: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`. Parse response for first definition and first example. Display in dedicated section between status message and "Play Again" button. Cache result to avoid duplicate fetches.

---

### [UI-005] Definition Hint After 4th Try

**Priority:** P1
**Status:** Complete
**Dependencies:** [GAME-003], [DATA-002]

**Description:**
After the player's 4th failed guess, automatically display the word's definition as a hint to help them solve the puzzle. This provides assistance while maintaining challenge.

**Acceptance Criteria:**
- [ ] Hint appears automatically after 4th incorrect guess is submitted
- [ ] Hint shows word definition (not the word itself)
- [ ] Hint is visually distinct (e.g., styled hint box)
- [ ] Hint persists until game ends
- [ ] Hint does not appear on win (if player wins on 4th or earlier guess)

**Technical Notes:**
Trigger after `state.guesses.length === 4` and game not won. Fetch definition from same API as UI-004 (can share fetch/cache logic). Display in status area or dedicated hint section. Mark hint as shown to prevent duplicate displays.

---

### [DATA-002] Dictionary API Integration

**Priority:** P1
**Status:** Complete
**Dependencies:** None

**Description:**
Integrate with Free Dictionary API to fetch word definitions and example sentences. Used by [UI-004] and [UI-005].

**Acceptance Criteria:**
- [ ] Can fetch definition for any English word
- [ ] Handles API errors gracefully (network issues, word not found)
- [ ] Caches definitions to minimize API calls
- [ ] No API key required (using free tier)
- [ ] Parses response to extract definition and example

**Technical Notes:**
API endpoint: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` (returns JSON).
Response structure: `[{ meanings: [{ definitions: [{ definition: "", example: "" }] }] }]`.
Implement `fetchDefinition(word)` function. Use simple Map cache: `definitionCache.set(word, data)`. Handle 404 (word not found) with fallback message.

---

### [GAME-007] Basic Pattern Validation

**Priority:** Post-MVP
**Status:** Planned
**Dependencies:** [GAME-005]

**Description:**
Add basic pattern validation to prevent obviously invalid letter combinations while maintaining relaxed validation for creative experimentation. Reject guesses that lack vowels, have excessive consecutive consonants, or follow other unlikely English patterns.

**Acceptance Criteria:**
- [ ] Reject words with no vowels (too obvious)
- [ ] Reject words with 3+ consecutive consonants (unlikely in English)
- [ ] Reject words with 4+ consecutive vowels (very rare)
- [ ] Show user-friendly error message for invalid patterns
- [ ] Invalid guesses do NOT consume a turn
- [ ] Validation is balanced to allow creative but reasonable experimentation

**Technical Notes:**
Add `isReasonableGuess(guess)` function with pattern checks. Integrate into `submitGuess()` before evaluation. Keep validation lightweight to maintain fast feedback.

---

### [UI-006] Session Streak Counters

**Priority:** Post-MVP
**Status:** Planned
**Dependencies:** [GAME-003]

**Description:**
Display session-based streak counters for each word length (5-8 letters) on the side of the screen. Show current winning streaks that reset to 0 when a loss occurs for that specific word length.

**Acceptance Criteria:**
- [ ] Streak counters display for all word lengths (5-8)
- [ ] Current word length streak is visually highlighted
- [ ] Streaks increment on wins for that word length
- [ ] Streaks reset to 0 on losses for that word length
- [ ] Streaks persist during the session but reset on page reload
- [ ] Clean, unobtrusive UI that doesn't interfere with gameplay

**Technical Notes:**
Add `streaks` object to game state. Update streaks in `submitGuess()` based on win/loss outcome. Render streaks in a fixed-position container using `renderStreaks()` function.

---

## Feature ID Convention

```
UI-001       User interface components
GAME-001     Core game logic
DATA-001     Data/content
BUG-001      Bug fixes
INFRA-001    Deployment/infrastructure (not needed for MVP)
```

---

## Out of Scope

Explicit list of what's NOT in this feature map:
- Backend server (except external API calls)
- Database
- User authentication
- Statistics/score tracking
- Social sharing
- PWA/offline support
- Multiple themes
- Animations (stretch goal only)
- Custom word lists (user-provided)