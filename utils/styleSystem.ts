// The style system is built in layers. Each layer references the one below by id,
// so changing a primitive flows through every preset and element that uses it.
//
//   primitives  colors, fonts, spacing, radii
//   presets     text styles (font + color + size/weight/line height)
//   elements    buttons, links, cards (text styles + colors + spacing + radii)
//   themes      a full look: background, heading/body text styles, link, button, card.
//               A theme is applied to a component in the builder to style all of it.

import type {CSSProperties} from "react";

export type ColorToken = { id: string, name: string, value: string };
export type FontToken = {
    id: string,
    name: string,
    family: string,
    source: "google" | "system",
    fallback: "sans-serif" | "serif" | "monospace",
    weights: number[],
};
export type SizeToken = { id: string, name: string, value: number };
export type TextStyle = {
    id: string,
    name: string,
    fontId: string,
    size: number,
    weight: number,
    lineHeight: number,
    letterSpacing: number,
    uppercase: boolean,
    colorId: string,
};
export type ButtonElement = {
    id: string,
    name: string,
    textStyleId: string,
    textColorId: string,
    backgroundId: string | null,
    hoverBackgroundId: string | null,
    borderColorId: string | null,
    radiusId: string,
    paddingXId: string,
    paddingYId: string,
};
export type LinkElement = {
    id: string,
    name: string,
    textStyleId: string,
    colorId: string,
    hoverColorId: string,
    underline: "always" | "hover" | "none",
};
export type CardElement = {
    id: string,
    name: string,
    backgroundId: string,
    borderColorId: string | null,
    radiusId: string,
    paddingId: string,
    shadow: "none" | "sm" | "md" | "lg",
    titleStyleId: string,
    bodyStyleId: string,
};

export type ThemeToken = {
    id: string,
    name: string,
    backgroundId: string,
    h1StyleId: string,
    h2StyleId: string,
    h3StyleId: string,
    bodyStyleId: string,
    accentStyleId: string,
    linkId: string,
    buttonId: string,
    cardId: string,
    tagBackgroundId: string | null,
};

export interface StyleSystem {
    colors: ColorToken[],
    fonts: FontToken[],
    spacing: SizeToken[],
    radii: SizeToken[],
    textStyles: TextStyle[],
    buttons: ButtonElement[],
    links: LinkElement[],
    cards: CardElement[],
    themes: ThemeToken[],
}

export type TokenKind = keyof StyleSystem;

export const KIND_LABELS: Record<TokenKind, string> = {
    colors: "color",
    fonts: "font",
    spacing: "spacing step",
    radii: "radius",
    textStyles: "text style",
    buttons: "button",
    links: "link",
    cards: "card",
    themes: "theme",
};

