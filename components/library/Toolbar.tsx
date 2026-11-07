import React from "react";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {Collection} from "../../models/collection";
import {RootState} from "../../store/store";
import {
    initialCollection,
    initialComponent,
    setEditableCollection,
    setEditableComponent
} from "../../store/slices/collectionsSlice";
import {Box, Button, Flex} from "components/ui";

const Toolbar = () => {
    const collections = useAppSelector((state: RootState) => state.collections.collections);

    const dispatch = useAppDispatch();

    return (
        <Flex
            align="center"
            mt={{sm: 6, md: "6", lg: 0}}
            wrap="wrap"
        >
            <Box>
                <Button
                    variant="primary"
                    onClick={e => dispatch(setEditableComponent({
                        ...initialComponent,
                        collectionId:  Object.keys(collections)[0]
                    }))}
                >
                    Add Component
                </Button>
            </Box>

            <Box
                ml="3"
            >
                <Button
                    onClick={(e) => dispatch(setEditableCollection(initialCollection))}
                >
                    Create Collection
                </Button>
            </Box>

            <Box
                ml="3"
            >
                <Button onClick={() => console.log("Publishing...")}>
                    Publish
                </Button>
            </Box>
        </Flex>
    )
}

export default Toolbar;