import React, {useState} from "react";
import publishComponents from "../../store/actions/collections/publishComponentAction";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {Collection} from "../../models/collection";
import {RootState} from "../../store/store";
import {
    initialCollection,
    initialComponent,
    setEditableCollection,
    setEditableComponent
} from "../../store/slices/collectionsSlice";
import {Box, Button, Flex, Tooltip, useToast} from "components/ui";

const Toolbar = () => {
    const collections = useAppSelector((state: RootState) => state.collections.collections);

    const dispatch = useAppDispatch();
    const toast = useToast();
    const [isPublishing, setIsPublishing] = useState(false);

    // Components edited since they were last published.
    const changedIds = Object.values(collections).flatMap((collection: Collection) =>
        Object.values(collection.components || {}).filter((c: any) => c.state === "changed").map((c: any) => String(c.id)));

    const publishChanges = async () => {
        setIsPublishing(true);
        try {
            const results = await dispatch(publishComponents({ids: changedIds})).unwrap();
            const failed = results.filter(r => r.error);
            toast(failed.length
                ? {status: "warning", title: `Published ${results.length - failed.length} of ${results.length}`, description: failed.map(f => f.error).join(" "), isClosable: true}
                : {status: "success", title: `Published ${results.length} component${results.length === 1 ? "" : "s"}`, duration: 2500});
        } finally {
            setIsPublishing(false);
        }
    };

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
                <Tooltip label={changedIds.length ? "Publish every component edited since its last publish" : "No unpublished changes"}>
                    <Box as="span">
                        <Button onClick={publishChanges} isDisabled={!changedIds.length} isLoading={isPublishing} loadingText="Publishing">
                            {changedIds.length ? `Publish changes (${changedIds.length})` : "Publish changes"}
                        </Button>
                    </Box>
                </Tooltip>
            </Box>
        </Flex>
    )
}

export default Toolbar;