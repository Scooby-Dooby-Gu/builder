import React, {FunctionComponent, ReactElement, useState} from "react";
import CollectionActions from "./CollectionActions";
import {Component as ComponentModel} from "../../../models/collection";
import Component from "../component/Component";
import {Box, Text, SimpleGrid, IconButton, Icon, Tooltip, Flex} from "components/ui";
import {mdiPencil, mdiPencilOutline, mdiTrashCan} from "@mdi/js";
import {useAppDispatch} from "../../../store/hooks";
import {setEditableCollection} from "../../../store/slices/collectionsSlice";
import deleteCollectionAction from "../../../store/actions/collections/deleteCollectionAction";

interface Props {
    id: string,
    title: string,
    components: ComponentModel[],
    showAll: boolean,
    index: number
}

const Collection: FunctionComponent<Props> = (props: Props): ReactElement => {
    const {
        title,
        components,
        id,
        showAll,
        index
    } = props;

    const [editCollectionButton, setEditCollectionButton] = useState(false);

    const dispatch = useAppDispatch();

    return (
        <Box
            bg="gray.100"
            borderRadius="base"
            p="6"
            mt="8"
            mx="0"
            w="full"
        >
            <Flex
                align="center"
                w="64"
                onMouseOver={e => setEditCollectionButton(true)}
                onMouseOut={e => setEditCollectionButton(false)}
            >
                <Text
                    fontSize="xl"
                    fontWeight="bold"
                >
                    {title}
                </Text>

                {editCollectionButton && title !== "Ungrouped" && <>
                    <Tooltip
                        label="EDIT TITLE"
                    >
                        <IconButton
                            onClick={e => dispatch(setEditableCollection({title, id}))}
                            w="5"
                            h="5"
                            icon={<Icon path={mdiPencilOutline} w="5" h="5"/>}
                            aria-label=""
                        />
                    </Tooltip>

                    <Tooltip
                        label="DELETE"
                    >
                        <IconButton
                            onClick={e => dispatch(deleteCollectionAction({id}))}
                            w="5"
                            h="5"
                            icon={<Icon path={mdiTrashCan} w="5" h="5"/>}
                            aria-label=""
                        />
                    </Tooltip>
                </>}
            </Flex>

            <SimpleGrid
                columns={{sm: 1, md: 2, lg: 3, xl: 3, "2xl": 3}}
                spacing="4"
                mt="4"
            >
                {components.map((component: ComponentModel, index: number) => (
                    <Component
                        key={component.id}
                        id={component.id}
                        title={component.name}
                        description={component.description}
                        published={component.published_at}
                        modified={component.modified_at}
                        modifiedBy={component.modified_by}
                        variants={component.variant_count}
                        thumbnail={component.thumbnail || ""}
                        dataSources={component.datasources}
                        state={component.state}
                        showAll={showAll}
                        index={index}
                        collectionId={id}
                    />
                ))}
            </SimpleGrid>

            <CollectionActions
                collectionId={id}
                numOfComponents={Object.keys(components).length}
                showAll={showAll}
                index={index}
            />
        </Box>
    )
}

export default Collection;
