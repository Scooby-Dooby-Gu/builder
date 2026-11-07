import React, {FunctionComponent, ReactElement, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {RootState} from "../../store/store";
import {setEditableCollection} from "../../store/slices/collectionsSlice";
import updateCollectionAction from "../../store/actions/collections/updateCollectionAction";
import createCollectionAction from "../../store/actions/collections/createCollectionAction";
import CollectionForm from "./CollectionForm";
import {
    Button,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerOverlay,
    Drawer,
    useDisclosure,
    DrawerHeader,
} from "components/ui";

const CollectionDrawer: FunctionComponent<{}> = (props: {}): ReactElement => {
    const editableCollection = useAppSelector((state: RootState) => state.collections.editableCollection);

    const {isOpen, onOpen, onClose} = useDisclosure();

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (editableCollection) {
            onOpen();

            return;
        }

        onClose();
    }, [editableCollection])

    const onDrawerClose = () => {
        onClose();

        dispatch(setEditableCollection(null));
    }

    const onSubmit = () => {
        dispatch(editableCollection.id ? updateCollectionAction() : createCollectionAction());

        dispatch(setEditableCollection(null));
    }

    return (
        <Drawer
            isOpen={isOpen}
            placement='right'
            onClose={onDrawerClose}
            size="xs"
        >
            <DrawerOverlay/>

            <DrawerContent>
                <DrawerCloseButton/>

                <DrawerHeader>
                    {editableCollection.id ? "Edit Collection" : "Create Collection"}
                </DrawerHeader>

                <DrawerBody>
                    <CollectionForm/>
                </DrawerBody>

                <DrawerFooter
                    mr="auto"
                >
                    <Button
                        mr="3"
                        variant="primary"
                        onClick={onSubmit}
                    >
                        {editableCollection.id ? "Edit Collection" : "Create Collection"}
                    </Button>

                    <Button
                        colorScheme="blue"
                        onClick={onDrawerClose}
                    >
                        Dismiss
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default CollectionDrawer;