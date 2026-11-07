import type {NextApiRequest, NextApiResponse} from 'next';
import fonts from "../../../data/fonts.json";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method === "GET") {
        return res.status(200).json(fonts);
    }

    // if (req.method === "POST") {
    //     const title = JSON.parse(req.body).title;
    //
    //     return res.status(200).json({
    //         id: Math.floor(Math.random() * 100000) + 100,
    //         title,
    //         components: []
    //     });
    // }
}
