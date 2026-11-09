const baseURL: string = "/api";

export interface APIFetchCollections {
    id: string,
    title: string,
    components: any,
    isDefault: boolean
}

export const fetchCollections = () => {
    return fetch(`${baseURL}/collections`)
        .then(res => json<any[]>(res))
}

export const createCollection = (title: string) => {
    return fetch(`${baseURL}/collections`,
        {
            method: "POST",
            body: JSON.stringify({title})
        })
        .then(res => res.json())
}

export const updateCollection = (title: string, id: string) => {
    return fetch(`${baseURL}/collections/${id}`,
        {
            method: "PUT",
            body: JSON.stringify({title})
        })
        .then(res => res.json())
}

export const deleteCollection = (id: string) => {
    return fetch(`${baseURL}/collections/${id}`,
        {method: "DELETE"})
        .then(res => res.json())
}

export const createComponent = (name: string, collectionId: string, description: string) => {
    return fetch(`${baseURL}/collections/${collectionId}/components`,
        {
            method: "POST",
            body: JSON.stringify({name, description})
        })
        .then(res => res.json())
}

export const updateComponent = (id: string, name: string, collectionId: string, description: string) => {
    return fetch(`${baseURL}/collections/${collectionId}/components/${id}`,
        {
            method: "PUT",
            body: JSON.stringify({name, description})
        })
        .then(res => res.json())
}

export const deleteComponent = (id: string, collectionId: string) => {
    return fetch(`${baseURL}/collections/${collectionId}/components/${id}`,
        {method: "DELETE"})
        .then(res => res.json())
}

// Component drafts and publishing

export interface PublishedInfo {
    version: number,
    publishedAt: string,
}

export interface PublishedWithVariants extends PublishedInfo {
    variants: { id: string, digest: string }[],
}

async function json<T>(res: Response): Promise<T> {
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
    return body as T;
}

export const fetchComponentDraft = (id: string) =>
    fetch(`${baseURL}/components/${id}/draft`).then(res => json<{ draft: { variants: any[], updatedAt: string } | null, published: PublishedWithVariants | null }>(res));

export const saveComponentDraft = (id: string, variants: any[]) =>
    fetch(`${baseURL}/components/${id}/draft`, {method: "PUT", body: JSON.stringify({variants})})
        .then(res => json<{ updatedAt: string }>(res));

export interface PublishResult extends PublishedInfo {
    target: "live" | "sandbox",
    publishesLeft: number | null,
    publishesPerDay: number | null,
}

export const publishComponent = (id: string, snapshot: object) =>
    fetch(`${baseURL}/components/${id}/publish`, {method: "POST", body: JSON.stringify(snapshot)})
        .then(res => json<PublishResult>(res));

// Session: the owner edits live data; visitors get a private sandbox.

export interface Session {
    role: "owner" | "visitor",
    ownerLoginAvailable?: boolean,
    sandboxHours?: number,
    publishesPerDay?: number,
    publishesLeft?: number,
}

export const fetchSession = () => fetch(`${baseURL}/auth/session`).then(res => json<Session>(res));

export const fetchDatasources = () => fetch(`${baseURL}/datasources`).then(res => json<import("models/datasource").Datasource[]>(res));
export const testDatasource = (config: object) => fetch(`${baseURL}/datasources/test`, {method: "POST", body: JSON.stringify(config)}).then(res => json<{sample: unknown}>(res));
export const createDatasource = (config: object) => fetch(`${baseURL}/datasources`, {method: "POST", body: JSON.stringify(config)}).then(res => json<import("models/datasource").Datasource>(res));

export const signIn = (password: string) =>
    fetch(`${baseURL}/auth/login`, {method: "POST", body: JSON.stringify({password})}).then(res => json<Session>(res));

export const signOut = () => fetch(`${baseURL}/auth/logout`, {method: "POST"}).then(res => json<Session>(res));

export const resetSandbox = () => fetch(`${baseURL}/sandbox/reset`, {method: "POST"}).then(res => json<{ ok: true }>(res));
