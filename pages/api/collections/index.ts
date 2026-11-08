import type {NextApiRequest, NextApiResponse} from "next";
import {getCollections, LIMITS, newId, saveCollections} from "../../../lib/server/components";
import {guardWrite, handle, methodNotAllowed, readBody, readNamespace, requireText, writeNamespace} from "../../../lib/server/http";

export const config = {api: {bodyParser: {sizeLimit: "16kb"}}};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return handle(res, async () => {
        if (req.method === "GET") {
            return res.status(200).json(await getCollections(readNamespace(req)));
        }
        if (req.method === "POST") {
            await guardWrite(req);
            const title = requireText(readBody(req).title, "A collection title", LIMITS.titleChars);
            const ns = await writeNamespace(req, res);
            const collections = await getCollections(ns);
            const collection = {id: newId(), title, components: []};
            await saveCollections(ns, [collection, ...collections]);
            return res.status(201).json(collection);
        }
        return methodNotAllowed(res, ["GET", "POST"]);
    });
}
