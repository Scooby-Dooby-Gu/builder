import {lookup} from "dns/promises";
import {isIP} from "net";
import {getJSON, setJSON} from "./store";
import {HttpError, Namespace} from "./http";

export interface DatasourceConnection {
    id: string;
    name: string;
    description: string;
    kind: "rest" | "graphql";
    endpoint: string;
    method: "GET" | "POST";
    query: string;
    variables: Record<string, unknown>;
    headers: Record<string, string>;
    sample: unknown;
    updatedAt: string;
}

const key = (ns: Namespace) => `${ns.prefix}datasources`;
const MAX_SAMPLE_BYTES = 300_000;

function isPrivateAddress(address: string) {
    if (isIP(address) === 4) {
        const octets = address.split(".").map(Number);
        const [a, b] = octets;
        return a === 0 || a === 10 || a === 127 || a >= 224 ||
            (a === 100 && b >= 64 && b <= 127) ||
            (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
            (a === 192 && (b === 168 || b === 0)) ||
            (a === 198 && (b === 18 || b === 19));
    }
    const value = address.toLowerCase();
    if (value.startsWith("::ffff:")) return true;
    return value === "::" || value === "::1" || value.startsWith("fc") || value.startsWith("fd") ||
        value.startsWith("fe8") || value.startsWith("fe9") || value.startsWith("fea") || value.startsWith("feb") ||
        value.startsWith("::ffff:127.") || value.startsWith("::ffff:10.") || value.startsWith("::ffff:192.168.");
}

async function validateEndpoint(value: unknown) {
    let url: URL;
    try { url = new URL(String(value || "")); }
    catch { throw new HttpError(400, "Enter a valid API URL."); }
    if (url.username || url.password || (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:"))) {
        throw new HttpError(400, "Use an HTTPS API URL without credentials in the address.");
    }
    const host = url.hostname.toLowerCase();
    if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
        throw new HttpError(400, "That host can’t be used as a data source.");
    }
    try {
        const addresses = isIP(host) ? [{address: host}] : await lookup(host, {all: true});
        if (!addresses.length || addresses.some(item => isPrivateAddress(item.address))) {
            throw new HttpError(400, "That host can’t be used as a data source.");
        }
    } catch (error) {
        if (error instanceof HttpError) throw error;
        throw new HttpError(400, "The API host could not be reached.");
    }
    return url;
}

export async function requestDatasource(input: Partial<DatasourceConnection>) {
    const endpoint = await validateEndpoint(input.endpoint);
    const kind = input.kind === "graphql" ? "graphql" : "rest";
    const method = kind === "graphql" ? "POST" : input.method === "POST" ? "POST" : "GET";
    const headers: Record<string, string> = {Accept: "application/json"};
    const userHeaders = input.headers && typeof input.headers === "object" ? input.headers : {};
    if (Object.keys(userHeaders).length > 12) throw new HttpError(400, "Use 12 headers or fewer.");
    for (const [name, value] of Object.entries(userHeaders)) {
        if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]{1,80}$/.test(name) || /^(host|content-length|connection|transfer-encoding)$/i.test(name)) {
            throw new HttpError(400, "One of the request header names isn’t allowed.");
        }
        if (typeof value !== "string" || value.length > 3000) throw new HttpError(400, "A request header value is too long.");
        headers[name] = value;
    }
    let body: string | undefined;
    if (kind === "graphql") {
        const query = typeof input.query === "string" ? input.query.trim() : "";
        if (!query || query.length > 20_000) throw new HttpError(400, "Add a GraphQL query (up to 20,000 characters).");
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({query, variables: input.variables || {}});
    } else if (method === "POST" && input.variables && Object.keys(input.variables).length) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(input.variables);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    try {
        const response = await fetch(endpoint.toString(), {method, headers, body, redirect: "error", signal: controller.signal});
        if (!response.ok) throw new HttpError(502, `The API returned ${response.status}. Check its URL and credentials.`);
        const contentType = response.headers.get("content-type") || "";
        if (!/json/i.test(contentType)) throw new HttpError(502, "The API response wasn’t JSON.");
        const reader = response.body?.getReader();
        let text = "";
        if (reader) {
            const decoder = new TextDecoder();
            let size = 0;
            while (true) {
                const {done, value} = await reader.read();
                if (done) break;
                size += value.byteLength;
                if (size > MAX_SAMPLE_BYTES) {
                    await reader.cancel();
                    throw new HttpError(413, "The API response is too large (maximum 300 KB).");
                }
                text += decoder.decode(value, {stream: true});
            }
            text += decoder.decode();
        } else text = await response.text();
        if (new TextEncoder().encode(text).byteLength > MAX_SAMPLE_BYTES) throw new HttpError(413, "The API response is too large (maximum 300 KB).");
        let data: any;
        try { data = JSON.parse(text); }
        catch { throw new HttpError(502, "The API response wasn’t valid JSON."); }
        if (kind === "graphql" && data?.errors?.length) throw new HttpError(502, "GraphQL returned errors. Check the query and credentials.");
        return kind === "graphql" ? data.data : data;
    } catch (error) {
        if (error instanceof HttpError) throw error;
        throw new HttpError(502, "Couldn’t connect to that API. Check the URL, credentials and network access.");
    } finally {
        clearTimeout(timer);
    }
}

export async function getSavedDatasources(ns: Namespace) {
    const own = await getJSON<DatasourceConnection[]>(key(ns));
    if (!ns.prefix) return own || [];
    const live = await getJSON<DatasourceConnection[]>("datasources") || [];
    if (!own) return live;
    const liveIds = new Set(live.map(source => source.id));
    return [...live, ...own.filter(source => !liveIds.has(source.id))];
}

export async function saveDatasource(ns: Namespace, datasource: DatasourceConnection) {
    const sources = await getJSON<DatasourceConnection[]>(key(ns)) || [];
    if (sources.length >= 20) throw new HttpError(400, "You can add up to 20 API data sources.");
    sources.push(datasource);
    await setJSON(key(ns), sources, ns.ttl);
}

export function publicDatasource(source: DatasourceConnection) {
    return {
        id: source.id,
        name: source.name,
        description: source.description,
        sample: source.sample,
        kind: source.kind,
        endpoint: source.endpoint,
        method: source.method,
        live: true,
        authConfigured: Object.keys(source.headers).length > 0,
    };
}

