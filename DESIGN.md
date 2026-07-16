# DESIGN.md — Sailor Draft

## Product Soul
A blank sheet of screenplay paper on the writer's desk at 2 a.m. — a single lamp, an Olivetti typewriter, silence. The tool should vanish so the words can breathe. This is not a SaaS app; it is a page.

## Design Anchor
Final Draft's chrome-light writing view crossed with the physicality of a 1970s film-school shooting script. Courier ink, cream paper, faint page shadow floating on a warm neutral desk. Nothing else.

## Design Tokens

### Colors — meaning before palette
- **Ink** `#111111` — typewriter ribbon black. All body text, all UI text. Never pure `#000`.
- **Page** `#FAF7F0` — cream bond paper, slightly warm so it doesn't glare like a screen.
- **Desk** `#E7E2D6` — the warm neutral surface the page rests on (app background).
- **Rule** `#D8D2C2` — the faint pencil line, for dividers and page borders.
- **Muted Ink** `#6B675C` — for meta text (page numbers, element labels, timestamps).
- **Accent — Marginalia Red** `#B03A2E` — used *only* for destructive confirmation and the recording dot of "unsaved". No other red anywhere.

### Typography
- **Screenplay body**: `Courier Prime` (Google Fonts), 12pt, `line-height: 1`. This is the industry standard and non-negotiable — every measurement in a screenplay (60 char/line, 55 line/page, 1 page ≈ 1 minute) depends on it.
- **UI chrome**: same `Courier Prime` at 13–14px for consistency, so the interface doesn't fight the manuscript. Uppercase for section labels, tracked +0.05em.
- **No sans-serif anywhere.** The whole product is monospaced.

### Spacing & Layout — screenplay geometry
Follows Academy standard so exports are camera-ready:
- Page width: **8.5in** rendered at ~816px (96dpi).
- Left margin **1.5in** (binding), right **1in**, top/bottom **1in**.
- Scene heading: full width, UPPERCASE, bold optional.
- Action: full width.
- Character cue: indent left **3.7in**, UPPERCASE.
- Parenthetical: indent left **3.1in**, wrapped in `()`.
- Dialogue: indent left **2.5in**, right pad **2in**.
- Transition: right-aligned, UPPERCASE.

### Page & Shadow
- Page sits centered on the Desk background.
- Shadow: `0 1px 0 rgba(0,0,0,0.04), 0 24px 48px -24px rgba(60,50,30,0.18)`. Just enough lift to feel like paper, never like a Material card.
- Border radius **0**. Paper has corners.

## Interaction

### Element cycling (the core interaction)
`Tab` cycles the current line's element type in Final Draft order: Scene → Action → Character → Dialogue → Parenthetical → Transition → Shot → back to Scene. `Enter` auto-predicts the next element (after Character → Dialogue, after Dialogue → Action, after Scene → Action). Muscle memory from Final Draft is preserved exactly.

### Motion
Almost none. The cursor blinks. New pages fade in over 120ms `ease-out`. Buttons have no hover animation beyond a 1px underline appearing. No spring physics, no scale transforms. This is a manuscript, not a dashboard.

### Focus mode (default)
No sidebar during writing. A thin top bar shows only: script title (click to rename), current element type (tiny uppercase label at right margin), page count. That's it. Import/Export/Library live behind a single ⋯ menu.

### Showcase footer
For public deployment, the marketing surface needs a quiet signature at the bottom of the page: a thin ruled footer with a short note and a row of plain-text links. It should feel like credits typed in the margin, not a startup CTA block. Use uppercase labels, muted ink for framing copy, ink for links, and the same underline-on-hover behavior as the rest of the interface.

## Component Rules
- **Buttons**: text-only, underline on hover, no fill, no radius. Destructive uses Marginalia Red text.
- **Inputs**: bottom rule only, no box.
- **Dialogs**: cream page on darkened desk, single rule border, no rounded corners.
- **Icons**: avoid. Where unavoidable (menu ⋯, import ⤓, export ⤒), use unicode glyphs at ink color.
- **Footer links**: external links render as editorial text links separated by quiet spacing or a centered dot; never boxed, never carded, never styled as social badges.

## Forbidden (Do-Not-Do List)
- No gradients. No blur/glass. No neon or saturated accent color.
- No emoji, no illustrations, no stock photography.
- No rounded cards. No drop-shadows on buttons.
- No dark mode in v1 — screenplays are read on paper, the page must stay cream.
- No sans-serif fonts. No proportional fonts for the manuscript.
- No autocomplete popups or AI suggestions in the writing surface — the writer is alone with the page.
- No progress bars, no toasts stacking; a single quiet line at the bottom says "saved · 14:22".
- No oversized promotional footer, no colored social icons, no pill buttons, and no "follow me" phrasing that breaks the manuscript illusion.

## Assets
- Font loaded via `fonts.googleapis.cn` (CN region), `Courier Prime` 400/700.
- No image assets required.
