# Legacy Wolf — Style Guide (repo copy → `packages/tokens`)

> Implementation-ready extraction of visual rules from `legacy-wolf-brand.md` v0.2 + established additions (Ember tokens for Sick Mode severity surfaces).

## Color tokens (geological naming)
| Token | Hex | Usage |
|---|---|---|
| `obsidian` | `#0A0A0A` | Base background — app and site |
| `graphite` | `#161616` | Cards, modals, input containers |
| `onyx` | `#1F1F1F` | Hover states, secondary cards |
| `guardianGreen` | `#B5C42C` | CTAs, progress, active states — **rationed** |
| `deepMoss` | `#9AA826` | Pressed CTA state |
| `ember` | `#C43A2C` | Severity 9–10 / critical surfaces (Sick Mode, grace window) |
| `deepEmber` | `#A4302C` | Ember pressed state |
| `white` | `#FFFFFF` | Headlines, primary text |
| `mist` | `#B5B5B5` | Secondary text, default icons |
| `slate` | `#7A7A7A` | Placeholders, disabled |
| `coal` | `#2A2A2A` | Borders, dividers |

Rules: **dark mode is the brand** (light only for legal exports/family documents). No secondary accents — no blues, oranges, purples. If everything is green, nothing is. All text WCAG AA.

## Typography — Inter only
| Token | Size/Line | Weight | Case | Usage |
|---|---|---|---|---|
| `displayXL` | 64/64 | Black | UPPERCASE | Hero |
| `displayL` | 48/52 | Black | UPPERCASE | Section openers, step titles |
| `displayM` | 32/36 | Black | UPPERCASE | Sub-sections |
| `heading` | 20/28 | Semibold | Sentence | Card titles, modal headers |
| `body` | 16/24 | Regular | Sentence | Default |
| `bodySmall` | 14/20 | Regular | Sentence | Supporting |
| `label` | 12/16 | Medium | UPPERCASE +0.08em | Eyebrows, form labels |
| `mono` | 16/24 | Medium | — | Timers, codes ("16h") |

Never italicize for emphasis (use weight). Never underline outside links. Tight, declarative sentences.

## Spacing & shape
- 4px base rhythm: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
- Cards: Graphite, radius 16–20px, optional 1px Coal border, padding 16–24.
- CTAs: pill (24px+ radius). Primary = Guardian Green bg + near-black bold ALL-CAPS text. Secondary = transparent + white border/text.
- Inputs: dark, 16px+ radius, uppercase Label above, Slate placeholder.
- Progress: segmented bar — Guardian Green done, Coal upcoming.
- Generous negative space; one focal point per view.

## Iconography
Line-based, single-weight, rounded terminals. Mist default; White/Guardian Green active; filled variants only for selected states. Paw print is a functional pet cue only — never decorative. No playful icons.

## Imagery
Implied, not depicted. Natural light, slightly desaturated, domestic and real. Pets calm; people in fragments (hands, feet, shoulders). Never: medical emergencies, distressed animals, graphic decay, stock happy-family-with-golden-retriever, anything that telegraphs "tech product".

## Logo
Geometric wolf head in a rounded shield. Clear space = height of the "W" in WOLF. Min sizes: mark 24px digital / 12mm print; with wordmark 120px / 25mm. Never recolor, shadow, outline, rotate, or restyle.

## Component-state color mapping (app)
| State | Token |
|---|---|
| Protected / active / progress | guardianGreen |
| Paused / Trip Mode badge | mist on graphite |
| Grace window / Alert active / Severity 9–10 | ember (deepEmber pressed) |
| Disabled | slate |
| Warning/error/success system colors | must be tuned to the palette — never generic system defaults (open item) |
