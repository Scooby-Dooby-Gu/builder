// The style system is built in layers. Each layer references the one below by id,
// so changing a primitive flows through every preset and element that uses it.
//
//   primitives  colors, fonts, spacing, radii, breakpoints
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
export type BreakpointToken = { id: string, name: string, width: number };
export type TextStyle = {
    id: string,
    name: string,
    fontId: string,
    size: number,
    weight: number,
    lineHeight: number,
    letterSpacing: number,
    uppercase: boolean,
    // Font size from a breakpoint's width upward, by breakpoint id. `size` applies below them.
    sizes?: Record<string, number>,
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
    breakpoints: BreakpointToken[],
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
    breakpoints: "breakpoint",
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
        {id: "tp-warm-bg", name: "Warm paper", value: "#fbf7f0"},
        {id: "tp-warm-ink", name: "Roast", value: "#352b25"},
        {id: "tp-warm-text", name: "Cocoa", value: "#66584d"},
        {id: "tp-warm-muted", name: "Clay gray", value: "#8c7b6a"},
        {id: "tp-warm-border", name: "Oat border", value: "#e8ded1"},
        {id: "tp-warm-brand", name: "Terracotta", value: "#b65e3c"},
        {id: "tp-warm-brand-dark", name: "Burnt sienna", value: "#8f442c"},
        {id: "tp-warm-tint", name: "Oat", value: "#f2e5d6"},
        {id: "tp-warm-card", name: "Ivory", value: "#fffcf7"},
        {id: "tp-botanical-bg", name: "Mist", value: "#f3f7f1"},
        {id: "tp-botanical-ink", name: "Pine", value: "#1f302a"},
        {id: "tp-botanical-text", name: "Fern", value: "#4f6259"},
        {id: "tp-botanical-muted", name: "Sage gray", value: "#728178"},
        {id: "tp-botanical-border", name: "Leaf border", value: "#dce6dd"},
        {id: "tp-botanical-brand", name: "Forest", value: "#3e7058"},
        {id: "tp-botanical-brand-dark", name: "Deep forest", value: "#2d5240"},
        {id: "tp-botanical-tint", name: "Pale leaf", value: "#e3eee6"},
        {id: "tp-botanical-accent", name: "Moss", value: "#a97b48"},
        {id: "tp-midnight-bg", name: "Midnight", value: "#111827"},
        {id: "tp-midnight-ink", name: "Cloud", value: "#f8fafc"},
        {id: "tp-midnight-text", name: "Silver", value: "#cbd5e1"},
        {id: "tp-midnight-muted", name: "Moonstone", value: "#94a3b8"},
        {id: "tp-midnight-border", name: "Slate border", value: "#334155"},
        {id: "tp-midnight-brand", name: "Sky", value: "#7dd3fc"},
        {id: "tp-midnight-brand-dark", name: "Bright sky", value: "#38bdf8"},
        {id: "tp-midnight-tint", name: "Night blue", value: "#1e293b"},
        {id: "tp-midnight-accent", name: "Orchid", value: "#e9a8f5"},
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
    breakpoints: [
        {id: "bp-mobile", name: "Mobile", width: 375},
        {id: "bp-tablet", name: "Tablet", width: 768},
        {id: "bp-laptop", name: "Laptop", width: 1024},
        {id: "bp-desktop", name: "Desktop", width: 1280},
    ],
    textStyles: [
        {id: "t-display", name: "Display", fontId: "f-lora", size: 32, sizes: {"bp-tablet": 40, "bp-laptop": 48}, weight: 700, lineHeight: 1.1, letterSpacing: -0.01, uppercase: false, colorId: "c-ink"},
        {id: "t-title", name: "Title", fontId: "f-inter", size: 26, sizes: {"bp-tablet": 32}, weight: 700, lineHeight: 1.2, letterSpacing: -0.01, uppercase: false, colorId: "c-ink"},
        {id: "t-heading", name: "Heading", fontId: "f-inter", size: 21, sizes: {"bp-tablet": 24}, weight: 600, lineHeight: 1.3, letterSpacing: -0.005, uppercase: false, colorId: "c-ink"},
        {id: "t-subheading", name: "Subheading", fontId: "f-inter", size: 18, weight: 600, lineHeight: 1.4, letterSpacing: 0, uppercase: false, colorId: "c-ink"},
        {id: "t-body", name: "Body", fontId: "f-inter", size: 16, weight: 400, lineHeight: 1.6, letterSpacing: 0, uppercase: false, colorId: "c-slate"},
        {id: "t-caption", name: "Caption", fontId: "f-inter", size: 13, weight: 400, lineHeight: 1.4, letterSpacing: 0, uppercase: false, colorId: "c-muted"},
        {id: "t-label", name: "Label", fontId: "f-inter", size: 13, weight: 600, lineHeight: 1.2, letterSpacing: 0.06, uppercase: true, colorId: "c-ink"},
        {id: "t-code", name: "Code", fontId: "f-mono", size: 14, weight: 400, lineHeight: 1.5, letterSpacing: 0, uppercase: false, colorId: "c-ink"},
        {id: "tp-warm-display", name: "Warm display", fontId: "f-lora", size: 34, sizes: {"bp-tablet": 42, "bp-laptop": 50}, weight: 700, lineHeight: 1.08, letterSpacing: -0.02, uppercase: false, colorId: "tp-warm-ink"},
        {id: "tp-warm-heading", name: "Warm heading", fontId: "f-inter", size: 23, weight: 600, lineHeight: 1.25, letterSpacing: -0.01, uppercase: false, colorId: "tp-warm-ink"},
        {id: "tp-warm-subheading", name: "Warm subheading", fontId: "f-inter", size: 17, weight: 600, lineHeight: 1.35, letterSpacing: 0, uppercase: false, colorId: "tp-warm-ink"},
        {id: "tp-warm-body", name: "Warm body", fontId: "f-inter", size: 16, weight: 400, lineHeight: 1.65, letterSpacing: 0, uppercase: false, colorId: "tp-warm-text"},
        {id: "tp-warm-accent", name: "Warm accent", fontId: "f-inter", size: 12, weight: 700, lineHeight: 1.2, letterSpacing: 0.1, uppercase: true, colorId: "tp-warm-brand"},
        {id: "tp-botanical-display", name: "Botanical display", fontId: "f-lora", size: 34, sizes: {"bp-tablet": 42, "bp-laptop": 50}, weight: 600, lineHeight: 1.12, letterSpacing: -0.015, uppercase: false, colorId: "tp-botanical-ink"},
        {id: "tp-botanical-heading", name: "Botanical heading", fontId: "f-inter", size: 23, weight: 600, lineHeight: 1.28, letterSpacing: -0.01, uppercase: false, colorId: "tp-botanical-ink"},
        {id: "tp-botanical-subheading", name: "Botanical subheading", fontId: "f-inter", size: 17, weight: 600, lineHeight: 1.35, letterSpacing: 0, uppercase: false, colorId: "tp-botanical-ink"},
        {id: "tp-botanical-body", name: "Botanical body", fontId: "f-inter", size: 16, weight: 400, lineHeight: 1.65, letterSpacing: 0, uppercase: false, colorId: "tp-botanical-text"},
        {id: "tp-botanical-accent", name: "Botanical accent", fontId: "f-inter", size: 12, weight: 700, lineHeight: 1.2, letterSpacing: 0.1, uppercase: true, colorId: "tp-botanical-brand"},
        {id: "tp-midnight-display", name: "Midnight display", fontId: "f-inter", size: 34, sizes: {"bp-tablet": 42, "bp-laptop": 50}, weight: 700, lineHeight: 1.08, letterSpacing: -0.025, uppercase: false, colorId: "tp-midnight-ink"},
        {id: "tp-midnight-heading", name: "Midnight heading", fontId: "f-inter", size: 23, weight: 600, lineHeight: 1.25, letterSpacing: -0.01, uppercase: false, colorId: "tp-midnight-ink"},
        {id: "tp-midnight-subheading", name: "Midnight subheading", fontId: "f-inter", size: 17, weight: 600, lineHeight: 1.35, letterSpacing: 0, uppercase: false, colorId: "tp-midnight-ink"},
        {id: "tp-midnight-body", name: "Midnight body", fontId: "f-inter", size: 16, weight: 400, lineHeight: 1.65, letterSpacing: 0, uppercase: false, colorId: "tp-midnight-text"},
        {id: "tp-midnight-accent", name: "Midnight accent", fontId: "f-inter", size: 12, weight: 700, lineHeight: 1.2, letterSpacing: 0.1, uppercase: true, colorId: "tp-midnight-brand"},
    ],
    buttons: [
        {id: "b-primary", name: "Primary", textStyleId: "t-label", textColorId: "c-surface", backgroundId: "c-brand", hoverBackgroundId: "c-brand-dark", borderColorId: null, radiusId: "r-md", paddingXId: "s-5", paddingYId: "s-3"},
        {id: "b-secondary", name: "Secondary", textStyleId: "t-label", textColorId: "c-brand", backgroundId: null, hoverBackgroundId: "c-brand-tint", borderColorId: "c-brand", radiusId: "r-md", paddingXId: "s-5", paddingYId: "s-3"},
        {id: "b-pill", name: "Pill", textStyleId: "t-label", textColorId: "c-surface", backgroundId: "c-accent", hoverBackgroundId: "c-ink", borderColorId: null, radiusId: "r-full", paddingXId: "s-6", paddingYId: "s-2"},
        {id: "tp-warm-button", name: "Terracotta", textStyleId: "t-label", textColorId: "tp-warm-card", backgroundId: "tp-warm-brand", hoverBackgroundId: "tp-warm-brand-dark", borderColorId: null, radiusId: "r-md", paddingXId: "s-5", paddingYId: "s-3"},
        {id: "tp-botanical-button", name: "Forest", textStyleId: "t-label", textColorId: "tp-botanical-bg", backgroundId: "tp-botanical-brand", hoverBackgroundId: "tp-botanical-brand-dark", borderColorId: null, radiusId: "r-md", paddingXId: "s-5", paddingYId: "s-3"},
        {id: "tp-midnight-button", name: "Sky", textStyleId: "t-label", textColorId: "tp-midnight-bg", backgroundId: "tp-midnight-brand", hoverBackgroundId: "tp-midnight-brand-dark", borderColorId: null, radiusId: "r-md", paddingXId: "s-5", paddingYId: "s-3"},
    ],
    links: [
        {id: "l-default", name: "Default", textStyleId: "t-body", colorId: "c-brand", hoverColorId: "c-brand-dark", underline: "hover"},
        {id: "l-subtle", name: "Subtle", textStyleId: "t-caption", colorId: "c-muted", hoverColorId: "c-ink", underline: "always"},
        {id: "tp-warm-link", name: "Terracotta", textStyleId: "tp-warm-body", colorId: "tp-warm-brand", hoverColorId: "tp-warm-brand-dark", underline: "hover"},
        {id: "tp-botanical-link", name: "Forest", textStyleId: "tp-botanical-body", colorId: "tp-botanical-brand", hoverColorId: "tp-botanical-brand-dark", underline: "hover"},
        {id: "tp-midnight-link", name: "Sky", textStyleId: "tp-midnight-body", colorId: "tp-midnight-brand", hoverColorId: "tp-midnight-brand-dark", underline: "hover"},
    ],
    cards: [
        {id: "k-default", name: "Default", backgroundId: "c-surface", borderColorId: "c-border", radiusId: "r-md", paddingId: "s-5", shadow: "sm", titleStyleId: "t-heading", bodyStyleId: "t-body"},
        {id: "k-feature", name: "Feature", backgroundId: "c-brand-tint", borderColorId: null, radiusId: "r-lg", paddingId: "s-6", shadow: "none", titleStyleId: "t-heading", bodyStyleId: "t-body"},
        {id: "tp-warm-card", name: "Warm paper", backgroundId: "tp-warm-card", borderColorId: "tp-warm-border", radiusId: "r-lg", paddingId: "s-5", shadow: "sm", titleStyleId: "tp-warm-heading", bodyStyleId: "tp-warm-body"},
        {id: "tp-botanical-card", name: "Pale leaf", backgroundId: "tp-botanical-tint", borderColorId: "tp-botanical-border", radiusId: "r-lg", paddingId: "s-5", shadow: "sm", titleStyleId: "tp-botanical-heading", bodyStyleId: "tp-botanical-body"},
        {id: "tp-midnight-card", name: "Night blue", backgroundId: "tp-midnight-tint", borderColorId: "tp-midnight-border", radiusId: "r-lg", paddingId: "s-5", shadow: "md", titleStyleId: "tp-midnight-heading", bodyStyleId: "tp-midnight-body"},
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
        {
            id: "tp-theme-warm", name: "Warm Studio", backgroundId: "tp-warm-bg",
            h1StyleId: "tp-warm-display", h2StyleId: "tp-warm-heading", h3StyleId: "tp-warm-subheading", bodyStyleId: "tp-warm-body", accentStyleId: "tp-warm-accent",
            linkId: "tp-warm-link", buttonId: "tp-warm-button", cardId: "tp-warm-card", tagBackgroundId: "tp-warm-tint",
        },
        {
            id: "tp-theme-botanical", name: "Botanical", backgroundId: "tp-botanical-bg",
            h1StyleId: "tp-botanical-display", h2StyleId: "tp-botanical-heading", h3StyleId: "tp-botanical-subheading", bodyStyleId: "tp-botanical-body", accentStyleId: "tp-botanical-accent",
            linkId: "tp-botanical-link", buttonId: "tp-botanical-button", cardId: "tp-botanical-card", tagBackgroundId: "tp-botanical-tint",
        },
        {
            id: "tp-theme-midnight", name: "Midnight", backgroundId: "tp-midnight-bg",
            h1StyleId: "tp-midnight-display", h2StyleId: "tp-midnight-heading", h3StyleId: "tp-midnight-subheading", bodyStyleId: "tp-midnight-body", accentStyleId: "tp-midnight-accent",
            linkId: "tp-midnight-link", buttonId: "tp-midnight-button", cardId: "tp-midnight-card", tagBackgroundId: "tp-midnight-tint",
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
        case "breakpoints": return {id, name: `Breakpoint ${n}`, width: 1440};
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

// Size overrides for a text style, smallest breakpoint first.
export function responsiveSizes(system: StyleSystem, id: string | null | undefined) {
    const style = find(system.textStyles, id);
    if (!style?.sizes) return [];
    return system.breakpoints
        .filter(b => style.sizes[b.id] != null)
        .sort((x, y) => x.width - y.width)
        .map(b => ({breakpoint: b, size: style.sizes[b.id]}));
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
    if (kind === "breakpoints") system.textStyles.forEach(t => t.sizes?.[id] != null && add("textStyles", t));
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
    const bp = slugMap(system.breakpoints);
    system.breakpoints.forEach(x => lines.push(`  --breakpoint-${bp[x.id]}: ${x.width}px;`));
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
    system.textStyles.forEach(ts => responsiveSizes(system, ts.id).forEach(({breakpoint, size}) => {
        lines.push(`@media (min-width: ${breakpoint.width}px) { .text-${t[ts.id]} { font-size: ${size}px; } } /* ${breakpoint.name} */`);
    }));
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
// paragraphs, links) and the class names the editor's pickers apply (buttons,
// surfaces, typography, tags), so applying a theme restyles a whole component.
// It is layered on top of lib/componentCss.ts.
export function themeCss(system: StyleSystem, theme: ThemeToken, scope: string) {
    const rules: string[] = [];
    const rule = (selectors: string[], style: CSSProperties) => {
        const decls = toDeclarations(style);
        if (decls) rules.push(`${selectors.map(s => `${scope} ${s}`.trim()).join(", ")} { ${decls} }`);
    };
    const s = (sel: string) => [sel];
    // Responsive sizes follow the width of the themed element (a container query),
    // so the builder's breakpoint preview resizes text even in a wide window.
    const sized = (selectors: string[], styleId: string | null | undefined) => {
        responsiveSizes(system, styleId).forEach(({breakpoint, size}) => {
            rules.push(`@container (min-width: ${breakpoint.width}px) { ${selectors.map(sel => `${scope} ${sel}`.trim()).join(", ")} { font-size: ${size}px; } }`);
        });
    };

    const body = find(system.textStyles, theme.bodyStyleId);

    rule(s(""), {...textStyleCss(system, theme.bodyStyleId), background: colorValue(system, theme.backgroundId), containerType: "inline-size"} as CSSProperties);

    // Headings. Display (typography-heading) uses the theme's Heading 1 style.
    rule(["h1", ".typography-heading"], {...textStyleCss(system, theme.h1StyleId), margin: "0 0 0.4em"});
    sized(["h1", ".typography-heading"], theme.h1StyleId);
    rule(["h2:not(.typography-heading)"], {...textStyleCss(system, theme.h2StyleId), margin: "0 0 0.5em"});
    sized(["h2:not(.typography-heading)"], theme.h2StyleId);
    rule(["h3", "h4"], {...textStyleCss(system, theme.h3StyleId), margin: "0 0 0.4em"});
    sized(["h3", "h4"], theme.h3StyleId);

    // Body text, lead, eyebrow and small print.
    rule(["p", "li", "blockquote"], {...textStyleCss(system, theme.bodyStyleId)});
    sized(["p", "li"], theme.bodyStyleId);
    if (body) {
        rule([".typography-copy"], {fontSize: `${Math.round(body.size * 1.2)}px`, lineHeight: body.lineHeight});
        rule(["blockquote p"], {fontSize: `${Math.round(body.size * 1.35)}px`, lineHeight: 1.45});
        rule([".typography-small"], {fontSize: `${Math.max(12, Math.round(body.size * 0.82))}px`});
    }
    rule([".typography-accent"], {...textStyleCss(system, theme.accentStyleId), background: "none", padding: 0, fontVariant: "normal"});
    sized([".typography-accent"], theme.accentStyleId);

    // Links, then buttons (paragraphs styled as buttons hold a link).
    const link = find(system.links, theme.linkId);
    if (link) {
        const css = linkCss(system, link);
        rule(["a"], css.base);
        rule(["a:hover"], css.hover);
        rule([".button-link > a"], {...css.base, fontWeight: 600, textDecoration: "none"});
    }
    const button = find(system.buttons, theme.buttonId);
    const buttonBg = button ? colorValue(system, button.backgroundId) ?? colorValue(system, button.borderColorId) : undefined;
    const buttonText = button ? colorValue(system, button.textColorId) : undefined;
    if (button) {
        const css = buttonCss(system, button);
        rule([".button > a"], {...css.base, display: "inline-block", textDecoration: "none"});
        rule([".button > a:hover"], {...css.hover, textDecoration: "none"});
        rule([".button-secondary > a"], {
            ...css.base,
            display: "inline-block",
            textDecoration: "none",
            background: "transparent",
            color: buttonBg ?? css.base.color,
            border: `1px solid ${buttonBg ?? "currentColor"}`,
        });
    }

    // Surfaces.
    const card = find(system.cards, theme.cardId);
    if (card) {
        const surface = cardCss(system, card);
        rule([".card", ".card-minimal"], surface);
        rule([".card-highlight", ".card-promo"], {...surface, border: `2px solid ${buttonBg ?? "currentColor"}`});
        rule([".card-tint"], {...surface, border: "none", boxShadow: "none", background: colorValue(system, theme.tagBackgroundId) ?? surface.background});
        // A card's title style goes to its own top-level heading; nested headings keep the theme's.
        const titles = [".card > h2:not(.typography-heading)", ".card > h3", ".card-highlight > h2:not(.typography-heading)", ".card-highlight > h3"];
        rule(titles, {...textStyleCss(system, card.titleStyleId), marginTop: 0});
        sized(titles, card.titleStyleId);
        rule([".card p", ".card-highlight p", ".card li", ".card-highlight li"], textStyleCss(system, card.bodyStyleId));
        sized([".card p", ".card-highlight p"], card.bodyStyleId);
        rule([".card li::before", ".card-highlight li::before", ".card-tint li::before"], {color: buttonBg});
    }
    // Dark panel: the theme's button color as a brand band, with inverted buttons.
    if (buttonBg) {
        rule([".card-dark", ".card-lavish"], {background: buttonBg, color: buttonText});
        rule([".card-dark h1", ".card-dark h2", ".card-dark h3", ".card-dark p", ".card-dark li", ".card-dark .typography-accent", ".card-dark a"], {color: buttonText});
        rule([".card-dark .button > a"], {background: buttonText, color: buttonBg, borderColor: buttonText});
        rule([".card-dark .button-secondary > a"], {background: "transparent", color: buttonText, borderColor: buttonText});
    }
    rule([".typography-accent"], {color: buttonBg});
    rule([".card-dark .typography-accent"], {color: buttonText, opacity: 0.8} as CSSProperties);

    rule([".tag"], {
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

// Saved style guides from before a layer existed get that layer's defaults,
// so adding a layer never wipes someone's work.
export function withMissingLayers(value: any): StyleSystem | null {
    if (!value || typeof value !== "object") return null;
    const core: TokenKind[] = ["colors", "fonts", "spacing", "radii", "textStyles"];
    if (!core.every(k => Array.isArray(value[k]))) return null;
    const out = {...value};
    (Object.keys(DEFAULT_SYSTEM) as TokenKind[]).forEach(k => {
        if (!Array.isArray(out[k])) out[k] = JSON.parse(JSON.stringify(DEFAULT_SYSTEM[k]));
    });
    return out as StyleSystem;
}
