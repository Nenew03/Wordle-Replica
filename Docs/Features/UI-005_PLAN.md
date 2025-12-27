# UI-005 — Definition Hint After 4th Try (Technical Plan)

## Context / Goal
Implement **[UI-005] Definition Hint After 4th Try** from `Docs/Context/feature_map.md`. After the player's 4th failed guess, the game will automatically fetch and display the target word's definition as a hint. This adds an educational element and helps players who are stuck.

This feature depends on **[DATA-002] Dictionary API Integration** logic, which will be implemented as part of this feature.

## Changes Required

### 1) HTML: Hint Container (`index.html`)
Add a dedicated container for the hint below the status message.
- **Element**: `<div id="hint-container" class="hint-box" hidden aria-live="polite"></div>`
- **Location**: Inside `.status-wrap`, after `#status` and before `#play-again`.

### 2) CSS: Hint Styling (`css/style.css`)
Add styles for the hint box to make it visually distinct.
- **Class**: `.hint-box`
- **Properties**:
    - Background: Light gray or subtle highlight (e.g., `#f8f9fa`).
    - Border: 1px solid `--color-empty-border`.
    - Padding: 12px.
    - Font-size: 14px.
    - Max-width: Matches board width (520px).
    - Text alignment: Left or center.
    - Margin: 10px 0.

### 3) JavaScript: Dictionary API & Caching (`js/game.js`)
Implement the infrastructure for fetching definitions.
- **Constants**:
    - `DEFINITION_CACHE`: A `Map` to store fetched definitions to avoid redundant API calls.
- **Functions**:
    - `async fetchDefinition(word)`: 
        - Check `DEFINITION_CACHE` first.
        - Fetch from `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`.
        - Parse JSON: `data[0].meanings[0].definitions[0].definition`.
        - Handle errors (404, network) by returning a fallback message ("Definition unavailable").
        - Store result in cache.
    - `async showHint()`:
        - Call `fetchDefinition(state.targetWord)`.
        - Update `#hint-container` with "Hint: [definition]".
        - Remove `hidden` attribute from `#hint-container`.

### 4) JavaScript: Game Logic Integration (`js/game.js`)
Update the game loop to trigger the hint.
- **Function**: `submitGuess()`
    - After evaluation and win/lose check:
    - If `state.guesses.length === 4` AND `!state.won` AND `!state.gameOver`:
        - Call `showHint()`.
- **Function**: `newGame()`
    - Clear and hide `#hint-container`.

## Step-by-step Algorithm (Hint Flow)
1. Player submits their 4th incorrect guess.
2. `submitGuess()` processes the guess and updates `state.guesses`.
3. Logic checks if `state.guesses.length` is exactly 4 and the game is still active.
4. `showHint()` is triggered:
    a. It checks the local `DEFINITION_CACHE` for the `targetWord`.
    b. If not cached, it performs an `async fetch` to the Free Dictionary API.
    c. On success, it extracts the first definition string.
    d. The `#hint-container` is updated with the text and made visible to the player.
5. The hint remains visible until the game ends or a new game is started.
6. `newGame()` resets the UI by hiding the hint box.

## Quick Verification Checklist
- [ ] Fail 4 guesses in a 5-letter game; a hint box should appear with the definition.
- [ ] Verify the hint does NOT appear if the word is guessed correctly on the 4th try.
- [ ] Verify the hint box is hidden when "Play Again" is clicked.
- [ ] Test with a word that might not have a definition (fallback logic).
- [ ] Check mobile responsiveness of the hint box at 320px width.
