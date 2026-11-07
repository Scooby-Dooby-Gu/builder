import type {NextApiRequest, NextApiResponse} from 'next';
import collections from "../../../../data/collections.json";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method === "GET") {
        return res.status(200).json(collections);
    }

    if (req.method === "DELETE") {
        const id = req.query.id;

        return res.status(200).json({
            id,
        });
    }

    if (req.method === "PUT") {
        const title = JSON.parse(req.body).title;

        return res.status(200).json({
            id: req.query.id,
            title,
            components: collections[0].components
        });
    }
}
