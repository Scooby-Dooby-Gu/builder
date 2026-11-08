import type {NextApiRequest, NextApiResponse} from "next";
import {handle, methodNotAllowed, publish, PublishedVariant, readBody} from "../../../../lib/server/components";

// Publishes a snapshot assembled by the builder: variant HTML, resolved theme CSS,
// font stylesheets and the data the bindings read from.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = String(req.query.id);
    return handle(res, async () => {
        if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
        const body = readBody(req);
        const variants: PublishedVariant[] = Array.isArray(body.variants) ? body.variants : [];
        if (!variants.length) return res.status(400).json({error: "There's nothing to publish yet. Add content to a variant first."});

        const published = await publish(id, {
            themeName: body.themeName ?? null,
            variants: variants.map(v => ({id: String(v.id), name: String(v.name ?? ""), html: String(v.html ?? "")})),
            css: String(body.css ?? ""),
            fontUrls: Array.isArray(body.fontUrls) ? body.fontUrls.map(String) : [],
            data: body.data && typeof body.data === "object" ? body.data : {},
        });
        return res.status(200).json({version: published.version, publishedAt: published.publishedAt});
    });
}
