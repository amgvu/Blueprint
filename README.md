# Blueprint — a Figma-to-HTML/CSS Converter

Converts a Figma mockup from URL, into HTMl/CSS

## Prototype Demo (30 Seconds)

https://github.com/user-attachments/assets/2e22bfc6-2198-4951-a2c3-a24686f15c66

## How It Works (API → Normalize → Index → Convert)

- Fetch (API)
  - Extracts the file key from `VITE_FIGMA_FILE_URL` (or accepts a raw key) and fetches the Figma file JSON using `VITE_FIGMA_API_KEY`.
- Normalize (Scene Graph → Normalized Tree)
  - Maps auto layout to normalized layout fields: `mode` (horizontal/vertical/none), `gap`, `padding`, `align`, `wrap`, `clipsContent`.
  - Derives sizing semantics: `hug`/`fill`/`fixed`, `grow`, `alignSelf`, `position` (static/absolute), and `constraints` (left/right/center, top/bottom/center, stretch pairs).
  - Captures `absolute` geometry and styles: solid/linear-gradient backgrounds, border color/width, and border radius.
  - For text nodes: characters, text align, font size/weight, line-height, letter-spacing, color.
- Flatten (Normalized Tree → Index)
  - Produces `{ nodes, parents, children, order, path, byType, depth }` for deterministic traversal and fast O(1) lookups.
- Convert (Index → HTML/CSS)
  - Decides which parents need `position: relative` for absolute children.
  - Containers (auto layout): emits `display:flex`, direction, `gap`, `padding`, `justify-content`, `align-items`, wrap, and clipping; applies background, gradients, borders, and radius.
  - Children: maps hug/fill/fixed sizing, `flex`/`align-self`/`flex-grow`; text resets margins and applies typography; absolute children emit inline `left/top/right/bottom` using constraints (center, right/bottom, stretch pairs).
  - Deduplicates CSS declarations via a class registry; prunes non-renderable nodes; emits deterministic HTML and CSS.

## Quick Start

- Install deps: `pnpm install`
- Configure env in `.env`:
  - `VITE_FIGMA_API_KEY=...`
  - `VITE_FIGMA_FILE_URL=https://www.figma.com/file/<KEY>/...`
- Run preview app: `pnpm dev`
  - Click “Generate from Figma” to fetch → normalize → generate
  - Preview auto-resizes to show the full mockup

## Capabilities

- Normalizes and flattens a Figma scene graph (layout, sizing, styles)
- Auto layout → flexbox (direction, gap, padding, main/cross alignment, wrap, clips)
- Sizing semantics (HUG/FILL/FIXED), grow, cross-axis stretch
- Absolute children use inline left/top/width/height; honors pins (right/bottom/center) and stretch (left_right/top_bottom)
- Styles
  - Background: solid colors; linear gradients → `linear-gradient(...)`
  - Borders: stroke color/weight → `border`
  - Border radius: uniform and per-corner (skips `0px`)
  - Text: color, font-size/weight, line-height, letter-spacing; newline handling via `white-space: pre-line`
  - Fonts: always enforce a system sans stack on text nodes
- Deterministic output
  - Class registry deduplicates CSS
  - Non-renderable nodes pruned

## Scripts

- `pnpm dev` — start app with HMR
- `pnpm build` — type-check and production build of the app
- `pnpm preview` — preview the production build
- `pnpm test:run` — run tests (Vitest)

## Preparing Your Figma File

- Prefer Frames over Groups for layout
- Use Auto Layout for containers; set `itemSpacing` for list spacing
- Set sizing intents on children (HUG/FILL/FIXED); use grow/align-self where appropriate
- Use absolute positioning only for overlays/icons; set constraints (left/right, top/bottom, center) when applicable

## Limitations

- Visual fidelity: layout and spacing are prioritized; exact typography and effects may differ
- Effects (drop shadows/blur) and images are not mapped
- Gradients: only linear gradients supported (no radial or image)
- Stroke alignment (inside/outside/center) is approximated with CSS `border`
- Fonts: text nodes always use a system sans stack (not the exact design font)
- Transforms/rotation are ignored; complex vectors/boolean ops are treated as non-styled blocks
- Copy/paste across files can drop/alter layout and styles; duplicating inside the same file is more reliable

## Layout Conversion Limitations

- Uniform gap, no per-child margins
  - Auto layout spacing is represented with a single `gap`; unique, per-item margins are not emitted. Designs with intentionally uneven spacing between siblings will be normalized to even spacing.
- Space-between distribution
  - `SPACE_BETWEEN` maps to `justify-content: space-between` and cannot preserve bespoke spacing on individual children.
