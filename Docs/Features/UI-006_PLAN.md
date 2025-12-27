# UI-006 — Session Streak Counters (Technical Plan)

## Context / Goal
Implement **[UI-006] Session Streak Counters** from `Docs/Context/feature_map.md`. The goal is to add a session-based streak counter that displays consecutive wins for each word length (5-8 letters) on the side of the screen. Streaks increment on wins and reset to 0 on losses for the specific word length, providing visual feedback on player performance across different difficulty levels.

## Changes Required

### 1) Feature Map Update
Add `[UI-006] Session Streak Counters` to `[Docs/Context/feature_map.md](Docs/Context/feature_map.md)` in the "Deferred to post-MVP" section with acceptance criteria.

### 2) HTML Changes (`index.html`)
Add a container element for the streak display:
```html
<aside id="streaks-container" class="streaks-container" aria-label="Session streaks">
  <!-- To be populated by JS -->
</aside>
```

### 3) CSS Changes (`css/style.css`)
Add responsive styling for the streak container:
- Desktop: Fixed position on right side, vertical layout
- Mobile: Static position below game board, horizontal layout
- Style streak items with Wordle aesthetic (colors, borders, typography)
- Highlight current word length streak

### 4) JavaScript Changes (`js/game.js`)
Add streak tracking and rendering functionality:

- **State Object**: Add `streaks: { 5: 0, 6: 0, 7: 0, 8: 0 }` to track session streaks
- **Function**: `renderStreaks()` to create and update the UI elements
- **Function**: Update `submitGuess()` to modify streaks based on win/loss outcome
- **Initialization**: Call `renderStreaks()` during initial page load

## Step-by-step Algorithm (Streak Logic)
1. Initialize streak counters to 0 for all word lengths
2. When game ends with win: increment `state.streaks[state.wordLength]`
3. When game ends with loss: set `state.streaks[state.wordLength] = 0`
4. Render streak display showing all word lengths with current values
5. Highlight the current word length's streak item visually

## Step-by-step Algorithm (UI Rendering)
1. Create container element for each word length (5, 6, 7, 8)
2. For each container:
   - Display word length label ("5-letter", "6-letter", etc.)
   - Display current streak value
   - Add "current" class if this matches `state.wordLength`
3. Position containers vertically (desktop) or horizontally (mobile)
4. Update display whenever streaks change (after game end)

## Quick Verification Checklist
- [ ] Streak counters display for all word lengths (5-8)
- [ ] Current word length streak is visually highlighted
- [ ] Streaks increment on wins for that word length
- [ ] Streaks reset to 0 on losses for that word length
- [ ] Streaks persist during session but reset on page reload
- [ ] UI is responsive (desktop: right side, mobile: below board)