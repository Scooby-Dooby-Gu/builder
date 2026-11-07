import React, {useEffect} from "react";
import Navbar from "../components/Navbar";
import {useAppSelector, useAppDispatch} from '../store/hooks';
import {RootState} from "../store/store";
import Filter from "../components/library/filter/Filter";
import Toolbar from "../components/library/Toolbar";
import {Collection as CollectionModel} from "../models/collection";
import Collection from "../components/library/collection/Collection";
import {Flex, Box, Spacer, Placeholder} from "components/ui";
import {NextPage} from "next";
import initializeAction from "../store/actions/collections/initializeAction";
import CollectionDrawer from "../components/library/CollectionDrawer";
import ComponentDrawer from "../components/library/ComponentDrawer";

const Components: NextPage = () => {
    const filteredCollections = useAppSelector((state: RootState) => state.collections.filteredCollections);
    const editableComponent = useAppSelector((state: RootState) => state.collections.editableComponent);
    const editableCollection = useAppSelector((state: RootState) => state.collections.editableCollection);

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(initializeAction());
    }, []);

    return (
        <>
            <Navbar/>

            <Box
                p="10"
            >
                <Flex
                    align="center"
                    wrap="wrap"
                >
                    <Filter/>
                    <Spacer/>
                    <Toolbar/>
                </Flex>

                <Box>
                    {filteredCollections.map((collection: CollectionModel, index: number) => (
                        <Collection
                            id={collection.id}
                            key={collection.title}
                            title={collection.title}
                            components={collection.components}
                            showAll={collection.showAll}
                            index={index}
                        />
                    ))}

                    {!Object.values(filteredCollections).length && <Placeholder
                        text="Change your filter or search parameters and try again."
                        title="No collections found"
                    />}
                </Box>
            </Box>

            {editableCollection && <CollectionDrawer/>}
            {editableComponent && <ComponentDrawer/>}
        </>
    )
}

export default Components;