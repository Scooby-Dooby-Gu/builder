import React from "react";
import styled from "@emotion/styled";
import ComponentLowerActions from "./ComponentLowerActions";
import {Box, Flex, IconButton, InfoOutlineIcon, Text} from "components/ui";
import StateBadge from "../../StateBadge";
import ThemeBadge from "./ThemeBadge";
import {States} from "../../../models/collection";

const InfoButton = styled(IconButton, {shouldForwardProp: prop => prop !== "show"})<{ show: boolean }>`
  opacity: ${props => props.show ? "1" : "0"};
`

interface Props {
    showInfo: boolean,
    description: string,
    title: string,
    setShowInfo: (showInfo: boolean) => void,
    showInfoButton: boolean,
    state: States,
    componentId: string,
    collectionId: string
}

const TruncatedTitle = styled(Text)`
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TruncatedDescription = styled(Text)`
  display: -webkit-box;
  max-width: 80%;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const ComponentLower = (props: Props) => {
    const {
        showInfo,
        description,
        title,
        setShowInfo,
        showInfoButton,
        state,
        componentId,
        collectionId
    } = props;

    return showInfo ? (
        <Box
            pos="absolute"
            boxShadow="base"
            bg="gray.50"
            zIndex="999"
            w="full"
            pb="2"
        >
            <Flex
                px="5"
                h="12"
                align="center"
            >
                <Box>
                    <TruncatedTitle
                        fontSize="lg"
                        fontWeight="semibold"
                    >
                        {title}
                    </TruncatedTitle>
                </Box>

                <Flex
                    ml="auto"
                >
                    <InfoButton
                        aria-label="Users"
                        icon={<InfoOutlineIcon/>}
                        onClick={() => setShowInfo(!showInfo)}
                        show={showInfoButton || showInfo}
                    />

                    <ComponentLowerActions
                        collectionId={collectionId}
                        title={title}
                        description={description}
                        componentId={componentId}
                    />
                </Flex>
            </Flex>

            {description &&
                <TruncatedDescription
                    variant="microcopy"
                    px="5"
                    mt="-3"
                >
                    {description}
                </TruncatedDescription>
            }
            <Flex px="5" mt="2" gap="2" align="center">
                <StateBadge state={state}/>
                <ThemeBadge componentId={componentId}/>
            </Flex>
        </Box>
    ) : (
        <Flex
            h="14"
            px="5"
            align="center"
        >
            <Box flex="1" minW="0">
                <TruncatedTitle
                    fontSize="lg"
                    fontWeight="semibold"
                >
                    {title}
                </TruncatedTitle>
                <Flex gap="2" mt="1" align="center">
                    <StateBadge state={state}/>
                    <ThemeBadge componentId={componentId}/>
                </Flex>
            </Box>

            <Flex
                ml="auto"
            >
                <InfoButton
                    aria-label="Users"
                    icon={<InfoOutlineIcon/>}
                    onClick={() => setShowInfo(!showInfo)}
                    show={showInfoButton || showInfo}
                />

                <ComponentLowerActions
                    collectionId={collectionId}
                    title={title}
                    description={description}
                    componentId={componentId}
                />
            </Flex>
        </Flex>
    )
}

export default ComponentLower;
