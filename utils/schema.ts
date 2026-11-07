// Turns a JSON sample into a typed field tree for display, and picks sensible
// example bindings so the binding preview works for any data source.

export type FieldType =
    | "text" | "rich text" | "url" | "image" | "number" | "boolean" | "date" | "empty"
    | "object" | "list" | "collection";

export interface FieldNode {
    key: string,
    // Display path in JSONPath style, e.g. $.store.books[*].title
    path: string,
    // Path in the builder's own format, e.g. 0.store.books.*.title
    bindingPath: string,
    type: FieldType,
    example?: string,
    count?: number,
    children: FieldNode[],
}

const IMAGE_EXT = /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i;
const DATE = /^\d{4}-\d{2}-\d{2}/;

function primitiveType(value: any): FieldType {
    if (value === null || value === undefined) return "empty";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    const s = String(value);
    if (IMAGE_EXT.test(s)) return "image";
    if (/^(https?:)?\/\//.test(s) || /^\/[\w-]/.test(s)) return "url";
    if (DATE.test(s)) return "date";
    if (/<[a-z][\s\S]*>/i.test(s)) return "rich text";
    return "text";
}

function isPlainObject(value: any) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function example(value: any): string | undefined {
    if (value === null || value === undefined) return undefined;
    const s = typeof value === "string" ? value.replace(/<[^>]+>/g, "") : JSON.stringify(value);
    return s.length > 48 ? s.slice(0, 47) + "…" : s;
}

export function describeSchema(data: any, sourceId: string): FieldNode[] {
    return describeChildren(data, "$", sourceId);
}

function describeChildren(data: any, path: string, bindingPath: string): FieldNode[] {
    if (!isPlainObject(data)) return [];
    return Object.entries(data).map(([key, value]) => describeField(key, value, `${path}.${key}`, `${bindingPath}.${key}`));
}

function describeField(key: string, value: any, path: string, bindingPath: string): FieldNode {
    if (Array.isArray(value)) {
        const first = value[0];
        if (isPlainObject(first)) {
            return {
                key, path, bindingPath, type: "collection", count: value.length,
                children: describeChildren(first, `${path}[*]`, `${bindingPath}.*`),
            };
        }
        return {
            key, path, bindingPath, type: "list", count: value.length,
            example: value.slice(0, 3).map(v => example(v)).join(", "),
            children: [],
        };
    }
    if (isPlainObject(value)) {
        return {key, path, bindingPath, type: "object", children: describeChildren(value, path, bindingPath)};
    }
    return {key, path, bindingPath, type: primitiveType(value), example: example(value), children: []};
}

export function walkFields(nodes: FieldNode[], visit: (node: FieldNode) => void) {
    for (const node of nodes) {
        visit(node);
        walkFields(node.children, visit);
    }
}

export function summarize(nodes: FieldNode[]) {
    let fields = 0;
    let collections = 0;
    walkFields(nodes, node => {
        if (node.type === "collection") collections++;
        else if (node.type !== "object") fields++;
    });
    return {fields, collections};
}

// First collection of objects, and the first text field inside it.
export function findExampleBindings(nodes: FieldNode[]) {
    let collection: FieldNode | undefined;
    walkFields(nodes, node => {
        if (!collection && node.type === "collection") collection = node;
    });
    let text: FieldNode | undefined;
    let link: FieldNode | undefined;
    if (collection) {
        walkFields(collection.children, node => {
            if (!text && node.type === "text") text = node;
            if (!link && node.type === "url") link = node;
        });
    }
    return {collection, text, link};
}
