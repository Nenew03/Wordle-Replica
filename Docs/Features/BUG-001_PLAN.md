# BUG-001 — Fix Responsive Layout for 7-8 Letter Words (Technical Plan)

## Context / Goal
Adjust the game board's responsive sizing to ensure that 7 and 8-letter word grids fit within narrow viewports (down to 320px width) without horizontal scrolling, while maintaining readability and touch-friendly dimensions where possible.

Currently, the board overflows on mobile because the `--tile-size` calculation has a minimum floor (`44px`) that, when multiplied by 7 or 8 plus gaps, exceeds the 320px viewport width.

## Changes Required

### 1) CSS: Responsive Variables (`css/style.css`)
Update the `:root` block to redefine how `--tile-size` and `--gap` are calculated.

- **Gap Adjustment**: Introduce a dynamic or reduced gap for longer words to save horizontal space.
- **Tile Size Calculation**: 
    - Adjust the `clamp()` floor from `44px` to a value that fits 8 tiles + gaps within 320px (e.g., ~30-32px).
    - Refine the `calc()` portion of `clamp()` to explicitly account for the gaps and container padding to prevent overflow at any viewport width.
    - Current formula: `clamp(44px, calc((100vw - 48px) / var(--word-length)), 62px)`
    - Proposed logic: `tile-size = (AvailableWidth - TotalGapWidth) / word-length`

### 2) JavaScript: Board Rendering (`js/game.js`)
Ensure the CSS variables are updated appropriately when the word length changes.

- **Function**: `renderBoard()`
- **Logic**: Ensure `boardEl.style.setProperty("--word-length", ...)` remains the source of truth. If needed, also set a `--word-length-class` or similar if CSS needs to toggle styles (like gap size) based on specific lengths, though standard CSS variables should suffice.

## Step-by-step Algorithm (Layout Calculation)
1.  **Define constraints**:
    -   Minimum viewport width: `320px`
    -   Horizontal padding (container): `12px` per side (`24px` total)
    -   Target max board width at 320px: `~296px`
2.  **Calculate gap**:
    -   If `word-length` > 6, use `4px` gap.
    -   Otherwise, keep `6px` gap.
3.  **Calculate max possible tile size for 8 letters**:
    -   `8 * T + 7 * G <= 296`
    -   If `G = 4px`: `8 * T + 28 <= 296` → `8 * T <= 268` → `T <= 33.5px`
    -   Floor of `clamp` should be set to `32px`.
4.  **Refine CSS `calc`**:
    -   Use `100vw - 32px` (leaving 16px margin on each side) as the base for the fluid calculation.
    -   Subtract total gap width: `(var(--word-length) - 1) * var(--gap)`.
    -   Divide by `var(--word-length)`.

## Quick Verification Checklist
- [ ] Select 8-letter mode and resize browser to 320px; no horizontal scrollbar appears.
- [ ] Select 5-letter mode; tiles remain at their comfortable default size (min 44px, max 62px).
- [ ] Tile font size (calculated as `0.52 * tile-size`) remains legible at the smallest tile size (~16.6px font).
- [ ] No regressions on 6-letter or 7-letter layouts.
