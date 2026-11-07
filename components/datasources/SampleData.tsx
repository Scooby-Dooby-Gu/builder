import React from "react";
import {Box, Button, CopyIcon, Flex, Text, useClipboard} from "components/ui";

export default function SampleData({data}: { data: any }) {
    const json = JSON.stringify(data, null, 2);
    const {hasCopied, onCopy} = useClipboard(json);

    return (
        <Box border="1px solid" borderColor="gray.200" borderRadius="lg" overflow="hidden">
            <Flex align="center" px="4" py="2" bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                <Text fontSize="sm" color="gray.600">
                    Sample payload · {json.split("\n").length} lines
                </Text>
                <Button size="xs" variant="ghost" ml="auto" leftIcon={<CopyIcon/>} onClick={onCopy}>
                    {hasCopied ? "Copied" : "Copy JSON"}
                </Button>
            </Flex>
            <Box
                as="pre"
                m="0"
                p="4"
                maxH="65vh"
                overflow="auto"
                fontFamily="mono"
                fontSize="sm"
                lineHeight="1.6"
                bg="gray.900"
                color="gray.100"
            >
                {json}
            </Box>
        </Box>
    );
}
