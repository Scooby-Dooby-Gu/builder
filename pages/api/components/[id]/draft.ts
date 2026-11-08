import type {NextApiRequest, NextApiResponse} from "next";
import {getDraft, getPublished, handle, methodNotAllowed, readBody, saveDraft} from "../../../../lib/server/components";
import type {ComponentVariant} from "../../../../models/builder";

// The working copy the builder edits. Not public.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = String(req.query.id);
    return handle(res, async () => {
        if (req.method === "GET") {
            const [draft, published] = await Promise.all([getDraft(id), getPublished(id)]);
            return res.status(200).json({
                draft,
                published: published ? {version: published.version, publishedAt: published.publishedAt} : null,
            });
        }
        if (req.method === "PUT") {
            const {variants} = readBody<{ variants?: ComponentVariant[] }>(req);
            if (!Array.isArray(variants)) return res.status(400).json({error: "Send the component's variants."});
            const draft = await saveDraft(id, variants);
            return res.status(200).json({updatedAt: draft.updatedAt});
        }
        return methodNotAllowed(res, ["GET", "PUT"]);
    });
}
