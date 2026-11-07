import React, {FunctionComponent, ReactElement} from "react";
import {useAppDispatch} from "../../../store/hooks";
import {initialComponent, setCollectionShowAll, setEditableComponent} from "../../../store/slices/collectionsSlice";
import {useMediaQuery} from "@chakra-ui/react";
import {Box, Button, ChevronDownIcon, ChevronUpIcon, PlusSquareIcon, Text} from "components/ui";

interface Props {
    collectionId: string,
    numOfComponents: number,
    showAll: boolean,
    index: number
}

const CollectionActions: FunctionComponent<Props> = (props: Props): ReactElement => {
    const {
        collectionId,
        numOfComponents,
        showAll,
        index
    } = props;

    const [isLargerThan720] = useMediaQuery('(min-width: 720px)');

    const dispatch = useAppDispatch();

    const Icon = showAll ? ChevronUpIcon : ChevronDownIcon;

    return (
        <Box
            mt="4"
        >
            {numOfComponents >= (isLargerThan720 ? 4 : 3) ? <Button
                variant="subtle"
                onClick={(e: any) => dispatch(setCollectionShowAll({collectionId, index, showAll: !showAll}))}
            >
                <Icon
                    w="4"
                    h="4"
                    mr="2"
                    mt="-1px"
                />

                <Text>
                    {showAll ? `Hide all components` : `View all ${numOfComponents} components`}
                </Text>
            </Button> : null}

            <Button
                variant="subtle"
                onClick={e => dispatch(setEditableComponent({...initialComponent, collectionId}))}
            >
                <PlusSquareIcon
                    w="4"
                    h="4"
                    mr="2"
                    mt="-1px"
                />

                Add component
            </Button>
        </Box>
    )
}

export default CollectionActions;