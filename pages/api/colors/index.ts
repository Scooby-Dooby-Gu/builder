import type {NextApiRequest, NextApiResponse} from 'next';
import colors from "../../../data/colors.json";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
     if (req.method === "GET") {
        return res.status(200).json(colors);
    }
}
