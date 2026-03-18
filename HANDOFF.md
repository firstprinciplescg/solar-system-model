# Solar System Scale Explorer — Handoff Document

## Project Summary

A true-scale, horizontally-scrolling model of the solar system from the Sun to the Heliopause (123 AU), built as a React single-page app. The core premise is **"Earth = 1 pixel"** — every distance and (where possible) every object size follows from that single anchor. The emptiness between objects IS the experience.

The app tracks each user's actual scroll time and displays it contextually: how long it took to reach each object from the Sun and from the previous object. At the end (past the Heliopause), a summary card shows total scroll time and projects forward to distant targets (Oort Cloud, Proxima Centauri, Andromeda, etc.) using the user's measured scroll speed.

## Origin Context

This grew out of a conversation about whether Uranus's moons could harbor life. The user (Dustin) wanted to visualize just how far out Uranus sits and how vast the spaces are between solar system objects. Inspired by Josh Worth's "If the Moon Were Only 1 Pixel" and Chip & Dan Heath's *Made to Stick* (concreteness + unexpectedness principles). The "Earth = 1 pixel" anchor was chosen specifically because it's concrete and personal — everything you've ever known is that dot.

## Architecture

### Current State
- **Single JSX file** (`scale-model.jsx`) — a React component using only built-in React hooks (useState, useRef, useEffect, useCallback)
- **No external dependencies** beyond React itself and two Google Fonts (Space Grotesk, JetBrains Mono)
- **No build tooling yet** — was prototyped as a Claude.ai artifact (rendered in a sandboxed React environment)

### Key Constants & Scale Math
```
EARTH_DIA_KM = 12,742
1 AU = 149,597,870.7 km
PX_PER_AU = AU_KM / EARTH_DIA_KM ≈ 11,741 pixels per AU
Total scrollable width ≈ 1,448,943 px (LEFT_PAD) + (123 AU × 11,741) + END_CARD
```

At this scale:
- Sun = ~109 px diameter
- Earth = 1 px (the anchor)
- Jupiter = ~11 px
- Most dwarf planets = sub-pixel (shown as 3px minimum dots with a "sub-pixel" label)
- Saturn's rings are rendered at true scale (~22px span)

### Core Systems

1. **Scroll position tracking** — A `requestAnimationFrame` loop reads `scrollLeft`, converts to AU, and updates the HUD. Throttled to avoid excess re-renders.

2. **Object crossing detection** — When the viewport center passes an object's pixel position for the first time, the elapsed time since first scroll is recorded in a `Map` ref. This is never reset during a session.

3. **Void texts** — Contextual messages placed at specific AU positions in the empty space between objects. These are the emotional backbone of the experience.

4. **End card projections** — Uses actual measured `(total_px / total_seconds)` to compute projected scroll times to distant targets. Falls back to 400 px/sec if no data yet.

### Data Structures

**BODIES array** — Sun, 8 planets, 4 dwarf planets (Ceres, Pluto, Haumea, Makemake, Eris). Each has: id, name, type, au, diam (km), color, desc. Saturn has extra `hasRings` and `ringSpan` fields.

**REGIONS array** — Asteroid Belt, Kuiper Belt, Heliosheath. Each has au1/au2 for start/end bounds.

**BOUNDARIES array** — Termination Shock (94 AU), Heliopause (123 AU).

**PROJECTIONS array** — Targets for the end card: Sedna, Inner Oort Cloud, Outer Oort Cloud, Proxima Centauri, Barnard's Star, Epsilon Eridani, Galactic Center, Andromeda.

**VOID_TEXTS array** — 16 contextual messages positioned by AU.

## Deployment Setup (Vercel + GitHub)

### Recommended Stack
```
Next.js (app router) or Vite + React
├── Single-page app, no routing needed
├── Static export works fine (no server-side logic)
└── Vercel auto-detects both frameworks
```

### Quickstart with Vite (simpler for a single-page app)
```bash
npm create vite@latest solar-system-scale -- --template react
cd solar-system-scale
# Replace src/App.jsx with the contents of scale-model.jsx
# Update src/main.jsx to import the default export from App.jsx
```

### Quickstart with Next.js
```bash
npx create-next-app@latest solar-system-scale --app --no-tailwind --no-src-dir
cd solar-system-scale
# Place scale-model.jsx content into app/page.jsx
# Add "use client"; as the first line (required for hooks in app router)
# Remove the default globals.css body styles that conflict
```

