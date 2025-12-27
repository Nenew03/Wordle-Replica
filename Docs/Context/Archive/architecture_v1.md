# Wordle — Technical Architecture

**Project:** Wordle
**Version:** 1.0
**Last Updated:** 2025-12-27
**Briefing Reference:** `docs/context/briefing_Wordle.md` (v1)
**Feature Map Reference:** `docs/context/feature_map_Wordle.md` (v1)

## Changelog
- **v1 (2025-12-27):** Initial architecture

---

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Vanilla HTML/CSS/JS | No build step, beginner-friendly, fast |
| Styling | CSS3 (Flexbox/Grid) | Mobile-first responsive layout |
| Data | Static JS arrays | Word lists bundled in code |
| Hosting | Netlify | Free static hosting with drag-drop deploy |

**Why this stack:**
- Zero dependencies = nothing to install, update, or break
- No build step = edit files and refresh browser
- Single HTML file possible = simplest possible deployment
- Works offline once loaded

---

## Project Structure

```
wordle/
├── index.html          # Main (and only) HTML file
├── css/
│   └── style.css       # All styles
├── js/
│   ├── words.js        # Word lists for all lengths
│   └── game.js         # Game logic
└── netlify.toml        # (Optional) Netlify config
```

**Alternative: Single file approach**
For maximum simplicity, everything can be in `index.html`:
```
wordle/
└── index.html          # HTML + <style> + <script> all-in-one
```

---

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  Word Length    │  │        Game Board           │  │
│  │  Selector       │  │  ┌───┬───┬───┬───┬───┐     │  │
│  │  [5][6][7][8]   │  │  │   │   │   │   │   │ x6  │  │
│  └────────┬────────┘  │  └───┴───┴───┴───┴───┘     │  │
│           │           └─────────────────────────────┘  │
│           │                        ▲                    │
│           ▼                        │ updateBoard()      │
│  ┌─────────────────────────────────┴───────────────┐   │
│  │                  Game State                      │   │
│  │  - targetWord: string                           │   │
│  │  - guesses: string[]                            │   │
│  │  - currentGuess: string                         │   │
│  │  - gameOver: boolean                            │   │
│  │  - wordLength: number (5-8)                     │   │
│  └─────────────────────────────────┬───────────────┘   │
│                                    │                    │
│           ┌────────────────────────┘                   │
│           ▼                                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │              On-Screen Keyboard                  │   │
│  │  Q W E R T Y U I O P                            │   │
│  │   A S D F G H J K L                             │   │
│  │    Z X C V B N M  ⌫                             │   │
│  │        [ ENTER ]                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                │
│                        ▼                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Word Lists (words.js)               │   │
│  │  WORDS_5, WORDS_6, WORDS_7, WORDS_8             │   │
│  │  VALID_5, VALID_6, VALID_7, VALID_8             │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Data Model

### Game State (in-memory only)

```javascript
const gameState = {
  wordLength: 5,           // Current word length (5-8)
  targetWord: "CRANE",     // Word to guess (uppercase)
  guesses: [],             // Array of submitted guesses
  currentGuess: "",        // Current typing buffer
  gameOver: false,         // Is game ended?
  won: false,              // Did player win?
  letterStatus: {}         // Map of letter -> best color status
};
```

### Word Lists Structure

```javascript
// words.js
const WORDS = {
  5: {
    answers: ["crane", "slate", ...],   // ~500-2000 common words
    valid: ["aahed", "aalii", ...]       // ~10000 valid guesses
  },
  6: {
    answers: [...],
    valid: [...]
  },
  // ... 7 and 8
};
```

---

## Core Algorithm: Letter Feedback

This is the trickiest part—handling duplicate letters correctly.

```javascript
function evaluateGuess(guess, target) {
  // Returns array of: 'correct' | 'present' | 'absent'
  const result = Array(guess.length).fill('absent');
  const targetLetters = [...target];
  
  // First pass: mark correct (green)
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'correct';
      targetLetters[i] = null; // Mark as used
    }
  }
  
  // Second pass: mark present (yellow)
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    
    const idx = targetLetters.indexOf(guess[i]);
    if (idx !== -1) {
      result[i] = 'present';
      targetLetters[idx] = null; // Mark as used
    }
  }
  
  return result;
}
```

**Example:**
- Target: "APPLE"
- Guess: "PAPER"
- Result: [present, present, present, absent, absent]
  - P(0): not position 0, but exists → yellow
  - A(1): not position 1, but exists → yellow  
  - P(2): not position 2, exists (second P) → yellow
  - E(3): not position 3, only one E and it's at 4 → gray
  - R(4): doesn't exist → gray

---

## UI Layout (Mobile-First)

```css
/* Key measurements for mobile */
:root {
  --tile-size: min(62px, (100vw - 50px) / 8);  /* Scales with word length */
  --key-height: 58px;
  --gap: 5px;
}

/* Stack vertically on mobile */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 10px;
}

/* Board uses CSS Grid */
.board {
  display: grid;
  grid-template-columns: repeat(var(--word-length), var(--tile-size));
  grid-template-rows: repeat(6, var(--tile-size));
  gap: var(--gap);
}

/* Keyboard rows */
.keyboard {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 500px;
}
```

---

## Color Scheme

```css
:root {
  /* Tile colors */
  --color-correct: #6aaa64;    /* Green */
  --color-present: #c9b458;    /* Yellow */
  --color-absent: #787c7e;     /* Gray */
  --color-empty: #d3d6da;      /* Empty tile border */
  
  /* Text */
  --color-text: #1a1a1b;
  --color-text-light: #ffffff;
  
  /* Background */
  --color-bg: #ffffff;
}
```

---

## Event Handling

```javascript
// Physical keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitGuess();
  else if (e.key === 'Backspace') deleteLetter();
  else if (/^[a-zA-Z]$/.test(e.key)) addLetter(e.key);
});

// On-screen keyboard (event delegation)
keyboard.addEventListener('click', (e) => {
  const key = e.target.dataset.key;
  if (!key) return;
  
  if (key === 'enter') submitGuess();
  else if (key === 'backspace') deleteLetter();
  else addLetter(key);
});
```

---

## Deployment (Netlify)

### Option 1: Drag & Drop (Fastest)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag your project folder onto the page
3. Done! Get your URL

### Option 2: GitHub Integration
1. Push code to GitHub
2. Connect repo in Netlify dashboard
3. Auto-deploys on every push

### Optional: netlify.toml
```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

---

## File Size Budget

| File | Target Size | Notes |
|------|-------------|-------|
| index.html | <5 KB | Minimal markup |
| style.css | <10 KB | Mobile-first, no framework |
| game.js | <10 KB | Core logic |
| words.js | <400 KB | All word lists |
| **Total** | <425 KB | Fast load on mobile |

---

## Technical Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Word lists too large | Low | Medium | Use gzip (Netlify auto-compresses); lazy-load if needed |
| Duplicate letter logic wrong | Medium | High | Write unit tests for edge cases; test with APPLE/PAPER |
| Touch targets too small | Medium | Medium | Use min 44px for tiles, 32px+ for keys |
| Keyboard covers game on mobile | Medium | Low | Test on real device; use viewport-fit |

---

## What's NOT in This Architecture

Handled by external systems or deferred:
- **Backend server:** Not needed — fully client-side
- **Database:** Not needed — no persistence
- **Authentication:** Not needed — no users
- **Analytics:** Could add Netlify Analytics later (free tier)
- **PWA/Service Worker:** Deferred — not MVP
