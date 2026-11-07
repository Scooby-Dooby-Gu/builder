import React, {useEffect, useState} from "react";
import Link from "next/link";
import {Box, ChevronDownIcon, Collapse, Flex, Icon, Text} from "components/ui";
import {LAYERS, SectionId} from "./sections";

export default function StyleSidebar({activeId}: { activeId: SectionId }) {
    // All groups start open; the group holding the current section re-opens on navigation.
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const activeLayer = LAYERS.find(layer => layer.sections.some(s => s.id === activeId))?.id;

    useEffect(() => {
        if (!activeLayer) return;
        setCollapsed(prev => {
            if (!prev.has(activeLayer)) return prev;
            const next = new Set(prev);
            next.delete(activeLayer);
            return next;
        });
    }, [activeLayer]);

    const toggle = (id: string) => setCollapsed(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    return (
        <Box
            as="aside"
            w="64"
            flexShrink={0}
            bg="gray.50"
            borderRight="1px solid"
            borderColor="gray.200"
            pt="5"
            pb="6"
            overflowY="auto"
        >
            {LAYERS.map(layer => {
                const isOpen = !collapsed.has(layer.id);
                return (
                    <Box key={layer.id} mb="3">
                        <Flex
                            as="button"
                            type="button"
                            align="center"
                            w="full"
                            px="5"
                            py="1.5"
                            onClick={() => toggle(layer.id)}
                            aria-expanded={isOpen}
                            color="gray.500"
                            _hover={{color: "gray.700"}}
                        >
                            <Text fontSize="xs" fontWeight="semibold" letterSpacing="wider" textTransform="uppercase">
                                {layer.label}
                            </Text>
                            <ChevronDownIcon
                                ml="auto"
                                boxSize="4"
                                transition="transform 150ms ease"
                                transform={isOpen ? undefined : "rotate(-90deg)"}
                            />
                        </Flex>
                        <Collapse in={isOpen} animateOpacity>
                            <Box as="nav" px="2" pt="1">
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
                        </Collapse>
                    </Box>
                );
            })}
        </Box>
    );
}
