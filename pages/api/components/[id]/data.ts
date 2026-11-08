import type {NextApiRequest, NextApiResponse} from "next";
import {getPublished} from "../../../../lib/server/components";
import {getSavedDatasources, requestDatasource} from "../../../../lib/server/datasources";
import {handle, LIVE, methodNotAllowed, rateLimit} from "../../../../lib/server/http";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = String(req.query.id);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    if (req.method === "OPTIONS") return res.status(204).end();
    return handle(res, async () => {
        if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
        await rateLimit(req, "embed-data", 180, 60);
        const published = await getPublished(LIVE, id);
        if (!published) return res.status(404).json({error: "Component not found."});
        const ids = published.liveDatasourceIds || [];
        if (!ids.length) return res.status(200).json({data: {}});
        const sources = await getSavedDatasources(LIVE);
        const data: Record<string, unknown> = {};
        await Promise.all(ids.map(async sourceId => {
            const source = sources.find(item => item.id === sourceId);
            if (!source) return;
            try { data[sourceId] = await requestDatasource(source); }
            catch { /* Preserve the published sample for this source if its API is unavailable. */ }
        }));
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json({data});
    });
}
