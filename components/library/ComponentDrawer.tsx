import React, {FunctionComponent, ReactElement, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {RootState} from "../../store/store";
import {setEditableComponent} from "../../store/slices/collectionsSlice";
import ComponentForm from "./ComponentForm";
import updateComponentAction from "../../store/actions/collections/updateComponentAction";
import createComponentAction from "../../store/actions/collections/createComponentAction";
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

const ComponentDrawer: FunctionComponent<{}> = (props: {}): ReactElement => {
    const editableComponent = useAppSelector((state: RootState) => state.collections.editableComponent);

    const {isOpen, onOpen, onClose} = useDisclosure();

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (editableComponent) {
            onOpen();

            return;
        }

        onClose();
    }, [editableComponent])

    const onDrawerClose = () => {
        onClose();

        dispatch(setEditableComponent(null));
    }

    const onSubmit = () => {
        dispatch(editableComponent.id ? updateComponentAction() : createComponentAction());

        dispatch(setEditableComponent(null));
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
                    {editableComponent.id ? "Edit Component" : "Create Component"}
                </DrawerHeader>

                <DrawerBody>
                    <ComponentForm/>
                </DrawerBody>

                <DrawerFooter
                    mr="auto"
                >
                    <Button
                        mr="3"
                        variant="primary"
                        onClick={onSubmit}
                    >
                        {editableComponent.id ? "Edit Component" : "Create Component"}
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

export default ComponentDrawer;