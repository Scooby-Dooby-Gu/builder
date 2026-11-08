import type {NextApiRequest, NextApiResponse} from "next";
import {deleteComponentData, findComponent, getCollections, handle, libraryDate, methodNotAllowed, readBody, saveCollections} from "../../../../../lib/server/components";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const collectionId = String(req.query.id);
    const componentId = String(req.query.componentId);
    return handle(res, async () => {
        const collections = await getCollections();
        const found = findComponent(collections, componentId);
        if (!found) return res.status(404).json({error: "Component not found."});

        if (req.method === "PUT") {
            // The URL's collection is where the component should live, so this also moves it.
            const {name, description} = readBody<{ name?: string, description?: string }>(req);
            const target = collections.find(c => c.id === collectionId);
            if (!target) return res.status(404).json({error: "Collection not found."});
            const component = {
                ...found.component,
                name: name?.trim() || found.component.name,
                description: description ?? found.component.description,
                modified_at: libraryDate(),
                collection_id: collectionId,
            };
            found.collection.components = found.collection.components.filter(c => c.id !== componentId);
            target.components.unshift(component);
            await saveCollections(collections);
            return res.status(200).json(component);
        }
        if (req.method === "DELETE") {
            found.collection.components = found.collection.components.filter(c => c.id !== componentId);
            await saveCollections(collections);
            await deleteComponentData(componentId);
            return res.status(200).json({...found.component, collection_id: found.collection.id});
        }
        return methodNotAllowed(res, ["PUT", "DELETE"]);
    });
}
