import { Stack, Accordion, AccordionItem, H2, Text, AccordionButton, AccordionIcon, AccordionPanel, Icon, RepeatIcon, Badge } from "components/ui"
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

    return <Accordion allowToggle={true} onChange={(index) => {
        setAccordionIndex(Number(index))
    }} index={accordionIndex}>
        {attributes.map((attribute) => (
            <AccordionItem key={attribute.key} style={{ width: 400 }}>
                <H2>
                    <AccordionButton>
                        <Stack
                            direction="row"
                            align="center"
                            style={{ width: '100%', textAlign: 'left', whiteSpace: 'nowrap' }}
                        >
                            {attribute.icon}
                            <Text fontWeight="bold">
                                {attribute.label}
                            </Text>
                            <Stack
                                direction="row"
                                align="center"
                                style={{ marginLeft: 'auto' }}
                                spacing={2}
                                minWidth={0}
                            >
                                <Text variant="subtle" >
                                    {attribute.qualifier} </Text>
                                {!attribute.jsonpath && <Text variant="subtle" noOfLines={0} whiteSpace="nowrap" display="block">
                                    {attribute.name == 'data-path-src' ? String(attribute.value || '').split('/').pop() : attribute.value}</Text>}


                                {attribute.jsonpath && <>
                                    <Badge variant="datapath" colorScheme={"green"}>{getLastPathBit(attribute.jsonpath)}</Badge>
                                </>}

                                <AccordionIcon ml="2" />
                            </Stack>
                        </Stack>
                    </AccordionButton>
                </H2>

                <AccordionPanel>
                    <ConfigureAttribute datasources={datasources} attribute={attribute} scopes={scopes} />
                </AccordionPanel>
            </AccordionItem>
        ))}
    </Accordion>


}