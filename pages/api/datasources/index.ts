import crypto from "crypto";
import type {NextApiRequest, NextApiResponse} from "next";
import {DatasourceConnection, getSavedDatasources, publicDatasource, requestDatasource, saveDatasource} from "../../../lib/server/datasources";
import {guardWrite, handle, methodNotAllowed, rateLimit, readBody, readNamespace, requireText, writeNamespace} from "../../../lib/server/http";
import {DATASOURCES} from "../../../data/datasources";

export const config = {api: {bodyParser: {sizeLimit: "32kb"}}};

function connectionFrom(body: any, sample: unknown): DatasourceConnection {
    const headers = body?.headers && typeof body.headers === "object" && !Array.isArray(body.headers) ? body.headers : {};
    const variables = body?.variables && typeof body.variables === "object" && !Array.isArray(body.variables) ? body.variables : {};
    return {
        id: `api_${crypto.randomUUID()}`,
        name: requireText(body?.name, "A data source name", 80),
        description: requireText(body?.description, "A description", 400, false),
        kind: body?.kind === "graphql" ? "graphql" : "rest",
        endpoint: requireText(body?.endpoint, "An API endpoint", 2000),
        method: body?.method === "POST" ? "POST" : "GET",
        query: typeof body?.query === "string" ? body.query.slice(0, 20_000) : "",
        variables,
        headers,
        sample,
        updatedAt: new Date().toISOString(),
    };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return handle(res, async () => {
        if (req.method === "GET") {
            res.setHeader("Cache-Control", "private, no-store");
            const sources = await getSavedDatasources(readNamespace(req));
            return res.status(200).json([...DATASOURCES, ...sources.map(publicDatasource)]);
        }
        if (req.method !== "POST") return methodNotAllowed(res, ["GET", "POST"]);
        await guardWrite(req);
        await rateLimit(req, "datasource-create", 10, 60);
        const body = readBody(req);
        const sample = await requestDatasource(body);
        const ns = await writeNamespace(req, res);
        const connection = connectionFrom(body, sample);
        await saveDatasource(ns, connection);
        return res.status(201).json(publicDatasource(connection));
    });
}
