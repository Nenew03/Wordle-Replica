# UI-004 — Word Definition & Example on Game End (Technical Plan)

## Context / Goal
Implement **[UI-004] Word Definition & Example on Game End** from `Docs/Context/feature_map.md`. When the game ends (win or lose), display the word's definition and an example sentence using the word prominently before the "Play Again" button. This adds educational value and provides closure to the game.

This feature depends on **[DATA-002] Dictionary API Integration**.

## Changes Required

### 1) HTML: Definition Container (`index.html`)
Add a dedicated container for the word definition and example within the `.status-wrap` section.

- **Element**: `<div id="details-container" class="details-box" hidden aria-live="polite"></div>`
- **Location**: Inside `.status-wrap`, specifically between `#status` (or `#hint-container`) and `#play-again`.

### 2) CSS: Styling (`css/style.css`)
Add styles for the new details box to match the existing `hint-box` aesthetic but with clear distinction for definition and example.

- **Class**: `.details-box`
- **Styling**:
    - Similar to `.hint-box` (background, border, padding, border-radius).
    - Add styles for `.details-word` (uppercase, bold).
    - Add styles for `.details-definition` (standard body text).
    - Add styles for `.details-example` (italic, slightly smaller/lighter, prefixed with "Example:").

### 3) JavaScript: API & Cache (`js/game.js`)
Update the existing dictionary integration to fetch both definition and example.

- **Function**: `fetchDefinition(word)`
    - Update to return an object: `{ definition: string, example: string | null }`.
    - Update `DEFINITION_CACHE` to store these objects instead of just strings.
    - Update the fetch logic to extract the first available `definition` and `example` from the API response: `data[0]?.meanings[0]?.definitions[0]`.

### 4) JavaScript: Game End Logic (`js/game.js`)
Create a function to display the end-game details and integrate it into the submission flow.

- **Function**: `showGameEndDetails(word)`
    - Call `fetchDefinition(word)`.
    - Populate `#details-container` with formatted HTML (Word, Definition, and Example if available).
    - Set `hidden = false` for the container.
- **Function**: `submitGuess()`
    - Update win condition: After `setStatus("You win!", ...)` and before showing the play-again button, call `showGameEndDetails(state.targetWord)`.
    - Update lose condition: After `setStatus("You lose...", ...)` and before showing the play-again button, call `showGameEndDetails(state.targetWord)`.
- **Function**: `newGame()`
    - Add logic to hide and clear `#details-container`.
- **Function**: `showHint()`
    - Update to handle the new return type of `fetchDefinition`.

## Step-by-step Algorithm (Game End Flow)
1. Player submits the final guess or the winning guess.
2. `submitGuess()` identifies `state.gameOver = true`.
3. `setStatus()` is called to show the result message.
4. `showGameEndDetails(state.targetWord)` is called:
    a. `fetchDefinition` checks cache or makes API call.
    b. API response is parsed for `definition` and `example`.
    c. HTML is generated (e.g., `<strong>WORD</strong>: definition. <em>"Example..."</em>`).
    d. `#details-container` is updated and made visible.
5. `#play-again` button is made visible.

## Quick Verification Checklist
- [ ] Win a game: Definition and example appear before "Play Again" button.
- [ ] Lose a game: Definition and example appear before "Play Again" button.
- [ ] Verify content: Ensure both definition and example (if available) are shown.
- [ ] Graceful fallback: If API fails or word not found, show "Definition unavailable."
- [ ] Reset: Starting a new game hides the details box.
