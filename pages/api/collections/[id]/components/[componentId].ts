import type {NextApiRequest, NextApiResponse} from 'next';
import collections from "../../../../../data/collections.json";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method === "DELETE") {
        return res.status(200).json({
            ...collections[0].components[0],
            id: req.query.componentId,
            collection_id: req.query.id
        });
    }

    if (req.method === "PUT") {
        const {name, description} = JSON.parse(req.body);

        return res.status(200).json({
            ...collections[0].components[0],
            name,
            description,
            id: req.query.componentId,
            collection_id: req.query.id
        });
    }
}
