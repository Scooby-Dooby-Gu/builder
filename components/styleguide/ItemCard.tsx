import React from "react";
import {
    Box,
    Button,
    DeleteIcon,
    EditIcon,
    Flex,
    IconButton,
    SimpleGrid,
    Text,
    Tooltip,
} from "components/ui";
import {useAppDispatch, useAppSelector} from "store/hooks";
import {addItem, removeItem, updateItem} from "store/slices/stylesSlice";
import {KIND_LABELS, StyleSystem, TokenKind, usagesOf} from "utils/styleSystem";

export function useStyleSystem() {
    const system = useAppSelector(state => state.styles.system) as StyleSystem;
    const dispatch = useAppDispatch();
    return {
        system,
        add: (kind: TokenKind) => dispatch(addItem(kind)).payload.id,
        update: (kind: TokenKind, id: string, patch: Record<string, any>) => dispatch(updateItem({kind, id, patch})),
        remove: (kind: TokenKind, id: string) => dispatch(removeItem({kind, id})),
    };
}

export default function ItemCard({kind, item, preview, meta, isOpen, onToggle, form, previewBg, appliedTo}: {
    kind: TokenKind,
    item: { id: string, name: string },
    preview: React.ReactNode,
    meta?: React.ReactNode,
    isOpen: boolean,
    onToggle: () => void,
    form: React.ReactNode,
    previewBg?: string,
    // For themes: the components they're applied to in the builder.
    appliedTo?: string[],
}) {
    const {system, remove} = useStyleSystem();
    const usages = usagesOf(system, kind, item.id);
    const usedBy = [...usages.map(u => `${u.name} ${KIND_LABELS[u.kind]}`), ...(appliedTo ?? [])];

    return (
        <Box
            border="1px solid"
            borderColor={isOpen ? "blue.300" : "gray.200"}
            borderRadius="lg"
            bg="white"
            overflow="hidden"
            boxShadow={isOpen ? "0 0 0 1px var(--chakra-colors-blue-300)" : undefined}
        >
            <Flex align="stretch" minH="20" direction={{base: "column", md: "row"}}>
                <Flex
                    align="center"
                    flex="1"
                    minW="0"
                    px="5"
                    py="4"
                    bg={previewBg}
                    overflow="hidden"
                >
                    {preview}
                </Flex>
                <Flex
                    direction="column"
                    justify="center"
                    w={{base: "full", md: "64"}}
                    flexShrink={0}
                    px="4"
                    py="3"
                    borderStyle="solid"
                    borderColor="gray.100"
                    borderWidth="0"
                    borderLeftWidth={{base: "0", md: "1px"}}
                    borderTopWidth={{base: "1px", md: "0"}}
                >
                    <Flex align="center">
                        <Text fontWeight="semibold" fontSize="sm" isTruncated>{item.name}</Text>
                        <Flex ml="auto" gap="1" flexShrink={0}>
                            <Tooltip label={isOpen ? "Close" : `Edit ${KIND_LABELS[kind]}`}>
                                <IconButton
                                    aria-label={isOpen ? `Close ${item.name}` : `Edit ${item.name}`}
                                    icon={<EditIcon/>}
                                    size="xs"
                                    variant={isOpen ? "solid" : "ghost"}
                                    colorScheme={isOpen ? "blue" : undefined}
                                    onClick={onToggle}
                                />
                            </Tooltip>
                            <Tooltip label={usedBy.length ? `In use by ${usedBy.join(", ")}` : `Delete ${KIND_LABELS[kind]}`}>
                                <Box as="span">
                                    <IconButton
                                        aria-label={`Delete ${item.name}`}
                                        icon={<DeleteIcon/>}
                                        size="xs"
                                        variant="ghost"
                                        isDisabled={usedBy.length > 0}
                                        onClick={() => remove(kind, item.id)}
                                    />
                                </Box>
                            </Tooltip>
                        </Flex>
                    </Flex>
                    {meta && <Text fontSize="xs" color="gray.500" mt="0.5" isTruncated>{meta}</Text>}
                    <Text fontSize="xs" color={usedBy.length ? "gray.500" : "gray.400"} mt="1" isTruncated title={usedBy.join(", ")}>
                        {usedBy.length
                            ? `${kind === "themes" ? "Applied to" : "Used by"} ${usedBy.join(", ")}`
                            : kind === "themes" ? "Not applied to a component yet" : "Not used yet"}
                    </Text>
                </Flex>
            </Flex>
            {isOpen && (
                <Box borderTop="1px solid" borderColor="gray.100" bg="gray.50" px="5" py="4">
                    <SimpleGrid columns={{base: 1, md: 2, xl: 3}} spacing="4">
                        {form}
                    </SimpleGrid>
                    <Flex justify="flex-end" mt="4">
                        <Button size="sm" variant="ghost" onClick={onToggle}>Done</Button>
                    </Flex>
                </Box>
            )}
        </Box>
    );
}

export function SectionList({kind, addLabel, children, onAdded}: {
    kind: TokenKind,
    addLabel: string,
    children: React.ReactNode,
    onAdded: (id: string) => void,
}) {
    const {add} = useStyleSystem();
    return (
        <Box>
            <Flex direction="column" gap="3">{children}</Flex>
            <Button size="sm" variant="secondary" mt="4" onClick={() => onAdded(add(kind))}>
                {addLabel}
            </Button>
        </Box>
    );
}
