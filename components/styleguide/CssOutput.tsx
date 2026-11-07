import React, {useMemo} from "react";
import {Box, Button, CopyIcon, Flex, Text, useClipboard} from "components/ui";
import {useStyleSystem} from "./ItemCard";
import {generateCss} from "utils/styleSystem";

export function CssSection() {
    const {system} = useStyleSystem();
    const css = useMemo(() => generateCss(system), [system]);
    const {hasCopied, onCopy} = useClipboard(css);

    return (
        <Box border="1px solid" borderColor="gray.200" borderRadius="lg" overflow="hidden">
            <Flex align="center" px="4" py="2" bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                <Text fontSize="sm" color="gray.600">
                    styles.css · {css.split("\n").length} lines · updates as you edit
                </Text>
                <Button size="xs" variant="ghost" ml="auto" leftIcon={<CopyIcon/>} onClick={onCopy}>
                    {hasCopied ? "Copied" : "Copy CSS"}
                </Button>
            </Flex>
            <Box
                as="pre"
                m="0"
                p="4"
                maxH="70vh"
                overflow="auto"
                fontFamily="mono"
                fontSize="sm"
                lineHeight="1.6"
                bg="gray.900"
                color="gray.100"
            >
                {css}
            </Box>
        </Box>
    );
}
