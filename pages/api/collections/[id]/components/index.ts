import type {NextApiRequest, NextApiResponse} from "next";
import {getCollections, handle, libraryDate, methodNotAllowed, newId, readBody, saveCollections, StoredComponent} from "../../../../../lib/server/components";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const collectionId = String(req.query.id);
    return handle(res, async () => {
        if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

        const {name, description} = readBody<{ name?: string, description?: string }>(req);
        if (!name?.trim()) return res.status(400).json({error: "A component needs a name."});

        const collections = await getCollections();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) return res.status(404).json({error: "Collection not found."});

        const component: StoredComponent = {
            id: newId(),
            name: name.trim(),
            description: description ?? "",
            published_at: "",
            modified_at: libraryDate(),
            modified_by: "You",
            variant_count: "0",
            state: "new",
            datasources: [],
            collection_id: collectionId,
        };
        collection.components.unshift(component);
        await saveCollections(collections);
        return res.status(201).json(component);
    });
}
