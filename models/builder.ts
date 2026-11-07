
export type ComponentVariant = {
    id: string,
    name: string,
    isDeleted: boolean,
    state: "published" | "draft" | "new"
    isValid: boolean,
    content: string
}

export interface ConfiguredAttribute {
    key: any,
    name: string,
    label: string,
    icon?: any,
    value?: any,
    jsonpath: any,
    qualifier?: any,
    type: 'context' | 'text' | 'url' | 'boolean',
    isOpen?: boolean,
    onChange?: (value : any) => void,
    onConfigure?: (value : any) => void,
    labels?: Record<string,string>
}