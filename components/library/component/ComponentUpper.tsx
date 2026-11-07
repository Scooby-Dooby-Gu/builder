import React, {FunctionComponent, ReactElement, useState} from "react";
import {useRouter} from "next/router";
import ComponentUpperInfo from "./ComponentUpperInfo";
import {Datasource} from "../../../models/datasource";
import StateBadge from "../../StateBadge";
import {Flex, Image} from "components/ui";
import {States} from "../../../models/collection";

interface Props {
    componentId: string,
    title: string,
    published: string,
    modified: string,
    modifiedBy: string,
    variants: string,
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
            >
                <StateBadge
                    state={state}
                />
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
                <Image
                    w="full"
                    alt={title}
                    src="/assets/img/component-thumbnail.svg"
                    onLoad={(event: any) => setImageHeight(event.target.offsetHeight)}
                    onClick={() => onEdit(componentId)}
                    cursor="pointer"
                />
            }
        </Flex>
    )
}

export default ComponentUpper;