import type {NextApiRequest, NextApiResponse} from "next";
import {deleteComponentData, getCollections, LIMITS, saveCollections} from "../../../../lib/server/components";
import {guardWrite, handle, HttpError, methodNotAllowed, readBody, readNamespace, requireText, writeNamespace} from "../../../../lib/server/http";

export const config = {api: {bodyParser: {sizeLimit: "16kb"}}};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = String(req.query.id);
    return handle(res, async () => {
        if (req.method === "GET") {
            const collection = (await getCollections(readNamespace(req))).find(c => c.id === id);
            if (!collection) throw new HttpError(404, "Collection not found.");
            return res.status(200).json(collection);
        }
        if (req.method !== "PUT" && req.method !== "DELETE") return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);

        await guardWrite(req);
        const ns = await writeNamespace(req, res);
        const collections = await getCollections(ns);
        const collection = collections.find(c => c.id === id);
        if (!collection) throw new HttpError(404, "Collection not found.");

        if (req.method === "PUT") {
            collection.title = requireText(readBody(req).title, "A collection title", LIMITS.titleChars);
            await saveCollections(ns, collections);
            return res.status(200).json(collection);
        }
        await saveCollections(ns, collections.filter(c => c.id !== id));
        await Promise.all(collection.components.map(c => deleteComponentData(ns, c.id)));
        return res.status(200).json({id});
    });
}
