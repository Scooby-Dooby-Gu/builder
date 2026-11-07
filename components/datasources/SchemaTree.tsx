import React, {useState} from "react";
import {
    Badge,
    Box,
    ChevronDownIcon,
    ChevronRightIcon,
    Code,
    CopyIcon,
    Flex,
    IconButton,
    Text,
    Tooltip,
    useToast,
} from "components/ui";
import {FieldNode, FieldType} from "utils/schema";

const TYPE_COLORS: Record<FieldType, string> = {
    "text": "gray",
    "rich text": "gray",
    "url": "cyan",
    "image": "pink",
    "number": "orange",
    "boolean": "yellow",
    "date": "teal",
    "empty": "gray",
    "object": "blue",
    "list": "purple",
    "collection": "purple",
};

function typeLabel(node: FieldNode) {
    if (node.type === "collection") return `collection · ${node.count}`;
    if (node.type === "list") return `list · ${node.count}`;
    return node.type;
}

const COLUMNS = "minmax(220px, 1.2fr) 130px minmax(160px, 1.3fr) minmax(200px, 1.2fr)";

export default function SchemaTree({fields}: { fields: FieldNode[] }) {
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const toast = useToast();

    const toggle = (path: string) => setCollapsed(prev => {
        const next = new Set(prev);
        next.has(path) ? next.delete(path) : next.add(path);
        return next;
    });

    const copy = (path: string) => {
        navigator.clipboard?.writeText(path);
        toast({title: "Path copied", description: path, status: "success", duration: 1800, isClosable: true});
    };

    const rows: React.ReactElement[] = [];
    const addRows = (nodes: FieldNode[], depth: number) => {
        for (const node of nodes) {
            const hasChildren = node.children.length > 0;
            const isOpen = !collapsed.has(node.path);
            rows.push(
                <Box
                    key={node.path}
                    display="grid"
                    gridTemplateColumns={COLUMNS}
                    alignItems="center"
                    gap="4"
                    px="4"
                    py="2"
                    borderTop="1px solid"
                    borderColor="gray.100"
                    _hover={{bg: "gray.50"}}
                    role="group"
                >
                    <Flex align="center" pl={`${depth * 20}px`} minW={0}>
                        {hasChildren ? (
                            <IconButton
                                aria-label={isOpen ? `Collapse ${node.key}` : `Expand ${node.key}`}
                                icon={isOpen ? <ChevronDownIcon/> : <ChevronRightIcon/>}
                                size="xs"
                                variant="ghost"
                                mr="1"
                                onClick={() => toggle(node.path)}
                            />
                        ) : <Box w="6" mr="1" flexShrink={0}/>}
                        <Text fontFamily="mono" fontSize="sm" fontWeight={hasChildren ? "semibold" : "normal"} isTruncated>
                            {node.key}
                        </Text>
                    </Flex>

                    <Box>
                        <Badge colorScheme={TYPE_COLORS[node.type]} variant="subtle" textTransform="none" fontWeight="medium">
                            {typeLabel(node)}
                        </Badge>
                    </Box>

                    <Text fontSize="sm" color="gray.500" isTruncated title={node.example}>
                        {node.example ?? ""}
                    </Text>

                    <Flex align="center" minW={0}>
                        <Code fontSize="xs" bg="transparent" color="gray.600" px="0" isTruncated title={node.path}>
                            {node.path}
                        </Code>
                        <Tooltip label="Copy path">
                            <IconButton
                                aria-label={`Copy path ${node.path}`}
                                icon={<CopyIcon/>}
                                size="xs"
                                variant="ghost"
                                ml="auto"
                                opacity={0}
                                _groupHover={{opacity: 1}}
                                _focus={{opacity: 1}}
                                onClick={() => copy(node.path)}
                            />
                        </Tooltip>
                    </Flex>
                </Box>
            );
            if (hasChildren && isOpen) addRows(node.children, depth + 1);
        }
    };
    addRows(fields, 0);

    return (
        <Box border="1px solid" borderColor="gray.200" borderRadius="lg" overflowX="auto" bg="white">
            <Box minW="760px">
            <Box
                display="grid"
                gridTemplateColumns={COLUMNS}
                gap="4"
                px="4"
                py="2"
                bg="gray.50"
                fontSize="xs"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="wider"
                color="gray.500"
            >
                <Text pl="7">Field</Text>
                <Text>Type</Text>
                <Text>Example</Text>
                <Text>Path</Text>
            </Box>
            {rows}
            </Box>
        </Box>
    );
}
