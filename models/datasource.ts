export interface Datasource {
    name: string,
    id: string,
    description?: string,
    sample: any,
    kind?: "rest" | "graphql",
    endpoint?: string,
    method?: "GET" | "POST",
    live?: boolean,
    authConfigured?: boolean,
}
