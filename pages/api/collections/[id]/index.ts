import type {NextApiRequest, NextApiResponse} from "next";
import {deleteComponentData, getCollections, handle, methodNotAllowed, readBody, saveCollections} from "../../../../lib/server/components";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = String(req.query.id);
    return handle(res, async () => {
        const collections = await getCollections();
        const collection = collections.find(c => c.id === id);
        if (!collection) return res.status(404).json({error: "Collection not found."});

        if (req.method === "GET") {
            return res.status(200).json(collection);
        }
        if (req.method === "PUT") {
            const {title} = readBody<{ title?: string }>(req);
            if (!title?.trim()) return res.status(400).json({error: "A collection needs a title."});
            collection.title = title.trim();
            await saveCollections(collections);
            return res.status(200).json(collection);
        }
        if (req.method === "DELETE") {
            await saveCollections(collections.filter(c => c.id !== id));
            await Promise.all(collection.components.map(c => deleteComponentData(c.id)));
            return res.status(200).json({id});
        }
        return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
    });
}