- Fill with zero basis can shrink aggressively
  - Horizontal fill sets `flex: <grow> 1 0`. The `0` basis can compress content more than Figma’s fill container behavior, especially with multiple fill siblings.
- Centering heuristics for text
  - Non-absolute centered text may get `width:<px>` + `margin:0 auto`, centering the element itself. This can differ from Figma when the element should remain start-aligned while only text is centered.
  - Absolute centered text uses geometry/tolerance to re-center via `left`; slight asymmetries may still be centered.
- Layout:none parents default to absolute children
  - Under `layout.mode === "none"`, children are treated as positioned (to preserve static geometry). Mixed intent (some flow, some absolute) is not inferred, so flow spacing is lost.
- Constraints “scale” unsupported
  - Only left/right/center and top/bottom/center/stretch pairs are converted. Scale constraints are ignored, so absolute children do not responsively scale with container changes.
- Cross-axis stretch vs HUG differences
  - CSS stretching may stretch HUG children on the cross axis when Figma visually keeps them hugging unless explicitly set to fill.
- Wrap behavior and row distribution
  - `flex-wrap: wrap` is emitted, but breakpoints depend on computed widths. There is no `align-content` mapping, so multi-row distribution can differ from Figma.
- Baseline alignment
  - Baseline alignment for mixed text/non-text siblings is not mapped; only start/center/end/stretch are supported.
- Canvas-level centering is opinionated
  - The canvas uses viewport centering (`min-height:100vh`, centered flex); embedding in real pages or top-left canvas layouts will differ unless disabled via options.
- Fractional pixel rounding
  - Pixels are rounded by default; use the `preserveFractionalPixels` option to reduce 1px shifts on precise geometry.
- Stroke/border sizing
  - Strokes map to CSS `border` without adjusting box measurements; subtle spacing differences can appear when borders occupy space.
- No min/max constraints
  - Min/max sizing is not modeled; HUG with minimums or clamp-like behaviors are not reproduced.

## Testing

- Unit, integration and snapshots with Vitest
  - API fetches and normalization
  - Sizing and absolute constraints (including centered/ stretch cases)
  - Minimal and full sign-in snapshots

## Architecture Notes

- Conversion is split by concern under `src/lib/figma/`:
  - `api/` (fetch/env/key extract)
  - `normalize/` (scene graph → normalized tree + flattened index)
  - `conversion/layout/` (CSS mapping helpers)
  - `conversion/generation/` (render model, HTML/CSS emission)

## Deliverables Checklist

- [x] Working conversion system (layout, sizing, text, basic styles)
- [x] Output `index.html` and `styles.css` files in output/
- [x] Preview app to inspect output
- [x] Docs with setup, usage, and limitations

## Planned Product Refactor

- Auth
  - Replace explicit token based authentication with Figma OAuth
- Workflow
  - View mockups in home page before viewing for conversion
  - Convert preview window into editor style workflow with real-time changes.
  - CDE (Cloud Based Development Environment) model

## Known Caveats

- Cross-file copy/paste
  - Copying designs between Figma files often drops Auto Layout, constraints, library styles, or instances. Prefer duplicating inside the same file or relinking styles after paste.
- Layout:none parents
  - Frames without Auto Layout produce absolutely positioned children; spacing then reflects absolute Y offsets rather than `gap`. Use Auto Layout for lists and set `itemSpacing` for consistent gaps.
- Fonts
  - Enforced system sans for predictability; if your design uses Inter or another font, metrics may differ slightly.
- Components/instances from external libraries
  - Detached or unresolved styles can change text color/weights or spacing when pasted without linked libraries.
- Stroke/borders
  - Figma stroke alignment can’t be reproduced exactly with CSS `border`; subtle differences can occur on tight layouts.

## Assignment Mapping

- Context: Convert Figma mocks into HTML/CSS
- Task: Takes the provided Figma file as input and outputs HTML/CSS
  - Input: Uses Figma REST API via `VITE_FIGMA_API_KEY` + `VITE_FIGMA_FILE_URL`
  - Output: Converts API response into consistent HTML/CSS
- Success criteria (visual fidelity)
  - Layout/spacing: Auto Layout → flex, `gap`, `padding`, alignment, absolute pins, stretch
  - Typography: font-size/weight, line-height, letter-spacing; newline handling
  - Colors/borders/gradients: solid backgrounds, linear gradients, border radius, stroke→border
  - Tricky cases: borders handled via border, linear gradients supported (radial/effects out of scope)
- Generalization
  - Normalization + flattened structure allow the converter to operate on arbitrary Figma files for common nodes (frames/text/rectangles/groups/components/instances), with the limitations noted above.
