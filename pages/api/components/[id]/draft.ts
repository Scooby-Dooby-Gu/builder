import type {NextApiRequest, NextApiResponse} from "next";
import {getDraft, getPublished, saveDraft} from "../../../../lib/server/components";
import {guardWrite, handle, methodNotAllowed, readBody, readNamespace, writeNamespace} from "../../../../lib/server/http";
import {variantFingerprints} from "../../../../lib/machines/componentStatus";

export const config = {api: {bodyParser: {sizeLimit: "400kb"}}};

// The working copy the builder edits: the owner's live draft, or a visitor's sandbox copy.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = String(req.query.id);
    return handle(res, async () => {
        if (req.method === "GET") {
            const ns = readNamespace(req);
            const [draft, published] = await Promise.all([getDraft(ns, id), getPublished(ns, id)]);
            return res.status(200).json({
                draft,
                // Fingerprints let the builder tell which variants changed since publishing.
                published: published ? {version: published.version, publishedAt: published.publishedAt, variants: variantFingerprints(published.variants)} : null,
            });
        }
        if (req.method === "PUT") {
            await guardWrite(req);
            const ns = await writeNamespace(req, res);
            const draft = await saveDraft(ns, id, readBody(req).variants);
            return res.status(200).json({updatedAt: draft.updatedAt});
        }
        return methodNotAllowed(res, ["GET", "PUT"]);
    });
}
