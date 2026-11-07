import { Box, Flex, Stack, Accordion, AccordionItem, Text, AccordionButton, AccordionIcon, AccordionPanel, Badge } from "components/ui"
import { ConfiguredAttribute } from "models/builder"
import { Datasource } from "models/datasource"
import { useEffect, useState } from "react";
import ConfigureAttribute from "./ConfigureAttribute"


export function cleanCollectionBit(path) {
    return path.replace(/(\[[^\]\[]+\]|\.\*)$/g, '');
}
export function getLastPathBit(path) {
    return cleanCollectionBit(path).split('.').pop();
}
export function getHumanizedLabel(path) {
    var bits = cleanCollectionBit(path).split(/]\.|\.\*\./g).pop().split(/\./g).slice(-3);
    bits = bits.filter((b) => isNaN(parseInt(b)));
    return bits.map((bit) => bit.charAt(0).toUpperCase() + bit.slice(1)).join(' ')
}

export default function Configure(
    { datasources = [], attributes = [], scopes = [] }:
        { datasources: Datasource[], attributes: ConfiguredAttribute[], scopes: string[] }) {

    const [accordionIndex, setAccordionIndex] = useState(-1)

    // Rows match the editor's other toolbar menus: 32px rows, 13px text, 16px gray icons.
    return <Accordion allowToggle={true} onChange={(index) => {
        setAccordionIndex(Number(index))
    }} index={accordionIndex} width="340px" maxW="full">
        {attributes.map((attribute) => (
            <AccordionItem key={attribute.key} border="none">
                {({ isExpanded }) => <>
                    <AccordionButton
                        minH="32px"
                        px="2.5"
                        py="1"
                        borderRadius="md"
                        bg={isExpanded ? "gray.100" : undefined}
                        _hover={{ bg: "gray.100" }}
                        _focus={{ boxShadow: "none" }}
                        _focusVisible={{ boxShadow: "outline" }}
                    >
                        <Flex align="center" gap="2.5" width="100%" textAlign="left" whiteSpace="nowrap" minW={0}>
                            <Box
                                as="span"
                                display="inline-flex"
                                color="gray.500"
                                flexShrink={0}
                                sx={{ "& svg": { width: "16px", height: "16px" } }}
                            >
                                {attribute.icon}
                            </Box>
                            <Text fontSize="13px" fontWeight="medium" color="gray.700">
                                {attribute.label}
                            </Text>
                            <Stack direction="row" align="center" ml="auto" spacing={2} minWidth={0}>
                                {attribute.qualifier && <Text fontSize="xs" color="gray.500">{attribute.qualifier}</Text>}
                                {!attribute.jsonpath && attribute.value != null && attribute.value !== '' && typeof attribute.value !== 'boolean' &&
                                    <Text fontSize="xs" color="gray.500" isTruncated maxW="120px">
                                        {attribute.name == 'data-path-src' ? String(attribute.value || '').split('/').pop() : String(attribute.value)}
                                    </Text>}
                                {attribute.jsonpath &&
                                    <Badge variant="datapath" colorScheme={"green"}>{getLastPathBit(attribute.jsonpath)}</Badge>}
                                <AccordionIcon color="gray.400" boxSize="4" />
                            </Stack>
                        </Flex>
                    </AccordionButton>

                    <AccordionPanel px="2.5" pt="3" pb="4" fontSize="sm" sx={{ "& .chakra-form__label": { fontSize: "13px", fontWeight: "medium", color: "gray.600", mb: 1 } }}>
                        <ConfigureAttribute datasources={datasources} attribute={attribute} scopes={scopes} />
                    </AccordionPanel>
                </>}
            </AccordionItem>
        ))}
    </Accordion>


}