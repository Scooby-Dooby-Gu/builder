import type {NextApiRequest, NextApiResponse} from "next";
import {guardWrite, handle, methodNotAllowed, resetSandbox} from "../../../lib/server/http";

// Start over: the visitor's next edit gets a fresh copy of the live data.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return handle(res, async () => {
        if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
        await guardWrite(req);
        resetSandbox(res);
        return res.status(200).json({ok: true});
    });
}
