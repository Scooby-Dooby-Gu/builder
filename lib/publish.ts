// Assembles what gets published for a component: the variant HTML plus everything
// needed to render it on another site (theme CSS, fonts, the data it binds to).

import {ComponentVariant} from "models/builder";
import {Datasource} from "models/datasource";
import {find, googleFontsUrl, StyleSystem, themeCss} from "utils/styleSystem";

// The root element embed.js renders into; theme CSS is scoped to it.
export const EMBED_ROOT = ".builder-root";

// Content defaults the editor normally provides (images, figures, data variables).
const CONTENT_CSS = `
${EMBED_ROOT} { display: block; }
${EMBED_ROOT} img { max-width: 100%; height: auto; display: block; }
${EMBED_ROOT} figure.image { margin: 0 0 1em; }
${EMBED_ROOT} figure.image-style-side { float: right; max-width: 50%; margin: 0 0 1em 1.5em; }
${EMBED_ROOT} var { font-style: inherit; }
${EMBED_ROOT} ul { padding-left: 0; list-style: none; }
${EMBED_ROOT} [hidden] { display: none !important; }
${EMBED_ROOT}::after { content: ""; display: table; clear: both; }
`;

// Data source ids referenced by bindings, e.g. data-path="0.store.books.*.title" -> "0".
function referencedDatasourceIds(html: string) {
    const ids = new Set<string>();
    for (const match of html.matchAll(/data-path(?:-[a-z]+)?="([^".]+)\./g)) ids.add(match[1]);
    return ids;
}

export function buildSnapshot({variants, system, themeId, datasources, builderStyles}: {
    variants: (ComponentVariant & { html?: string })[],
    system: StyleSystem,
    themeId: string | null | undefined,
    datasources: Datasource[],
    builderStyles: string,
}) {
    const published = variants
        .filter(v => !v.isDeleted)
        .map(v => ({id: v.id, name: v.name, html: (v.html ?? v.content ?? "").trim()}))
        .filter(v => v.html);

    const theme = find(system.themes, themeId);
    const ids = new Set<string>();
    published.forEach(v => referencedDatasourceIds(v.html).forEach(id => ids.add(id)));
    const data: Record<string, unknown> = {};
    ids.forEach(id => {
        const ds = datasources.find(d => String(d.id) === id);
        if (ds) data[id] = ds.sample;
    });

    const fontUrls = theme
        ? system.fonts.filter(f => f.source === "google").map(f => googleFontsUrl([f])).filter(Boolean) as string[]
        : [];

    return {
        themeName: theme?.name ?? null,
        variants: published,
        css: [builderStyles, CONTENT_CSS, theme ? themeCss(system, theme, EMBED_ROOT) : ""].join("\n"),
        fontUrls,
        data,
    };
}

export function embedSnippet(componentId: string, origin = typeof window !== "undefined" ? window.location.origin : "") {
    return `<script src="${origin}/embed.js" async></script>\n<builder-component component="${componentId}"></builder-component>`;
}
