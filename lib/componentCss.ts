// Base styles for component content: what the editor's class pickers and elements
// mean visually. Used in the builder canvas and in published embeds, scoped to the
// element that holds the content. Themes layer their colors and type on top.
//
//   Layout   layout-row, layout-columns-2|3|4, layout-split, layout-center
//   Surface  card, card-highlight, card-tint, card-dark
//   Button   button, button-secondary, button-link (on a paragraph holding a link)
//   Type     typography-heading (display), -copy (lead), -accent (eyebrow), -small
//   Padding  spacing-compact | regular | large;  Shadow  boxshadow-light | medium | huge

export function componentBaseCss(scope: string) {
    const s = (selectors: string) => selectors.split(",").map(sel => `${scope} ${sel.trim()}`).join(", ");
    return `
${scope} { color: #1a202c; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif; line-height: 1.6; }
${s("h1, h2, h3, h4")} { line-height: 1.25; margin: 0 0 0.5em; font-weight: 700; }
${s("p")} { margin: 0 0 1em; }
${s("ul, ol")} { margin: 0 0 1em; padding-left: 1.25em; }
${s("img")} { max-width: 100%; height: auto; display: block; border-radius: 12px; }
${s("figure.image")} { margin: 0; }
${s("hr")} { border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0; }
${s("blockquote")} { margin: 0 0 1em; padding: 0; border: 0; font-size: 1.25em; line-height: 1.5; font-style: normal; }
${s("table")} { border-collapse: collapse; width: 100%; }
${s("td, th")} { border-bottom: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }

${s(".container")} { display: block; }
${s(".container > :last-child")} { margin-bottom: 0; }
/* Vertical rhythm inside stacked containers (grids and rows use gaps instead). */
${s(".container:not(.layout-row):not(.layout-columns-2):not(.layout-columns-3):not(.layout-columns-4):not(.layout-split) > * + .container")} { margin-top: 24px; }
${s(".container:not(.layout-row):not(.layout-columns-2):not(.layout-columns-3):not(.layout-columns-4):not(.layout-split) > .container + .container")} { margin-top: 48px; }
${s(".container:not(.layout-row):not(.layout-columns-2):not(.layout-columns-3):not(.layout-columns-4):not(.layout-split) > * + figure.image")} { margin-top: 32px; }
${s(".container:not(.layout-row):not(.layout-columns-2):not(.layout-columns-3):not(.layout-columns-4):not(.layout-split) > figure.image + *")} { margin-top: 16px; }
${s(".layout-center .layout-row")} { justify-content: center; }
${s(".card > figure.image:first-child")} { margin-bottom: 16px; }

${s(".layout-row, .card-horizontal")} { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; }
${s(".layout-row > *, .card-horizontal > *")} { margin: 0; }
${s(".layout-columns-2, .layout-columns-3, .layout-columns-4")} { display: grid; gap: 24px; align-items: stretch; }
${s(".layout-columns-2")} { grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); }
${s(".layout-columns-3")} { grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); }
${s(".layout-columns-4")} { grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr)); }
${s(".layout-split")} { display: grid; gap: 48px; align-items: center; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); }
${s(".layout-center")} { text-align: center; max-width: 760px; margin-left: auto; margin-right: auto; }
${s(".layout-center img")} { margin-left: auto; margin-right: auto; }
${s(".layout-columns-2 > *, .layout-columns-3 > *, .layout-columns-4 > *, .layout-split > *")} { min-width: 0; margin: 0; }

${s(".card, .card-minimal")} { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; }
${s(".card-highlight, .card-promo")} { background: #ffffff; border: 2px solid #2b6cb0; border-radius: 16px; padding: 28px; box-shadow: 0 12px 32px rgba(43, 108, 176, 0.15); }
${s(".card-tint")} { background: #f7fafc; border-radius: 20px; padding: 32px; }
${s(".card-dark, .card-lavish")} { background: #1a202c; color: #f7fafc; border-radius: 24px; padding: 48px 40px; }
${s(".card-dark h1, .card-dark h2, .card-dark h3, .card-dark h4, .card-dark p, .card-dark li, .card-lavish h2, .card-lavish h3, .card-lavish p")} { color: inherit; }

${s(".spacing-compact")} { padding: 16px; }
${s(".spacing-regular")} { padding: 32px; }
${s(".spacing-large")} { padding: 80px 32px; }
${s(".boxshadow-light")} { box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08); }
${s(".boxshadow-medium")} { box-shadow: 0 8px 24px rgba(15, 23, 42, 0.10); }
${s(".boxshadow-huge")} { box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18); }

${s(".typography-heading")} { font-size: clamp(36px, 5vw, 56px); line-height: 1.08; letter-spacing: -0.02em; font-weight: 800; }
${s(".typography-copy")} { font-size: 1.2em; line-height: 1.6; color: #4a5568; }
${s(".typography-accent")} { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #2b6cb0; margin-bottom: 0.75em; }
${s(".typography-small")} { font-size: 13px; color: #718096; }
${s(".card-dark .typography-copy, .card-dark .typography-small")} { color: rgba(247, 250, 252, 0.75); }
${s(".card-dark .typography-accent")} { color: #90cdf4; }

${s(".button, .button-secondary, .button-link")} { display: inline-block; margin: 0 12px 12px 0; vertical-align: middle; }
${s(".layout-center .button, .layout-center .button-secondary, .layout-center .button-link")} { margin: 0 6px 12px; }
${s(".button > a, .button-secondary > a")} { display: inline-block; padding: 12px 22px; border-radius: 10px; font-weight: 600; text-decoration: none; line-height: 1.2; transition: background 120ms ease, border-color 120ms ease; }
${s(".button > a")} { background: #1a202c; color: #ffffff; border: 1px solid #1a202c; }
${s(".button > a:hover")} { background: #2d3748; }
${s(".button-secondary > a")} { background: transparent; color: #1a202c; border: 1px solid #cbd5e0; }
${s(".button-secondary > a:hover")} { border-color: #1a202c; }
${s(".button-link > a")} { font-weight: 600; text-decoration: none; color: #2b6cb0; }
${s(".button-link > a::after")} { content: " →"; }
${s(".card-dark .button > a")} { background: #ffffff; color: #1a202c; border-color: #ffffff; }
${s(".card-dark .button-secondary > a")} { color: #ffffff; border-color: rgba(255, 255, 255, 0.4); }
${s(".card-dark .button-link > a")} { color: #90cdf4; }

${s(".card ul, .card-highlight ul, .card-tint ul")} { list-style: none; padding: 0; }
${s(".card li, .card-highlight li, .card-tint li")} { padding-left: 1.5em; position: relative; margin-bottom: 0.4em; }
${s(".card li::before, .card-highlight li::before, .card-tint li::before")} { content: "✓"; position: absolute; left: 0; color: #2b6cb0; font-weight: 700; }

${s(".tag")} { display: inline-block; font-size: 12px; font-weight: 600; padding: 2px 10px; border-radius: 999px; background: #edf2f7; margin: 0 6px 6px 0; }
`;
}
