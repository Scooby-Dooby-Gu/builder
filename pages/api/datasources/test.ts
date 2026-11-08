import type {NextApiRequest, NextApiResponse} from "next";
import {requestDatasource} from "../../../lib/server/datasources";
import {guardWrite, handle, methodNotAllowed, rateLimit, readBody} from "../../../lib/server/http";

export const config = {api: {bodyParser: {sizeLimit: "32kb"}}};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return handle(res, async () => {
        if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
        res.setHeader("Cache-Control", "private, no-store");
        await guardWrite(req);
        await rateLimit(req, "datasource-test", 10, 3600);
        const sample = await requestDatasource(readBody(req));
        return res.status(200).json({sample});
    });
}
