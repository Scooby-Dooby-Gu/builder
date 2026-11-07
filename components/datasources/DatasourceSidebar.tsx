import React from "react";
import Link from "next/link";
import {mdiDatabaseOutline} from "@mdi/js";
import {Box, Flex, Icon, Text} from "components/ui";
import {Datasource} from "models/datasource";

export default function DatasourceSidebar({datasources, activeId}: { datasources: Datasource[], activeId?: string }) {
    return (
        <Box
            as="aside"
            w="64"
            flexShrink={0}
            bg="gray.50"
            borderRight="1px solid"
            borderColor="gray.200"
            pt="6"
            overflowY="auto"
        >
            <Text px="5" mb="2" fontSize="xs" fontWeight="semibold" letterSpacing="wider" textTransform="uppercase" color="gray.500">
                Data sources
            </Text>
            <Box as="nav" px="2">
                {datasources.map(ds => {
                    const isActive = ds.id === activeId;
                    return (
                        <Link key={ds.id} href={`/datasources/${ds.id}`} passHref>
                            <Flex
                                as="a"
                                align="center"
                                gap="3"
                                px="3"
                                py="2.5"
                                mb="1"
                                borderRadius="md"
                                bg={isActive ? "blue.50" : undefined}
                                color={isActive ? "blue.700" : "gray.700"}
                                _hover={isActive ? undefined : {bg: "gray.100"}}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <Icon viewBox="0 0 24 24" boxSize="5" color={isActive ? "blue.500" : "gray.400"}>
                                    <path fill="currentColor" d={mdiDatabaseOutline}/>
                                </Icon>
                                <Text fontSize="sm" fontWeight={isActive ? "semibold" : "medium"} isTruncated>
                                    {ds.name}
                                </Text>
                            </Flex>
                        </Link>
                    );
                })}
            </Box>
        </Box>
    );
}
