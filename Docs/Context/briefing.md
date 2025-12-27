# Wordle — Product Briefing

**Project:** Wordle
**Version:** 2.0
**Last Updated:** 2025-12-28
**Status:** Active

## Changelog
- **v2 (2025-12-28):** Added word definitions feature, dynamic max tries based on word length, relaxed word validation, and responsive layout fix for 7-8 letter words
- **v1 (2025-12-27):** Initial spec

---

## What I'm Building
A mobile-first Wordle clone with infinite play mode. Players guess words of configurable length (5-8 letters) with color-coded feedback. Features include word definitions as hints and on completion, with adaptive difficulty based on word length. No daily limits, no accounts, no score tracking—just pure word-guessing fun with educational value.

## Who It's For
Me (and anyone I share the link with) who wants to play unlimited Wordle on their phone without waiting for a new daily puzzle, while learning word meanings.

## What "Done" Looks Like
- [x] Can play a complete game of Wordle on mobile
- [x] Can select word length (5, 6, 7, or 8 letters)
- [x] Can start a new game with a fresh word after each round
- [ ] 7 and 8 letter words display properly without stretching beyond screen
- [ ] All typed words are accepted as valid entries (no strict validation)
- [ ] 7-letter words allow 7 tries, 8-letter words allow 8 tries (dynamic max)
- [ ] Word definition and example sentence shown on win/lose screen before "Play Again"
- [ ] Definition hint appears after 4th failed attempt
- [ ] Deployed and accessible via Netlify URL

## My Constraints
- **I can:** Follow tutorials, copy/paste code, make small edits, use AI assistance
- **I can't:** Build complex backends, debug intricate issues without help, spend money
- **I want:** Simple, minimal code; no dependencies if possible; educational and fun

## Current State
**Last session:** 2025-12-28
**Working:** Basic game loop with 5-8 letter words, keyboard, board, win/lose detection
**Broken:** 7-8 letter words overflow on mobile; max tries fixed at 6 for all lengths; strict word validation blocks playability; no educational content
**Next:** Fix responsive layout for longer words, implement dynamic max tries, add dictionary API integration for definitions

## Decisions Made
| Date | Decision | Why |
|------|----------|-----|
| 2025-12-27 | Vanilla HTML/CSS/JS (no framework) | Simplest approach, no build step, beginner-friendly |
| 2025-12-27 | Static word lists bundled in JS | No API calls needed, works offline, free |
| 2025-12-27 | Mobile-first CSS | Primary use case is phone |
| 2025-12-27 | Netlify for hosting | Free, easy deploy, handles static sites well |
| 2025-12-27 | No localStorage/persistence | Keeps scope minimal for 2-hour timeline |
| 2025-12-27 | Removed React/Tailwind/Firebase/Supabase direction from `.cursorrules` | Repo is a vanilla static Wordle; conflicting stack guidance was causing drift |
| 2025-12-28 | Relax word validation | Improve playability—let players try any combination |
| 2025-12-28 | Dynamic max tries (length-based) | Fairer difficulty: longer words = more attempts |
| 2025-12-28 | Add word definitions | Educational value + helps players learn |
| 2025-12-28 | Use Free Dictionary API | No API key needed, definitions + examples available |

## What I've Learned (Lessons)

### Active Lessons (not yet in .cursorrules)
- **2025-12-28** [seen: 1 time; severity: medium] — CSS `clamp()` with viewport-based calculations can fail for 7-8 letter words on narrow screens. Need to adjust max width or tile size formula.

### Graduated to .cursorrules
- (none yet)

### Rejected / One-off
- (none yet)