### Environment Notes
- No environment variables needed
- No API keys
- No backend
- Google Fonts are loaded via `<link>` in the component — could be moved to `_document.jsx` / `layout.jsx` / `index.html` depending on framework
- The component assumes full viewport (`100vw × 100vh`) — the host page should have no body margin/padding

## Known Issues & Needed Improvements

### High Priority
1. **Mobile/touch scrolling** — Horizontal scroll on mobile is awkward. Needs either: a touch-drag handler, or a toggle to convert to vertical scroll on narrow viewports. The `requestAnimationFrame` loop already reads `scrollLeft` agnostically, so swapping axis should be straightforward.

2. **Initial load positioning** — On fast connections the page loads at scroll position 0, which is correct (the intro text). But if the browser restores scroll position on refresh, the crossing timestamps won't be accurate. Should reset `scrollLeft` to 0 on mount.

3. **Keyboard/accessibility** — No keyboard scroll controls. Arrow keys should advance by some increment. Screen reader users get nothing from this. At minimum, add an accessible text-only summary as an alternative view.

4. **Scroll speed normalization** — Trackpad momentum scrolling on macOS can produce extremely fast scroll-through. Consider whether the void texts need minimum visibility time or scroll-speed-aware opacity.

### Medium Priority
5. **Performance at full width** — The DOM contains all objects and void texts at once (~50 absolutely-positioned elements across ~1.5M pixels). This works fine in modern browsers, but adding more content (e.g., comet orbits, spacecraft positions) could benefit from virtualization — only rendering elements within ±2 viewport widths of current scroll position.

6. **Object info panels** — Currently a centered modal overlay. Could be improved with a slide-in side panel that doesn't interrupt the scroll position.

7. **Spacecraft positions** — Voyager 1 (~163 AU, beyond the model), Voyager 2 (~137 AU, also beyond), New Horizons (~60 AU, within the model). Adding New Horizons at its current position with a "launched 2006, still going" note would be compelling.

8. **Light travel time** — The HUD shows AU and km. Adding "light travel time from Sun" (AU × 8.317 minutes) would reinforce the scale in yet another way.

9. **Share/screenshot** — When users reach the end card, a "share your scroll time" feature (generating an OG image or a shareable URL with encoded stats) would help virality.

10. **Sound design** — Optional ambient audio that gets quieter and more sparse as you scroll further out. Completely optional but would elevate the experience significantly.

### Low Priority / Nice to Have
11. **Size comparison view** — The first version of this app (before the true-scale rewrite) had a separate tab showing relative sizes of all objects. That code exists in the earlier artifact (`solar-system.jsx`) and could be re-integrated as a secondary view.

12. **Orbit animation** — A tiny mode toggle that shows objects slowly orbiting (with trails) at their correct relative orbital periods. Complex but visually striking.

13. **Zoom control** — Let users zoom in/out to change the scale anchor (e.g., "Jupiter = 1 pixel" to see the outer solar system in more detail, or "Sun = 1 pixel" to compress the inner system).

14. **Analytics** — Track: median scroll time to heliopause, drop-off points (where do people stop scrolling?), most-clicked objects, completion rate. Vercel Analytics or a simple event logger.

## File Inventory

| File | Description |
|------|-------------|
| `scale-model.jsx` | The true-scale app (primary deliverable) |
| `solar-system.jsx` | Earlier version with logarithmic distance view + size comparison tabs (reference/reuse) |
| `HANDOFF.md` | This document |

## Design Tokens (for consistency if extending)

```
Background:     #000000
Text primary:   #ffffffdd
Text secondary: #ffffff55
Text muted:     #ffffff22
Sun accent:     #FDB813
Earth accent:   #5B9BD5
Danger/far:     #FF6B6B
Warning/mid:    #FF8C42
Font display:   Space Grotesk (300–700)
Font mono:      JetBrains Mono (300–700)
```

## Conversation Context for Claude Code

Dustin is technically literate (API-fluent, understands web architecture) but is primarily a strategist, not a developer. He iterates on outputs and thinks carefully about the user experience. He values the *Made to Stick* framework: concrete, unexpected, emotional, simple. The emptiness and boredom of scrolling through nothing is a feature, not a bug. Do not try to make the empty space "more interesting" by filling it with decorative elements. The void texts are carefully placed and should remain sparse.

The Uranus callout in the void texts (at ~22 AU) ties to a deeper conversation about whether Uranus's moons could harbor life. That context matters for the project's narrative arc.
