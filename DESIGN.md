# FDil Design System

FDil is a Turkish-language YDT, YDS, and YÖKDİL vocabulary and exam-coaching web application. This document records the visual tokens, typography, color contrast rules, motion standards, and UI craft guardrails established across `index.html`, `css/*.css`, and `js/modules/*.js`.

---

## 1. Visual Direction & Surfaces

FDil uses an editorial study-desk aesthetic: calm warm paper surfaces in light mode paired with deep botanical green accents, and low-glare deep slate surfaces in dark mode paired with high-luminance sage accents.

### Theme Switching
Tokens in `css/variables.css` support automatic OS dark mode via `@media (prefers-color-scheme: dark)` as well as explicit theme overrides (`html.dark` and `html.light`).

| Surface / Role | Light Mode | Dark Mode | Notes |
| --- | --- | --- | --- |
| Primary Background | `#F7F5EE` (Warm Parchment) | `#131712` (Deep Slate) | Low-glare reading canvas |
| Primary Accent (`--accent`) | `#3B5323` (Botanical Forest Green) | `#9BC472` (Sage Green) | Paired strictly with `--on-accent` |
| Error Solid (`--error-solid`) | `#B91C1C` | Theme error solid | Paired strictly with `--on-error` |
| Flashcard Back (`.flash-back`) | `#2e4d17 -> #1f360f` | `#2e4d17 -> #1f360f` | >9:1 contrast with `#ffffff` / `rgba(255,255,255,0.92)` in both modes |

---

## 2. Color & Semantic Tone Architecture

All interactive fills, status pills, badges, and coaching indicators use semantic tokens defined in `css/variables.css` and validated to **WCAG AA (`>= 4.51:1` contrast)** across both light and dark modes.

### Foreground Pairings
- **`--on-accent`**: Always pair `background: var(--accent)` with `color: var(--on-accent)` — **never** use raw `#fff` or `white` on `--accent`, because dark mode `--accent` (`#9BC472`) drops to ~2.0:1 against white.
- **`--on-error` / `--on-success` / `--on-tone`**: Required foreground tokens when rendering white or high-contrast labels on `--error-solid`, success solids, or `--tone-*-solid`.

### Semantic Tone Scales (`--tone-{hue}-*`)
Five semantic hues replace ad-hoc inline colors and legacy purple accents:
- `green`: Mastery, completed targets, active primary controls
- `teal`: Mixed/review modes, dictionary tags, secondary highlights (replaces legacy `#9b59b6` purple)
- `amber`: Speed modes, recommendations, streak warnings (light mode tuned to `#92400E` on `#FEF3C7`)
- `blue`: Reading, informational cards, neutral categorization
- `red`: Overdue items, weak-word drills (`home-card--error`), urgent indicators

Each hue provides `-fg`, `-bg`, `-solid`, and `-border` tokens (`--tone-{green,teal,amber,blue,red}-{fg,bg,solid,border}`).

---

## 3. Typography

Fonts are loaded in `index.html` and mapped via CSS variables in `css/variables.css`:

- **Sans UI & Study Copy (`--font-sans`)**: `Lexend` — chosen for open counters and high legibility during timed YDT/YDS vocabulary drills.
- **Serif Display & Dictionary Headwords (`--font-serif`)**: `Newsreader` — used for editorial hierarchy such as `.dict-hero-word` (`font-weight: 600`).

### Scale & Numeric Rules
- **Minimum Font Floor**: `11px` across all badges, unit counts, KPI sub-labels, spaced-repetition overdue notes, and achievement labels (legacy `9px`, `10px`, and `10.5px` sizes removed).
- **Tabular Numbers**: `tabular-nums` applied to scores, XP counters, countdowns, KPIs, and timers to prevent layout jitter.
- **Input & Selection Polish**: Standardized `::selection`, `caret-color`, and accessible `:focus-visible` outlines.

---

## 4. Layout, Cards & Elevation

- **Semantic Card Variants**: Home and coach cards use dedicated classes (`home-card--error`, `home-card--blue`, `home-card--amber`, `home-card--teal`, `home-card-arrow`, `is-amber`, `is-teal`) instead of inline styles or `.is-purple`.
- **Restrained Borders & Shadows**: Recommended and elevated states use neutral depth shadows (e.g., `0 4px 16px rgba(15, 23, 42, 0.08)`) rather than colored neon glows or thick `border-left` accent strips.
- **Structural Clarity**: Inset box shadows or full semantic borders replace decorative `3px`/`4px` left borders on reading passages, dictionary idioms, modals, and phrasal-verb cards.

---

## 5. Motion & Reduced Motion

- **Deceleration Curve**: Transitions and state changes (`css/animations.css`, `.flash-card`, `.learn-expand`, `.mascot-bounce`) use smooth deceleration `cubic-bezier(0.22, 1, 0.36, 1)` rather than elastic/overshoot bounce curves (`cubic-bezier(0.34, 1.56, 0.64, 1)` or `0.68, -0.55`).
- **Reduced Motion**: `@media (prefers-reduced-motion: reduce)` disables non-essential keyframe animations and transitions.

---

## 6. Accessibility & Anti-Slop Guardrails

1. **Zoom Unlock**: Viewport `<meta>` allows user pinch-zoom (no `maximum-scale=1` / `user-scalable=no`).
2. **No Legacy Purple Accents**: `#9b59b6` / `is-purple` / purple glows are banned; use teal (`#0f766e` / `--tone-teal-*`) or botanical green.
3. **No Synthetic Textures**: Pure CSS striping (`repeating-linear-gradient`), paper grid overlays, and card top/left stripe pseudo-elements (`.book-pages-edge::after`, `.book-cover::before`, `.flash-front::before`) are excluded.
4. **DOM & Asset Stability**: Visual refactors must preserve Turkish copy, functional DOM IDs, JS module contracts, and `sw.js`-cached filenames/paths.
5. **Automated Audit**: Run `impeccable detect --json` on modified HTML, CSS, and JS files before shipping UI changes.
