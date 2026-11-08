import type {NextApiRequest, NextApiResponse} from "next";
import {deleteComponentData, findComponent, getCollections, libraryDate, LIMITS, saveCollections} from "../../../../../lib/server/components";
import {guardWrite, handle, HttpError, methodNotAllowed, readBody, requireText, writeNamespace} from "../../../../../lib/server/http";

export const config = {api: {bodyParser: {sizeLimit: "16kb"}}};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const collectionId = String(req.query.id);
    const componentId = String(req.query.componentId);
    return handle(res, async () => {
        if (req.method !== "PUT" && req.method !== "DELETE") return methodNotAllowed(res, ["PUT", "DELETE"]);
        await guardWrite(req);
        const ns = await writeNamespace(req, res);
        const collections = await getCollections(ns);
        const found = findComponent(collections, componentId);
        if (!found) throw new HttpError(404, "Component not found.");

        if (req.method === "PUT") {
            // The URL's collection is where the component should live, so this also moves it.
            const body = readBody(req);
            const target = collections.find(c => c.id === collectionId);
            if (!target) throw new HttpError(404, "Collection not found.");
            const component = {
                ...found.component,
                name: requireText(body.name, "A component name", LIMITS.titleChars),
                description: requireText(body.description, "The description", LIMITS.descriptionChars, false),
                modified_at: libraryDate(),
                collection_id: collectionId,
            };
            found.collection.components = found.collection.components.filter(c => c.id !== componentId);
            target.components.unshift(component);
            await saveCollections(ns, collections);
            return res.status(200).json(component);
        }
        found.collection.components = found.collection.components.filter(c => c.id !== componentId);
        await saveCollections(ns, collections);
        await deleteComponentData(ns, componentId);
        return res.status(200).json({...found.component, collection_id: found.collection.id});
    });
}
