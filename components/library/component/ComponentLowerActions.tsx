import React, {FunctionComponent, ReactElement} from "react";
import styled from "@emotion/styled";
import {useAppDispatch} from "../../../store/hooks";
import {setEditableComponent} from "../../../store/slices/collectionsSlice";
import deleteComponent from "../../../store/actions/collections/deleteComponentAction";
import publishComponents from "../../../store/actions/collections/publishComponentAction";
import {
    ArrowLeftIcon,
    Button,
    DeleteIcon,
    DotsHorizontalIcon,
    DownloadIcon,
    EditIcon,
    Flex,
    IconButton,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    useToast
} from "components/ui";

const Content = styled(PopoverContent)`
  width: 180px;
`

interface Props {
    title: string,
    collectionId: string,
    description: string,
    componentId: string
}

const ComponentLowerActions: FunctionComponent<Props> = (props: Props): ReactElement => {
    const {collectionId, title, description, componentId} = props;

    const dispatch = useAppDispatch();

    const onEdit = () => dispatch(setEditableComponent({description, name: title, collectionId, id: componentId}));

    const onDelete = () => dispatch(deleteComponent({id: componentId, collectionId}));

    const toast = useToast();
    const onPublish = async () => {
        const [result] = await dispatch(publishComponents({ids: [componentId]})).unwrap();
        toast(result.error
            ? {status: "error", title: `Couldn't publish ${title}`, description: result.error, isClosable: true}
            : {status: "success", title: `Published ${title}`, description: `Version ${result.version} is live.`, duration: 2500});
    };

    return (
        <Popover
            placement="top-end"
        >
            <PopoverTrigger>
                <IconButton
                    ml="2"
                    aria-label="Users"
                    icon={<DotsHorizontalIcon/>}
                />
            </PopoverTrigger>

            <Content>
                <PopoverBody>
                    <Flex
                        direction="column"
                        align="start"
                    >
                        <Button
                            onClick={onEdit}
                        >
                            <EditIcon
                                mr="2"
                            />

                            Edit
                        </Button>

                        <Button onClick={onPublish}>
                            <DownloadIcon
                                mr="2"
                            />

                            Publish
                        </Button>

                        <Button
                            onClick={onDelete}
                        >
                            <DeleteIcon
                                mr="2"
                            />

                            Delete
                        </Button>

                        <Button
                            onClick={onEdit}
                        >
                            <ArrowLeftIcon
                                mr="2"
                            />

                            Move
                        </Button>

                        <Button
                            onClick={onEdit}
                        >
                            <EditIcon
                                mr="2"
                            />

                            Rename
                        </Button>
                    </Flex>
                </PopoverBody>
            </Content>
        </Popover>
    )
}

export default ComponentLowerActions;