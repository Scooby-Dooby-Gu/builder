import type {NextApiRequest, NextApiResponse} from "next";
import {getCollections, handle, methodNotAllowed, newId, readBody, saveCollections} from "../../../lib/server/components";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return handle(res, async () => {
        if (req.method === "GET") {
            return res.status(200).json(await getCollections());
        }
        if (req.method === "POST") {
            const {title} = readBody<{ title?: string }>(req);
            if (!title?.trim()) return res.status(400).json({error: "A collection needs a title."});
            const collections = await getCollections();
            const collection = {id: newId(), title: title.trim(), components: []};
            await saveCollections([collection, ...collections]);
            return res.status(201).json(collection);
        }
        return methodNotAllowed(res, ["GET", "POST"]);
    });
}
