# Wordle — Product Briefing

**Project:** Wordle
**Version:** 1.0
**Last Updated:** 2025-12-27
**Status:** Active

## Changelog
- **v1 (2025-12-27):** Initial spec

---

## What I'm Building
A mobile-first Wordle clone with infinite play mode. Players guess words of configurable length (5-8 letters) with color-coded feedback. No daily limits, no accounts, no score tracking—just pure word-guessing fun.

## Who It's For
Me (and anyone I share the link with) who wants to play unlimited Wordle on their phone without waiting for a new daily puzzle.

## What "Done" Looks Like
- [ ] Can play a complete game of Wordle on mobile
- [ ] Can select word length (5, 6, 7, or 8 letters)
- [ ] Can start a new game with a fresh word after each round
- [ ] Deployed and accessible via Netlify URL

## My Constraints
- **I can:** Follow tutorials, copy/paste code, make small edits, use AI assistance
- **I can't:** Build complex backends, debug intricate issues without help, spend money
- **I want:** Simple, minimal code; no dependencies if possible; done in ~2 hours

## Current State
**Last session:** 2025-12-27
**Working:** Nothing yet — starting fresh
**Broken:** N/A
**Next:** Set up project structure and basic HTML/CSS

## Decisions Made
| Date | Decision | Why |
|------|----------|-----|
| 2025-12-27 | Vanilla HTML/CSS/JS (no framework) | Simplest approach, no build step, beginner-friendly |
| 2025-12-27 | Static word lists bundled in JS | No API calls needed, works offline, free |
| 2025-12-27 | Mobile-first CSS | Primary use case is phone |
| 2025-12-27 | Netlify for hosting | Free, easy deploy, handles static sites well |
| 2025-12-27 | No localStorage/persistence | Keeps scope minimal for 2-hour timeline |
| 2025-12-27 | Removed React/Tailwind/Firebase/Supabase direction from `.cursorrules` | Repo is a vanilla static Wordle; conflicting stack guidance was causing drift |

## What I've Learned (Lessons)

### Active Lessons (not yet in .cursorrules)
- (none yet)

### Graduated to .cursorrules
- (none yet)

### Rejected / One-off
- (none yet)
