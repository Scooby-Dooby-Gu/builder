import React, {FunctionComponent, ReactElement, useState} from "react";
import {useRouter} from "next/router";
import ComponentUpperInfo from "./ComponentUpperInfo";
import {Datasource} from "../../../models/datasource";
import StateBadge from "../../StateBadge";
import ThemeBadge from "./ThemeBadge";
import {Box, Flex} from "components/ui";
import {States} from "../../../models/collection";
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
    state: States
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
        state
    } = props;

    const [imageHeight, setImageHeight] = useState(0);

    const router = useRouter();

    const onEdit = (id: string) => router.push(`/components/${id}`).then();

    return (
        <Flex
            px="5"
            pt="5"
            h="232"
            pos="relative"
            overflowY="hidden"
            align={imageHeight < 202 && !showInfo ? "center" : ""}
            boxShadow={imageHeight > 202 ? "xs" : ""}
        >
            <Flex
                pos="absolute"
                top="2xl"
                gap="2"
                zIndex={1}
            >
                <StateBadge
                    state={state}
                />
                <ThemeBadge componentId={componentId}/>
            </Flex>

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
                        onLoad={(event: any) => setImageHeight(event.target.offsetHeight)}
                    />}
                </Box>
            }
        </Flex>
    )
}

export default ComponentUpper;
