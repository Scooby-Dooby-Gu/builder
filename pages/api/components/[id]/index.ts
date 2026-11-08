import type {NextApiRequest, NextApiResponse} from "next";
import {getPublished, handle, methodNotAllowed} from "../../../../lib/server/components";

// Public endpoint read by embed.js on other sites: the latest published version.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = String(req.query.id);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    if (req.method === "OPTIONS") return res.status(204).end();

    return handle(res, async () => {
        if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
        const published = await getPublished(id);
        if (!published) return res.status(404).json({error: `Component ${id} hasn't been published.`});
        // Short edge cache so a new publish shows up within about a minute.
        res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
        return res.status(200).json(published);
    });
}
