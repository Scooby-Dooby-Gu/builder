import React, {FunctionComponent, ReactElement} from "react";
import {useRouter} from "next/router";
import ComponentUpperInfo from "./ComponentUpperInfo";
import {Datasource} from "../../../models/datasource";
import {Box, Flex} from "components/ui";
import ComponentThumbnail from "./ComponentThumbnail";

interface Props {
    componentId: string,
    title: string,
    published: string,
    modified: string,
    modifiedBy: string,
    variants: string,
    thumbnail: string,
    showInfo: boolean,
    dataSources: Datasource[]
}

const ComponentUpper: FunctionComponent<Props> = (props: Props): ReactElement => {
    const {
        showInfo,
        componentId,
        title,
        published,
        modifiedBy,
        modified,
        variants,
        thumbnail,
        dataSources,
    } = props;

    const router = useRouter();

    const onEdit = (id: string) => router.push(`/components/${id}`).then();

    return (
        <Flex
            px="5"
            pt="5"
            h="224"
            pos="relative"
            overflowY="hidden"
        >
            {showInfo ?
                <ComponentUpperInfo
                    componentId={componentId}
                    published={published}
                    modified={modified}
                    modifiedBy={modifiedBy}
                    variants={variants}
                    onEdit={onEdit}
                    dataSources={dataSources}
                />
                :
                <Box w="full" cursor="pointer" onClick={() => onEdit(componentId)}>
                    {thumbnail ? <ComponentThumbnail html={thumbnail} title={title}/> : <Box
                        as="img"
                        w="full"
                        alt={title}
                        src="/assets/img/component-thumbnail.svg"
                    />}
                </Box>
            }
        </Flex>
    )
}

export default ComponentUpper;
