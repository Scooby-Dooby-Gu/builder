import type {NextApiRequest, NextApiResponse} from "next";
import {handle, isOwner, methodNotAllowed, ownerLoginConfigured, SANDBOX_TTL_SECONDS, VISITOR_PUBLISHES_PER_DAY, visitorPublishesUsed} from "../../../lib/server/http";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return handle(res, async () => {
        if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
        res.setHeader("Cache-Control", "private, no-store");
        if (isOwner(req)) return res.status(200).json({role: "owner"});
        const used = await visitorPublishesUsed(req);
        return res.status(200).json({
            role: "visitor",
            ownerLoginAvailable: ownerLoginConfigured(),
            sandboxHours: SANDBOX_TTL_SECONDS / 3600,
            publishesPerDay: VISITOR_PUBLISHES_PER_DAY,
            publishesLeft: Math.max(0, VISITOR_PUBLISHES_PER_DAY - used),
        });
    });
}
