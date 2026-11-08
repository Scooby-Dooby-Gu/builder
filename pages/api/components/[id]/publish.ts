import type {NextApiRequest, NextApiResponse} from "next";
import {publish, requireComponent, validateSnapshot} from "../../../../lib/server/components";
import {guardWrite, handle, methodNotAllowed, rateLimit, readBody, takeVisitorPublish, VISITOR_PUBLISHES_PER_DAY, writeNamespace} from "../../../../lib/server/http";

export const config = {api: {bodyParser: {sizeLimit: "600kb"}}};

// Publishes a snapshot assembled by the builder: variant HTML, resolved theme CSS,
// font stylesheets and the data the bindings read from. The owner publishes to the
// live embed; visitors publish to their sandbox, a few times a day.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = String(req.query.id);
    return handle(res, async () => {
        if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
        await guardWrite(req);
        await rateLimit(req, "publish-minute", 10, 60);
        const snapshot = validateSnapshot(readBody(req));
        const ns = await writeNamespace(req, res);
        await requireComponent(ns, id);

        const publishesLeft = ns.kind === "sandbox" ? await takeVisitorPublish(req) : null;
        const published = await publish(ns, id, snapshot);
        return res.status(200).json({
            version: published.version,
            publishedAt: published.publishedAt,
            target: ns.kind === "owner" ? "live" : "sandbox",
            publishesLeft,
            publishesPerDay: ns.kind === "sandbox" ? VISITOR_PUBLISHES_PER_DAY : null,
        });
    });
}
