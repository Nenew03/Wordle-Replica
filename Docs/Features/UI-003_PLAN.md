# UI-003: Word Length Selector — Build Plan

## Description

A button group that lets the player choose between 5, 6, 7, or 8 letter words. Changing the selection immediately starts a new game with a word of that length. Default is 5 letters.

---

## Files to Create/Modify

| File | Action | What to Add |
|------|--------|-------------|
| `index.html` | Modify | Add button group markup above the game board |
| `style.css` | Modify | Add `.length-selector` and `.length-btn` styles |
| `game.js` | Modify | Add click handler, update `gameState.wordLength`, call `newGame()` |

---

## HTML Structure

Add a container with 4 buttons inside `.container`, positioned above the game board:

```
div.length-selector
├── button.length-btn[data-length="5"] "5"
├── button.length-btn[data-length="6"] "6"
├── button.length-btn[data-length="7"] "7"
└── button.length-btn[data-length="8"] "8"
```

- Use `data-length` attribute to store the value
- Add `.active` class to the currently selected button (default: 5)

---

## CSS Requirements

**`.length-selector`**
- Horizontal flex container with small gap
- Centered, with margin below it
- Sits above the game board

**`.length-btn`**
- Min-width 44px (touch target)
- Clear visual distinction between active/inactive states
- `.active` state: filled background matching game colors
- Inactive state: outlined/muted

---

## JavaScript Logic

**On page load:**
1. `gameState.wordLength` defaults to `5`
2. Add `.active` class to the 5-letter button

**On button click:**
1. Get `data-length` value from clicked button
2. If same as current length, do nothing (early return)
3. Update `gameState.wordLength` to new value
4. Update CSS custom property `--word-length` on `.board`
5. Move `.active` class to clicked button
6. Call `newGame()` to reset with new word length

**Event binding:**
- Use event delegation on `.length-selector` container
- Check `e.target.matches('.length-btn')` before processing

---

## Integration with Existing Code

**Depends on (must exist first):**
- `gameState` object with `wordLength` property
- `newGame()` function that reads `gameState.wordLength` to pick correct word list
- CSS custom property `--word-length` used in `.board` grid-template-columns

**Updates required to `newGame()`:**
- Must read `gameState.wordLength` when selecting random word
- Must update `--word-length` CSS variable when called

---

## Acceptance Checklist

- [ ] Four buttons (5, 6, 7, 8) visible at top of game
- [ ] Current selection has distinct `.active` style
- [ ] Clicking new length resets board and picks new word of that length
- [ ] Default is 5 on page load
- [ ] Buttons are large enough for mobile touch (min 44px)