export const SHADOWS: Record<CardElement["shadow"], string> = {
    none: "none",
    sm: "0 1px 2px rgba(15, 23, 42, 0.08)",
    md: "0 4px 12px rgba(15, 23, 42, 0.10)",
    lg: "0 12px 32px rgba(15, 23, 42, 0.14)",
};

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_SYSTEM: StyleSystem = {
    colors: [
        {id: "c-ink", name: "Ink", value: "#1a202c"},
        {id: "c-slate", name: "Slate", value: "#4a5568"},
        {id: "c-muted", name: "Muted", value: "#718096"},
        {id: "c-border", name: "Border", value: "#e2e8f0"},
        {id: "c-canvas", name: "Canvas", value: "#f7fafc"},
        {id: "c-surface", name: "Surface", value: "#ffffff"},
        {id: "c-brand", name: "Brand", value: "#2b6cb0"},
        {id: "c-brand-dark", name: "Brand dark", value: "#2c5282"},
        {id: "c-brand-tint", name: "Brand tint", value: "#ebf8ff"},
        {id: "c-accent", name: "Accent", value: "#d53f8c"},
    ],
    fonts: [
        {id: "f-inter", name: "Inter", family: "Inter", source: "google", fallback: "sans-serif", weights: [400, 500, 600, 700]},
        {id: "f-lora", name: "Lora", family: "Lora", source: "google", fallback: "serif", weights: [400, 600, 700]},
        {id: "f-mono", name: "JetBrains Mono", family: "JetBrains Mono", source: "google", fallback: "monospace", weights: [400, 600]},
    ],
    spacing: [
        {id: "s-1", name: "XS", value: 4},
        {id: "s-2", name: "S", value: 8},
        {id: "s-3", name: "M", value: 12},
        {id: "s-4", name: "L", value: 16},
        {id: "s-5", name: "XL", value: 24},
        {id: "s-6", name: "2XL", value: 32},
    ],
    radii: [
        {id: "r-none", name: "None", value: 0},
        {id: "r-sm", name: "Small", value: 4},
        {id: "r-md", name: "Medium", value: 8},
        {id: "r-lg", name: "Large", value: 16},
        {id: "r-full", name: "Pill", value: 999},
    ],
    textStyles: [
        {id: "t-display", name: "Display", fontId: "f-lora", size: 44, weight: 700, lineHeight: 1.1, letterSpacing: -0.01, uppercase: false, colorId: "c-ink"},
        {id: "t-title", name: "Title", fontId: "f-inter", size: 32, weight: 700, lineHeight: 1.2, letterSpacing: -0.01, uppercase: false, colorId: "c-ink"},
        {id: "t-heading", name: "Heading", fontId: "f-inter", size: 24, weight: 600, lineHeight: 1.3, letterSpacing: -0.005, uppercase: false, colorId: "c-ink"},
        {id: "t-subheading", name: "Subheading", fontId: "f-inter", size: 18, weight: 600, lineHeight: 1.4, letterSpacing: 0, uppercase: false, colorId: "c-ink"},
        {id: "t-body", name: "Body", fontId: "f-inter", size: 16, weight: 400, lineHeight: 1.6, letterSpacing: 0, uppercase: false, colorId: "c-slate"},
        {id: "t-caption", name: "Caption", fontId: "f-inter", size: 13, weight: 400, lineHeight: 1.4, letterSpacing: 0, uppercase: false, colorId: "c-muted"},
        {id: "t-label", name: "Label", fontId: "f-inter", size: 13, weight: 600, lineHeight: 1.2, letterSpacing: 0.06, uppercase: true, colorId: "c-ink"},
        {id: "t-code", name: "Code", fontId: "f-mono", size: 14, weight: 400, lineHeight: 1.5, letterSpacing: 0, uppercase: false, colorId: "c-ink"},
    ],
    buttons: [
        {id: "b-primary", name: "Primary", textStyleId: "t-label", textColorId: "c-surface", backgroundId: "c-brand", hoverBackgroundId: "c-brand-dark", borderColorId: null, radiusId: "r-md", paddingXId: "s-5", paddingYId: "s-3"},
        {id: "b-secondary", name: "Secondary", textStyleId: "t-label", textColorId: "c-brand", backgroundId: null, hoverBackgroundId: "c-brand-tint", borderColorId: "c-brand", radiusId: "r-md", paddingXId: "s-5", paddingYId: "s-3"},
        {id: "b-pill", name: "Pill", textStyleId: "t-label", textColorId: "c-surface", backgroundId: "c-accent", hoverBackgroundId: "c-ink", borderColorId: null, radiusId: "r-full", paddingXId: "s-6", paddingYId: "s-2"},
    ],
    links: [
        {id: "l-default", name: "Default", textStyleId: "t-body", colorId: "c-brand", hoverColorId: "c-brand-dark", underline: "hover"},
        {id: "l-subtle", name: "Subtle", textStyleId: "t-caption", colorId: "c-muted", hoverColorId: "c-ink", underline: "always"},
    ],
    cards: [
        {id: "k-default", name: "Default", backgroundId: "c-surface", borderColorId: "c-border", radiusId: "r-md", paddingId: "s-5", shadow: "sm", titleStyleId: "t-heading", bodyStyleId: "t-body"},
        {id: "k-feature", name: "Feature", backgroundId: "c-brand-tint", borderColorId: null, radiusId: "r-lg", paddingId: "s-6", shadow: "none", titleStyleId: "t-heading", bodyStyleId: "t-body"},
    ],
    themes: [
        {
            id: "th-product", name: "Product", backgroundId: "c-surface",
            h1StyleId: "t-title", h2StyleId: "t-heading", h3StyleId: "t-subheading", bodyStyleId: "t-body", accentStyleId: "t-label",
            linkId: "l-default", buttonId: "b-primary", cardId: "k-default", tagBackgroundId: "c-brand-tint",
        },
        {
            id: "th-editorial", name: "Editorial", backgroundId: "c-canvas",
            h1StyleId: "t-display", h2StyleId: "t-heading", h3StyleId: "t-subheading", bodyStyleId: "t-body", accentStyleId: "t-caption",
            linkId: "l-subtle", buttonId: "b-pill", cardId: "k-feature", tagBackgroundId: null,
        },
    ],
};

