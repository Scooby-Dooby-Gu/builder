const baseURL: string = "/api";

export interface APIFetchCollections {
    id: string,
    title: string,
    components: any,
    isDefault: boolean
}

export const fetchCollections = () => {
    return fetch(`${baseURL}/collections`)
        .then(res => res.json())
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

export const fetchFonts = () => {
    return fetch(`${baseURL}/fonts`)
        .then(res => res.json())
}

export const fetchColors = () => {
    return fetch(`${baseURL}/colors`)
        .then(res => res.json())
}