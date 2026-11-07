import { Datasource } from "./datasource";

interface Component {
    id: string,
    title: string,
    description: string,
    published: string,
    modified: string,
    dataSources: Datasource[],
    modifiedBy: string,
    variants: string,
    image: string,
    badge: { text: string, colorScheme: string }
}

export default Component;