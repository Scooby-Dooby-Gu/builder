import type {NextApiRequest, NextApiResponse} from 'next';
import collections from "../../../data/collections.json";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method === "GET") {
        const a = []

        for(let i =0; i<10; i++){
            a.push({id: i, title: `Collection ${i}`, components: collections[0].components})
        }

        console.log(a)
        return res.status(200).json(a);
    }

    if (req.method === "POST") {
        const title = JSON.parse(req.body).title;

        return res.status(200).json({
            id: Math.floor(Math.random() * 100000) + 100,
            title,
            components: []
        });
    }
}
