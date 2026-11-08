import type {NextApiRequest, NextApiResponse} from "next";
import {checkOrigin, clearOwnerSession, handle, methodNotAllowed} from "../../../lib/server/http";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return handle(res, async () => {
        if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
        checkOrigin(req);
        clearOwnerSession(res);
        return res.status(200).json({role: "visitor"});
    });
}
