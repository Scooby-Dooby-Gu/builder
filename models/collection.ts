import {Datasource} from "./datasource";

export enum States {
    PUBLISHED = "published",
    DELETED = "deleted",
    STAGED = "staged",
    CHANGED = "changed",
    NEW = "new"
}

export interface Collection {
    id: string,
    title: string,
    components: Component[],
    isDefault: boolean,
    showAll: boolean,
    modified_at?: string,
    published_at?: string
}

export interface Component {
    id: string,
    name: string,
    description: string,
    published_at: string,
    modified_at: string,
    datasources: Datasource[],
    modified_by: string,
    variant_count: string,
    thumbnail?: string,
    state: States,
    collection_id?: string
}