// New items start from sensible references to whatever exists.
export function newItem(kind: TokenKind, id: string, system: StyleSystem): any {
    const first = (k: TokenKind, preferred?: string) =>
        (system[k] as { id: string }[]).find(i => i.id === preferred)?.id ?? (system[k][0] as any)?.id ?? null;
    const n = system[kind].length + 1;
    switch (kind) {
        case "colors": return {id, name: `Color ${n}`, value: "#805ad5"};
        case "fonts": return {id, name: "Roboto", family: "Roboto", source: "google", fallback: "sans-serif", weights: [400]};
        case "spacing": return {id, name: `Step ${n}`, value: 48};
        case "radii": return {id, name: `Radius ${n}`, value: 12};
        case "textStyles": return {
            id, name: `Text style ${n}`, fontId: first("fonts"), size: 18, weight: 400, lineHeight: 1.5,
            letterSpacing: 0, uppercase: false, colorId: first("colors", "c-ink"),
        };
        case "buttons": return {
            id, name: `Button ${n}`, textStyleId: first("textStyles", "t-label"), textColorId: first("colors", "c-surface"),
            backgroundId: first("colors", "c-ink"), hoverBackgroundId: null, borderColorId: null,
            radiusId: first("radii", "r-md"), paddingXId: first("spacing", "s-5"), paddingYId: first("spacing", "s-3"),
        };
        case "links": return {
            id, name: `Link ${n}`, textStyleId: first("textStyles", "t-body"), colorId: first("colors", "c-brand"),
            hoverColorId: first("colors", "c-ink"), underline: "always",
        };
        case "themes": {
            const base = system.themes[0];
            if (base) return {...base, id, name: `Theme ${n}`};
            return {
                id, name: `Theme ${n}`, backgroundId: first("colors", "c-surface"),
                h1StyleId: first("textStyles", "t-title"), h2StyleId: first("textStyles", "t-heading"),
                h3StyleId: first("textStyles", "t-subheading"), bodyStyleId: first("textStyles", "t-body"),
                accentStyleId: first("textStyles", "t-label"), linkId: first("links"), buttonId: first("buttons"),
                cardId: first("cards"), tagBackgroundId: null,
            };
        }
        case "cards": return {
            id, name: `Card ${n}`, backgroundId: first("colors", "c-surface"), borderColorId: first("colors", "c-border"),
            radiusId: first("radii", "r-md"), paddingId: first("spacing", "s-5"), shadow: "md",
            titleStyleId: first("textStyles", "t-heading"), bodyStyleId: first("textStyles", "t-body"),
        };
    }
}

// ---------------------------------------------------------------------------
// Resolving references
// ---------------------------------------------------------------------------

export function find<T extends { id: string }>(list: T[], id: string | null | undefined): T | undefined {
    return id ? list.find(item => item.id === id) : undefined;
}

export function fontStack(font: FontToken | undefined) {
    if (!font) return "inherit";
    const family = font.source === "google" ? `'${font.family}'` : font.family;
    return `${family}, ${font.fallback}`;
}

export function colorValue(system: StyleSystem, id: string | null | undefined) {
    return find(system.colors, id)?.value;
}

export function sizeValue(list: SizeToken[], id: string | null | undefined) {
    return find(list, id)?.value ?? 0;
}

export function textStyleCss(system: StyleSystem, id: string | null | undefined): CSSProperties {
    const style = find(system.textStyles, id);
    if (!style) return {};
    return {
        fontFamily: fontStack(find(system.fonts, style.fontId)),
        fontSize: `${style.size}px`,
        fontWeight: style.weight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing ? `${style.letterSpacing}em` : undefined,
        textTransform: style.uppercase ? "uppercase" : undefined,
        color: colorValue(system, style.colorId),
    };
}

export function buttonCss(system: StyleSystem, b: ButtonElement) {
    const bg = colorValue(system, b.backgroundId);
    const border = colorValue(system, b.borderColorId);
    return {
        base: {
            ...textStyleCss(system, b.textStyleId),
            color: colorValue(system, b.textColorId),
            background: bg ?? "transparent",
            border: border ? `1px solid ${border}` : "1px solid transparent",
            borderRadius: `${sizeValue(system.radii, b.radiusId)}px`,
            padding: `${sizeValue(system.spacing, b.paddingYId)}px ${sizeValue(system.spacing, b.paddingXId)}px`,
            cursor: "pointer",
            transition: "background 120ms ease",
        } as CSSProperties,
        hover: {background: colorValue(system, b.hoverBackgroundId) ?? bg ?? "transparent"} as CSSProperties,
    };
}

