# Wordle — Feature Map

**Project:** Wordle
**Version:** 1.0
**Last Updated:** 2025-12-27
**Briefing Reference:** `docs/context/briefing_Wordle.md` (v1)

## Changelog
- **v1 (2025-12-27):** Initial feature breakdown

---

## Scope

This feature map covers: A complete, playable Wordle game as a static web app.

**Out of scope** (explicitly not building):
- User accounts / authentication
- Statistics tracking (games played, win streak, etc.)
- Share results functionality
- Hard mode
- Daily word sync (same word for all players)
- Dark mode / themes
- Backend / database

---

## MVP Scope

**P0 Features (must ship together):**
- [UI-001]: Game board grid
- [UI-002]: On-screen keyboard
- [UI-003]: Word length selector
- [GAME-001]: Word validation
- [GAME-002]: Letter feedback (colors)
- [GAME-003]: Win/lose detection
- [GAME-004]: New game functionality
- [DATA-001]: Word lists (5-8 letters)

**Deferred to post-MVP:**
- Animations/transitions (nice-to-have if time permits)
- Sound effects
- Install as PWA

**Estimated effort:** 1.5-2 hours

---

## Feature Inventory

### [UI-001] Game Board Grid

**Priority:** P0
**Status:** Not Started
**Dependencies:** None

**Description:**
Display a grid of letter tiles. Grid dimensions adapt to word length (5-8 columns) and always has 6 rows (guesses). Each tile shows a letter and background color based on feedback.

**Acceptance Criteria:**
- [ ] Grid displays correct number of columns based on selected word length
- [ ] Grid has 6 rows for guesses
- [ ] Empty tiles show as outlined boxes
- [ ] Filled tiles show the letter clearly
- [ ] Tiles are large enough to tap on mobile (min 44px)

**Technical Notes:**
CSS Grid. Use CSS custom properties for easy column adjustment.

---

### [UI-002] On-Screen Keyboard

**Priority:** P0
**Status:** Not Started
**Dependencies:** None

**Description:**
QWERTY keyboard layout displayed below the game board. Keys show color feedback matching the best result for each letter across all guesses. Includes Enter and Backspace keys.

**Acceptance Criteria:**
- [ ] Full QWERTY layout rendered
- [ ] Enter key submits current guess
- [ ] Backspace key deletes last letter
- [ ] Keys update color based on letter feedback (green > yellow > gray)
- [ ] Keys are large enough for mobile touch (min 32px height)
- [ ] Physical keyboard input also works (for desktop)

**Technical Notes:**
Event listeners for both click and keydown. Track "best" color per letter in a Map.

---

### [UI-003] Word Length Selector

**Priority:** P0
**Status:** Not Started
**Dependencies:** [GAME-004]

**Description:**
Simple selector (buttons or dropdown) to choose between 5, 6, 7, or 8 letter words. Changing length starts a new game.

**Acceptance Criteria:**
- [ ] Options for 5, 6, 7, 8 clearly visible
- [ ] Current selection is visually indicated
- [ ] Changing selection resets the game with new word of that length
- [ ] Default is 5 letters

**Technical Notes:**
Simple button group. Store current length in a variable. Trigger newGame() on change.

---

### [GAME-001] Word Validation

**Priority:** P0
**Status:** Not Started
**Dependencies:** [DATA-001]

**Description:**
When player submits a guess, validate that it's a real word from the word list. Reject invalid words with feedback.

**Acceptance Criteria:**
- [ ] Guess must be correct length (matches selected word length)
- [ ] Guess must exist in the valid words list
- [ ] Invalid guess shows brief error message (e.g., "Not in word list")
- [ ] Invalid guess does NOT consume a turn

**Technical Notes:**
Use a Set for O(1) lookup. Word lists include both "answer" words and "valid guess" words.

---

### [GAME-002] Letter Feedback (Colors)

**Priority:** P0
**Status:** Not Started
**Dependencies:** [GAME-001]

**Description:**
After valid guess, color each letter tile:
- 🟩 Green: Letter is correct and in correct position
- 🟨 Yellow: Letter is in word but wrong position
- ⬛ Gray: Letter is not in word

**Acceptance Criteria:**
- [ ] Green for exact position match
- [ ] Yellow for letter exists but wrong position
- [ ] Gray for letter not in word
- [ ] Handle duplicate letters correctly (e.g., if word is "APPLE" and guess is "PAPER")
- [ ] Colors are accessible (sufficient contrast)

**Technical Notes:**
Algorithm must handle duplicates: process greens first, then yellows with remaining letter count. Use CSS classes: `.correct`, `.present`, `.absent`.

---

### [GAME-003] Win/Lose Detection

**Priority:** P0
**Status:** Implemented
**Dependencies:** [GAME-002]

**Description:**
Detect when game ends. Win: all letters green. Lose: 6 guesses used without winning.

**Acceptance Criteria:**
- [ ] Win detected when guess matches target word exactly
- [ ] Win shows congratulations message
- [ ] Lose detected after 6th incorrect guess
- [ ] Lose reveals the correct word
- [ ] "Play Again" button appears on game end

**Technical Notes:**
Simple string comparison for win. Counter for guess count.

---

### [GAME-004] New Game Functionality

**Priority:** P0
**Status:** Implemented
**Dependencies:** [DATA-001]

**Description:**
Start a fresh game with a randomly selected word from the appropriate word list.

**Acceptance Criteria:**
- [ ] Clears the game board
- [ ] Resets keyboard colors
- [ ] Selects new random word of current length
- [ ] Resets guess counter

**Technical Notes:**
`Math.random()` to pick from word list. Encapsulate all game state in reset function.

---

### [DATA-001] Word Lists

**Priority:** P0
**Status:** Implemented
**Dependencies:** None

**Description:**
Curated word lists for each word length (5, 6, 7, 8). Separate "answer" words (common, fair words) from "valid guesses" (includes obscure words).

**Acceptance Criteria:**
- [ ] 5-letter answer words: ~500-2000 words
- [ ] 6-letter answer words: ~500-1500 words
- [ ] 7-letter answer words: ~500-1000 words
- [ ] 8-letter answer words: ~500-1000 words
- [ ] Valid guess lists are larger (for validation)
- [ ] No offensive/inappropriate words in answer lists

**Technical Notes:**
Can source from open word lists online. Bundle as JS arrays/objects. Keep file size reasonable (<500KB total).

---

## Feature ID Convention

```
UI-001       User interface components
GAME-001     Core game logic
DATA-001     Data/content
INFRA-001    Deployment/infrastructure (not needed for MVP)
```

---

## Out of Scope

Explicit list of what's NOT in this feature map:
- Backend server
- Database
- User authentication
- Statistics/score tracking
- Social sharing
- PWA/offline support
- Multiple themes
- Animations (stretch goal only)
