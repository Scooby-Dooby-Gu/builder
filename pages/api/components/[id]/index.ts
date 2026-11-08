import type {NextApiRequest, NextApiResponse} from "next";
import {getPublished} from "../../../../lib/server/components";
import {handle, LIVE, methodNotAllowed, rateLimit, readNamespace} from "../../../../lib/server/http";

// Public endpoint read by embed.js: the latest live published version, cached at
// the edge. With ?preview=1 on the Builder site itself, a visitor sees their own
// sandbox publish instead (never cached).
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = String(req.query.id);
    const preview = req.query.preview === "1";
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    if (req.method === "OPTIONS") return res.status(204).end();

    return handle(res, async () => {
        if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
        const published = await getPublished(preview ? readNamespace(req) : LIVE, id);
        if (!published) {
            // Unknown ids are limited, and the 404 is cached briefly, so they can't be used to hammer the store.
            await rateLimit(req, "embed-miss", 120, 60);
        }
        res.setHeader("Cache-Control", preview ? "private, no-store" : "public, s-maxage=30, stale-while-revalidate=60");
        if (!published) return res.status(404).json({error: `Component ${id} hasn't been published.`});
        return res.status(200).json(published);
    });
}