export function linkCss(system: StyleSystem, l: LinkElement) {
    return {
        base: {
            ...textStyleCss(system, l.textStyleId),
            color: colorValue(system, l.colorId),
            textDecoration: l.underline === "always" ? "underline" : "none",
            cursor: "pointer",
        } as CSSProperties,
        hover: {
            color: colorValue(system, l.hoverColorId),
            textDecoration: l.underline === "none" ? "none" : "underline",
        } as CSSProperties,
    };
}

export function cardCss(system: StyleSystem, c: CardElement): CSSProperties {
    const border = colorValue(system, c.borderColorId);
    return {
        background: colorValue(system, c.backgroundId),
        border: border ? `1px solid ${border}` : "none",
        borderRadius: `${sizeValue(system.radii, c.radiusId)}px`,
        padding: `${sizeValue(system.spacing, c.paddingId)}px`,
        boxShadow: SHADOWS[c.shadow],
    };
}

// ---------------------------------------------------------------------------
// Usage: what references a given item
// ---------------------------------------------------------------------------

export type Usage = { kind: TokenKind, id: string, name: string };

export function usagesOf(system: StyleSystem, kind: TokenKind, id: string): Usage[] {
    const out: Usage[] = [];
    const add = (k: TokenKind, item: { id: string, name: string }) => out.push({kind: k, id: item.id, name: item.name});

    if (kind === "colors") {
        system.textStyles.forEach(t => t.colorId === id && add("textStyles", t));
        system.buttons.forEach(b => [b.textColorId, b.backgroundId, b.hoverBackgroundId, b.borderColorId].includes(id) && add("buttons", b));
        system.links.forEach(l => [l.colorId, l.hoverColorId].includes(id) && add("links", l));
        system.cards.forEach(c => [c.backgroundId, c.borderColorId].includes(id) && add("cards", c));
    }
    if (kind === "fonts") system.textStyles.forEach(t => t.fontId === id && add("textStyles", t));
    if (kind === "spacing") {
        system.buttons.forEach(b => [b.paddingXId, b.paddingYId].includes(id) && add("buttons", b));
        system.cards.forEach(c => c.paddingId === id && add("cards", c));
    }
    if (kind === "radii") {
        system.buttons.forEach(b => b.radiusId === id && add("buttons", b));
        system.cards.forEach(c => c.radiusId === id && add("cards", c));
    }
    system.themes.forEach(t => {
        const refs: Partial<Record<TokenKind, (string | null)[]>> = {
            colors: [t.backgroundId, t.tagBackgroundId],
            textStyles: [t.h1StyleId, t.h2StyleId, t.h3StyleId, t.bodyStyleId, t.accentStyleId],
            links: [t.linkId],
            buttons: [t.buttonId],
            cards: [t.cardId],
        };
        if (refs[kind]?.includes(id)) add("themes", t);
    });
    if (kind === "textStyles") {
        system.buttons.forEach(b => b.textStyleId === id && add("buttons", b));
        system.links.forEach(l => l.textStyleId === id && add("links", l));
        system.cards.forEach(c => [c.titleStyleId, c.bodyStyleId].includes(id) && add("cards", c));
    }
    return out;
}

// ---------------------------------------------------------------------------
// CSS output
// ---------------------------------------------------------------------------

export function slug(name: string) {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}

// Unique slugs per list, so two items named alike don't collide in the CSS.
function slugMap(list: { id: string, name: string }[]) {
    const seen: Record<string, number> = {};
    const map: Record<string, string> = {};
    for (const item of list) {
        const base = slug(item.name);
        seen[base] = (seen[base] ?? 0) + 1;
        map[item.id] = seen[base] > 1 ? `${base}-${seen[base]}` : base;
    }
    return map;
}

export function googleFontsUrl(fonts: FontToken[]) {
    const families = fonts
        .filter(f => f.source === "google" && f.family.trim())
        .map(f => {
            const weights = [...new Set(f.weights)].sort((a, b) => a - b);
            const name = f.family.trim().replace(/ /g, "+");
            return weights.length ? `family=${name}:wght@${weights.join(";")}` : `family=${name}`;
        });
    return families.length ? `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap` : null;
}

