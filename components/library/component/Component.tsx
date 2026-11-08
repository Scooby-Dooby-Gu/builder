import React, {FunctionComponent, ReactElement, useState} from "react";
import {Box} from "components/ui";
import ComponentUpper from "./ComponentUpper";
import ComponentLower from "./ComponentLower";
import {Datasource} from "../../../models/datasource";
import {States} from "../../../models/collection";
import {useMediaQuery} from "@chakra-ui/react";

interface Props {
    id: string,
    title: string,
    description: string,
    published: string,
    modified: string,
    modifiedBy: string,
    variants: string,
    thumbnail: string,
    dataSources: Datasource[],
    state: States,
    showAll: boolean,
    index: number,
    collectionId: string
}

const Component: FunctionComponent<Props> = (props: Props): ReactElement | null => {
    const {
        title,
        id,
        showAll,
        index,
        description,
        published,
        modified,
        modifiedBy,
        variants,
        thumbnail,
        dataSources,
        state,
        collectionId
    } = props;

    const [showInfoButton, setShowInfoButton] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const [isLargerThan992] = useMediaQuery('(min-width: 992px)');

    const show = showAll || (isLargerThan992 ? (index < 3) : (index < 2));

    return show ? (
        <Box
            h="280px"
            borderRadius="base"
            boxShadow="base"
            bg="white"
            pos="relative"
            _hover={{boxShadow: "md"}}
            onMouseOver={() => setShowInfoButton(true)}
            onMouseOut={() => setShowInfoButton(false)}
        >
            <ComponentUpper
                title={title}
                componentId={id}
                published={published}
                modified={modified}
                modifiedBy={modifiedBy}
                variants={variants}
                thumbnail={thumbnail}
                showInfo={showInfo}
                dataSources={dataSources}
            />

            <ComponentLower
                showInfoButton={showInfoButton}
                showInfo={showInfo}
                description={description}
                setShowInfo={setShowInfo}
                title={title}
                state={state}
                collectionId={collectionId}
                componentId={id}
            />
        </Box>
    ) : null;
}

export default Component;
