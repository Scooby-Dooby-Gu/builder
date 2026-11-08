import React, {useMemo} from "react";
import {componentBaseCss} from "../../../lib/componentCss";

const previewCss = `${componentBaseCss(".preview")}
html, body { margin: 0; padding: 0; background: #fff; }
.preview { box-sizing: border-box; min-height: 100%; padding: 16px; overflow: hidden; }
.preview, .preview * { box-sizing: border-box; }
.preview .typography-heading { font-size: clamp(24px, 7vw, 40px); }
.preview .spacing-large { padding: 36px 20px; }
.preview .layout-split { gap: 20px; }
.preview img { max-height: 110px; object-fit: cover; }
`;

export default function ComponentThumbnail({html, title}: {html: string, title: string}) {
    const srcDoc = useMemo(() => {
        // The sandbox blocks scripts and gives the preview an isolated origin.
        // Drop active embeds in case a saved draft contains markup outside the editor.
        const safeMarkup = html
            .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
            .replace(/<(iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
            .replace(/<(iframe|object|embed|form)\b[^>]*\/?>/gi, "")
            .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
        return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="/"><style>${previewCss}</style></head><body><main class="preview">${safeMarkup}</main></body></html>`;
    }, [html]);

    return <iframe
        title={`${title} first variant preview`}
        srcDoc={srcDoc}
        sandbox=""
        tabIndex={-1}
        aria-hidden="true"
        style={{width: "100%", height: "232px", border: 0, display: "block", pointerEvents: "none", background: "white"}}
    />;
}