export function generateCss(system: StyleSystem) {
    const c = slugMap(system.colors);
    const f = slugMap(system.fonts);
    const s = slugMap(system.spacing);
    const r = slugMap(system.radii);
    const t = slugMap(system.textStyles);
    const lines: string[] = [];
    const color = (id: string | null) => id && c[id] ? `var(--color-${c[id]})` : null;
    const space = (id: string) => s[id] ? `var(--space-${s[id]})` : "0";
    const radius = (id: string) => r[id] ? `var(--radius-${r[id]})` : "0";

    const url = googleFontsUrl(system.fonts);
    if (url) lines.push(`@import url("${url}");`, "");

    lines.push("/* Primitives */", ":root {");
    system.colors.forEach(x => lines.push(`  --color-${c[x.id]}: ${x.value};`));
    system.fonts.forEach(x => lines.push(`  --font-${f[x.id]}: ${fontStack(x)};`));
    system.spacing.forEach(x => lines.push(`  --space-${s[x.id]}: ${x.value}px;`));
    system.radii.forEach(x => lines.push(`  --radius-${r[x.id]}: ${x.value}px;`));
    lines.push("}", "");

    const textDecls = (id: string) => {
        const ts = find(system.textStyles, id);
        if (!ts) return [];
        return [
            `font-family: ${f[ts.fontId] ? `var(--font-${f[ts.fontId]})` : "inherit"};`,
            `font-size: ${ts.size}px;`,
            `font-weight: ${ts.weight};`,
            `line-height: ${ts.lineHeight};`,
            ...(ts.letterSpacing ? [`letter-spacing: ${ts.letterSpacing}em;`] : []),
            ...(ts.uppercase ? ["text-transform: uppercase;"] : []),
        ];
    };
    const block = (selector: string, decls: (string | null | false)[]) => {
        lines.push(`${selector} {`);
        decls.filter(Boolean).forEach(d => lines.push(`  ${d}`));
        lines.push("}");
    };

    lines.push("/* Presets */");
    system.textStyles.forEach(ts => block(`.text-${t[ts.id]}`, [
        ...textDecls(ts.id),
        color(ts.colorId) && `color: ${color(ts.colorId)};`,
    ]));
    lines.push("");

    lines.push("/* Elements */");
    const b = slugMap(system.buttons);
    system.buttons.forEach(x => {
        const ts = find(system.textStyles, x.textStyleId);
        block(`.button-${b[x.id]}`, [
            ts && `/* text: ${ts.name} */`,
            ...textDecls(x.textStyleId),
            `color: ${color(x.textColorId) ?? "inherit"};`,
            `background: ${color(x.backgroundId) ?? "transparent"};`,
            `border: 1px solid ${color(x.borderColorId) ?? "transparent"};`,
            `border-radius: ${radius(x.radiusId)};`,
            `padding: ${space(x.paddingYId)} ${space(x.paddingXId)};`,
            "cursor: pointer;",
        ]);
        if (x.hoverBackgroundId) block(`.button-${b[x.id]}:hover`, [`background: ${color(x.hoverBackgroundId)};`]);
    });
    const l = slugMap(system.links);
    system.links.forEach(x => {
        const ts = find(system.textStyles, x.textStyleId);
        block(`.link-${l[x.id]}`, [
            ts && `/* text: ${ts.name} */`,
            ...textDecls(x.textStyleId),
            `color: ${color(x.colorId) ?? "inherit"};`,
            `text-decoration: ${x.underline === "always" ? "underline" : "none"};`,
        ]);
        block(`.link-${l[x.id]}:hover`, [
            `color: ${color(x.hoverColorId) ?? "inherit"};`,
            x.underline !== "none" && "text-decoration: underline;",
        ]);
    });
    const k = slugMap(system.cards);
    system.cards.forEach(x => {
        block(`.card-${k[x.id]}`, [
            `background: ${color(x.backgroundId) ?? "transparent"};`,
            `border: ${x.borderColorId ? `1px solid ${color(x.borderColorId)}` : "none"};`,
            `border-radius: ${radius(x.radiusId)};`,
            `padding: ${space(x.paddingId)};`,
            `box-shadow: ${SHADOWS[x.shadow]};`,
        ]);
        const title = find(system.textStyles, x.titleStyleId);
        const body = find(system.textStyles, x.bodyStyleId);
        if (title) block(`.card-${k[x.id]} .card-title`, [`/* text: ${title.name} */`, ...textDecls(title.id), color(title.colorId) && `color: ${color(title.colorId)};`]);
        if (body) block(`.card-${k[x.id]} .card-body`, [`/* text: ${body.name} */`, ...textDecls(body.id), color(body.colorId) && `color: ${color(body.colorId)};`]);
    });

    if (system.themes.length) {
        lines.push("", "/* Themes: add the class to a component's wrapper */");
        system.themes.forEach(theme => lines.push(...themeCss(system, theme, `.${themeClass(system, theme)}`).split("\n")));
    }

    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Theme CSS
// ---------------------------------------------------------------------------

function toDeclarations(style: CSSProperties) {
    return Object.entries(style)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${k.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}: ${v};`)
        .join(" ");
}

// CSS for one theme, scoped under `scope`. It styles plain content (headings,
// paragraphs, links, buttons) and the class names the editor's toolbar applies
// (typography-*, card-*, .container, .tag), so applying a theme restyles a whole
// component. Selectors are scoped twice over to win against the editor's defaults.
export function themeCss(system: StyleSystem, theme: ThemeToken, scope: string) {
    const rules: string[] = [];
    const rule = (selectors: string[], style: CSSProperties) => {
        const decls = toDeclarations(style);
        if (decls) rules.push(`${selectors.map(s => `${scope} ${s}`.trim()).join(", ")} { ${decls} }`);
    };
    const s = (sel: string) => [sel];

    rule(s(""), {...textStyleCss(system, theme.bodyStyleId), background: colorValue(system, theme.backgroundId)});
    rule(["h1", ".typography-heading"], {...textStyleCss(system, theme.h1StyleId), margin: "0 0 0.5em"});
    rule(["h2"], {...textStyleCss(system, theme.h2StyleId), margin: "1em 0 0.4em"});
    rule(["h3", "h4"], {...textStyleCss(system, theme.h3StyleId), margin: "1em 0 0.3em"});
    rule(["p", "li", ".typography-copy"], {...textStyleCss(system, theme.bodyStyleId)});
    rule([".typography-accent"], {...textStyleCss(system, theme.accentStyleId), background: "none", padding: 0, fontVariant: "normal"});

    const link = find(system.links, theme.linkId);
    if (link) {
        const css = linkCss(system, link);
        rule(["a:not(.tag):not(.button)"], css.base);
        rule(["a:not(.tag):not(.button):hover"], css.hover);
    }
    const button = find(system.buttons, theme.buttonId);
    if (button) {
        const css = buttonCss(system, button);
        rule(["button", ".button"], {...css.base, display: "inline-block", textDecoration: "none"});
        rule(["button:hover", ".button:hover"], css.hover);
    }
    const card = find(system.cards, theme.cardId);
    if (card) {
        rule([".container", "[class*='card-']"], cardCss(system, card));
        // A card's title style goes to its own top-level heading; nested headings keep the theme's.
        rule([".container > h1", ".container > h2", "[class*='card-'] > h1", "[class*='card-'] > h2"],
            {...textStyleCss(system, card.titleStyleId), marginTop: 0});
        rule([".container p", "[class*='card-'] p"], textStyleCss(system, card.bodyStyleId));
    }
    // Repeated class matches the builder's own `.tag.tag.tag.tag.tag` rule so the theme wins.
    rule([".tag.tag.tag.tag.tag"], {
        ...textStyleCss(system, theme.accentStyleId),
        background: colorValue(system, theme.tagBackgroundId) ?? "transparent",
        borderRadius: "999px",
        padding: theme.tagBackgroundId ? "2px 10px" : "0",
        margin: "0 6px 6px 0",
        textDecoration: "none",
    });
    rule(["img"], {borderRadius: card ? `${sizeValue(system.radii, card.radiusId)}px` : undefined});
    return rules.join("\n");
}

export function themeClass(system: StyleSystem, theme: ThemeToken) {
    return `theme-${slugMap(system.themes)[theme.id]}`;
}

// Basic shape check for state restored from localStorage.
export function isStyleSystem(value: any): value is StyleSystem {
    return value && (Object.keys(DEFAULT_SYSTEM) as TokenKind[]).every(k => Array.isArray(value[k]));
}
