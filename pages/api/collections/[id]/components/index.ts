import type {NextApiRequest, NextApiResponse} from "next";
import {getCollections, libraryDate, LIMITS, newId, saveCollections, StoredComponent} from "../../../../../lib/server/components";
import {guardWrite, handle, HttpError, methodNotAllowed, readBody, requireText, writeNamespace} from "../../../../../lib/server/http";

export const config = {api: {bodyParser: {sizeLimit: "16kb"}}};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const collectionId = String(req.query.id);
    return handle(res, async () => {
        if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
        await guardWrite(req);
        const body = readBody(req);
        const name = requireText(body.name, "A component name", LIMITS.titleChars);
        const description = requireText(body.description, "The description", LIMITS.descriptionChars, false);

        const ns = await writeNamespace(req, res);
        const collections = await getCollections(ns);
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) throw new HttpError(404, "Collection not found.");

        const component: StoredComponent = {
            id: newId(),
            name,
            description,
            published_at: "",
            modified_at: libraryDate(),
            modified_by: ns.kind === "owner" ? "Owner" : "Visitor",
            variant_count: "0",
            state: "new",
            datasources: [],
            collection_id: collectionId,
        };
        collection.components.unshift(component);
        await saveCollections(ns, collections);
        return res.status(201).json(component);
    });
}
