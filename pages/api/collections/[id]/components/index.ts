import type {NextApiRequest, NextApiResponse} from 'next';
import collections from "../../../../../data/collections.json";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method === "POST") {
        const {name, description} = JSON.parse(req.body);

        return res.status(200).json({
            ...collections[0].components[0],
            name,
            description,
            id: Math.floor(Math.random() * 100000) + 100,
            collection_id: req.query.id
        });
    }
}
