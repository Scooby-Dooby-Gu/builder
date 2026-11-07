import React, {FunctionComponent, ReactElement} from "react";
import styled from "@emotion/styled";
import Link from "next/link";
import {Datasource} from "../../../models/datasource";
import {mdiDatabaseOutline} from "@mdi/js";
import {Box, Button, EditIcon, Flex, Icon, Tag, Text} from "components/ui";

interface Props {
    componentId: string,
    published: string,
    modified: string,
    modifiedBy: string,
    variants: string,
    onEdit: (componentId: string) => void,
    dataSources: Datasource[]
}

const DataSourceTag = styled(Tag)<{ ml: string }>`
  border-radius: 12px;
  cursor: pointer;
`

const StyledLink = styled(Link)`
  cursor: pointer;
`;

const InfoItem = ({title, value, mt}) => (
    <Flex
        mt={mt}
    >
        <Text
            fontSize="sm"
        >
            {title}:
        </Text>

        <Text
            ml={1}
            fontSize="sm"
            fontWeight="500"
        >
            {value}
        </Text>
    </Flex>
)

const ComponentUpperInfo: FunctionComponent<Props> = (props: Props): ReactElement => {
    const {
        componentId,
        published,
        modified,
        modifiedBy,
        variants,
        onEdit,
        dataSources
    } = props;

    return (
        <>
            <Flex
                width="full"
            >
                <Box
                    flex="1"
                >
                    <Box
                        mt="6"
                    >
                        <InfoItem
                            mt="0"
                            title="Modified at"
                            value={modified}
                        />

                        <InfoItem
                            mt="1"
                            title="Published at"
                            value={published}
                        />

                        <InfoItem
                            mt="1"
                            title="Modified by"
                            value={modifiedBy}
                        />

                        <InfoItem
                            mt="1"
                            title="Variants"
                            value={variants}
                        />
                    </Box>
                </Box>

                <Box
                    textAlign="right"
                >
                    <Button
                        variant="primary"
                        ml="auto"
                        onClick={() => onEdit(componentId)}
                    >
                        <EditIcon
                            mr="2"
                        />

                        Edit
                    </Button>
                </Box>
            </Flex>

            <Flex
                align="center"
                pos="absolute"
                bottom="4"
            >
                <Icon path={mdiDatabaseOutline  } />

                {dataSources.map((dataSource: Datasource) => {
                    return (
                        <StyledLink
                            href={`/datasources/${dataSource.id}`}
                            passHref={true}
                            key={dataSource.id}
                        >
                            <DataSourceTag
                                colorScheme="cyan"
                                variant="solid"
                                ml="1"
                            >
                                <Text
                                    color="white"
                                    variant="microcopy"
                                >
                                    {dataSource.name}
                                </Text>
                            </DataSourceTag>
                        </StyledLink>
                    )
                })}
            </Flex>
        </>
    )
}

export default ComponentUpperInfo;