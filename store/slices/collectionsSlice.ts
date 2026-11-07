import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Collection, Component} from "../../models/collection";
import {Datasource} from "../../models/datasource";
import {updateQueryParam} from "../../utils/url";
import {getTime} from "../../utils/date";
import {objectToArray} from "../../utils/object";

export enum QueryParams {
    SEARCH = "search",
    SORT = "sortBy",
    DATA_SOURCES = "datasources"
}

export enum SortBy {
    PUBLISHED = "published_at",
    MODIFIED = "modified_at"
}

interface Collections {
    [id: string]: Collection
}

interface EditableCollection {
    id?: string,
    title: string
}

interface EditableComponent {
    id?: string,
    name: string,
    description: string,
    collectionId: string
}

export const initialCollection = {title: ""};
export const initialComponent = {name: "", description: "", collectionId: ""};

export interface CollectionsState {
    collections: Collections,
    filteredCollections: Collection[],
    editableCollection: EditableCollection | null,
    editableComponent: EditableComponent | null,
    searchTerm: string,
    sortBy: SortBy | "",
    selectedDatasources: Datasource[]
}

const initialState: CollectionsState = {
    collections: {},
    filteredCollections: [],
    editableCollection: null,
    editableComponent: null,
    searchTerm: "",
    sortBy: "",
    selectedDatasources: []
}

export const filterComponentsByDatasource = (component: Component, selectedDatasources: Datasource[]) => {
    return selectedDatasources.length ?
        component.datasources
            .filter((componentDatasource: Datasource) => {
                return selectedDatasources.find(datasource => parseInt(componentDatasource.id) === parseInt(datasource.id))
            })
            .length : true;
}

export const filterComponentsBySearchTerm = (component: Component, searchTerm: string) => {
    return searchTerm ? component.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
}

export const collectionsSlice = createSlice({
    name: 'collections',
    initialState,
    reducers: {
        setCollections: (state: CollectionsState, action: PayloadAction<Collections>) => {
            state.collections = action.payload;
        },
        setFilteredCollections: (state: CollectionsState, action: PayloadAction<Collection[]>) => {
            state.filteredCollections = action.payload;
        },
        setCollectionShowAll: (state: CollectionsState, action: PayloadAction<{ collectionId: string, index: number, showAll: boolean }>) => {
            state.collections[action.payload.collectionId].showAll = action.payload.showAll;
            state.filteredCollections[action.payload.index].showAll = action.payload.showAll;
        },

        // Collections CRUD
        createCollection: (state: CollectionsState, action: PayloadAction<Collection>) => {
            state.collections = {[action.payload.id]: action.payload, ...state.collections};
        },
        updateCollection: (state: CollectionsState, action: PayloadAction<Collection>) => {
            state.collections[action.payload.id] = action.payload;
        },
        deleteCollection: (state: CollectionsState, action: PayloadAction<Collection>) => {
            delete state.collections[action.payload.id];
        },
        // \Collections CRUD

        // Component CRUD
        createComponent: (state: CollectionsState, action: PayloadAction<Component>) => {
            state.collections[action.payload.collection_id].components[action.payload.id] = action.payload;
        },
        deleteComponent: (state: CollectionsState, action: PayloadAction<Component>) => {
            delete state.collections[action.payload.collection_id].components[action.payload.id];
        },
        updateComponent: (state: CollectionsState, action: PayloadAction<Component>) => {
            const {collections} = state;

            const {id, collection_id} = action.payload;

            for (const collection of Object.values(collections)) {
                if (collections[collection.id].components[id]) {
                    delete state.collections[collection.id].components[id];

                    break;
                }
            }

            state.collections[collection_id].components[id] = action.payload;
        },
        // \Component CRUD

        // Editable items
        setEditableCollection: (state: CollectionsState, action: PayloadAction<EditableCollection | null>) => {
            state.editableCollection = action.payload;
        },
        setEditableComponent: (state: CollectionsState, action: PayloadAction<EditableComponent | null>) => {
            state.editableComponent = action.payload;
        },
        // \Editing items

        // Filtering items
        setSearch: (state: CollectionsState, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;

            updateQueryParam({key: QueryParams.SEARCH, value: action.payload});
        },
        setSortBy: (state: CollectionsState, action: PayloadAction<SortBy>) => {
            state.sortBy = action.payload;

            updateQueryParam({key: QueryParams.SORT, value: action.payload});
        },
        setSelectedDataSources: (state: CollectionsState, action: PayloadAction<Datasource[]>) => {
            state.selectedDatasources = action.payload;

            updateQueryParam({
                key: QueryParams.DATA_SOURCES,
                value: action.payload.map((ds: Datasource) => ds.id).join(",")
            });
        },
        // \Filtering items

        // Filtering
        sort: (state: CollectionsState) => {
            let {sortBy} = state;

            if (!sortBy) return;

            state.filteredCollections.forEach((collection: Collection) => {
                collection.components.sort((a, b) => getTime(b[sortBy]) - getTime(a[sortBy]));

                if (collection.components.length) {
                    collection[sortBy] = collection.components[0][sortBy];
                }
            });

            state.filteredCollections.sort((a, b) => getTime(b[sortBy]) - getTime(a[sortBy]));
        },
        filter: (state: CollectionsState) => {
            const {searchTerm, selectedDatasources, collections} = state;

            if (!searchTerm && !selectedDatasources.length) {
                state.filteredCollections = objectToArray(collections) as Collection[];

                return;
            }

            state.filteredCollections = objectToArray(collections).map((collection: Collection) => ({
                ...collection,
                components: collection.components.filter((component: Component) => {
                    return filterComponentsByDatasource(component, selectedDatasources) && filterComponentsBySearchTerm(component, searchTerm);
                })
            })).filter((collection: Collection) => collection.components.length);
        },
        filterAndSort: (state: CollectionsState) => {
            const {searchTerm, selectedDatasources, collections, sortBy} = state;

            state.filteredCollections = objectToArray(collections)
                .map((collection: Collection) => {
                    const components = collection.components.filter((component: Component) => {
                        return filterComponentsByDatasource(component, selectedDatasources) && filterComponentsBySearchTerm(component, searchTerm);
                    }).sort((a, b) => getTime(b[sortBy]) - getTime(a[sortBy]));

                    return {
                        ...collection,
                        [sortBy]: components.length ? components[0][sortBy] : null,
                        components
                    }
                })
                .filter((collection: Collection) => collection.components.length)
                .sort((a, b) => getTime(b[sortBy]) - getTime(a[sortBy]))
        },
        // \Filtering
    }
})

export const {
    setCollections,
    setFilteredCollections,
    setSortBy,
    setSearch,
    setEditableCollection,
    setEditableComponent,
    setCollectionShowAll,
    setSelectedDataSources,
    deleteComponent,
    sort,
    createCollection,
    updateCollection,
    createComponent,
    updateComponent,
    filter,
    deleteCollection,
    filterAndSort
} = collectionsSlice.actions;

export default collectionsSlice.reducer;