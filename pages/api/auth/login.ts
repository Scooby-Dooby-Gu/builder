import type {NextApiRequest, NextApiResponse} from "next";
import {checkOrigin, checkPassword, handle, HttpError, methodNotAllowed, ownerLoginConfigured, rateLimit, readBody, setOwnerSession} from "../../../lib/server/http";

export const config = {api: {bodyParser: {sizeLimit: "4kb"}}};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return handle(res, async () => {
        if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
        checkOrigin(req);
        // Slow down password guessing: a few tries a minute, a limited number an hour.
        await rateLimit(req, "login-minute", 5, 60);
        await rateLimit(req, "login-hour", 20, 3600);
        if (!ownerLoginConfigured()) throw new HttpError(503, "Owner sign-in isn't set up on this deployment.");
        const {password} = readBody<{ password?: string }>(req);
        if (!checkPassword(String(password ?? ""))) throw new HttpError(401, "That password isn't right.");
        setOwnerSession(res);
        return res.status(200).json({role: "owner"});
    });
}
