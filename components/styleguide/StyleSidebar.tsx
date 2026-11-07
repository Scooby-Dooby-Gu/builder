import React from "react";
import Link from "next/link";
import {Box, Flex, Icon, Text} from "components/ui";
import {LAYERS, SectionId} from "./sections";

export default function StyleSidebar({activeId}: { activeId: SectionId }) {
    return (
        <Box
            as="aside"
            w="64"
            flexShrink={0}
            bg="gray.50"
            borderRight="1px solid"
            borderColor="gray.200"
            pt="6"
            pb="6"
            overflowY="auto"
        >
            {LAYERS.map((layer, index) => (
                <Box key={layer.id} mb="5">
                    <Flex align="center" gap="2" px="5" mb="1">
                        {layer.id !== "output" && (
                            <Flex
                                align="center"
                                justify="center"
                                boxSize="4"
                                borderRadius="full"
                                bg="gray.200"
                                fontSize="2xs"
                                fontWeight="bold"
                                color="gray.600"
                            >
                                {index + 1}
                            </Flex>
                        )}
                        <Text fontSize="xs" fontWeight="semibold" letterSpacing="wider" textTransform="uppercase" color="gray.500">
                            {layer.label}
                        </Text>
                    </Flex>
                    <Box as="nav" px="2">
                        {layer.sections.map(section => {
                            const isActive = section.id === activeId;
                            return (
                                <Link key={section.id} href={`/styles/${section.id}`} passHref>
                                    <Flex
                                        as="a"
                                        align="center"
                                        gap="3"
                                        px="3"
                                        py="2"
                                        borderRadius="md"
                                        bg={isActive ? "blue.50" : undefined}
                                        color={isActive ? "blue.700" : "gray.700"}
                                        _hover={isActive ? undefined : {bg: "gray.100"}}
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        <Icon path={section.icon} boxSize="5" color={isActive ? "blue.500" : "gray.400"}/>
                                        <Text fontSize="sm" fontWeight={isActive ? "semibold" : "medium"}>
                                            {section.label}
                                        </Text>
                                    </Flex>
                                </Link>
                            );
                        })}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
