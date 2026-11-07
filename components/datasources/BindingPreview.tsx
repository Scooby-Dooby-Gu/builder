import React, {useMemo, useState} from "react";
import {
    Badge,
    Box,
    Button,
    ButtonGroup,
    Code,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    LinkIcon,
    RepeatIcon,
    Switch,
    Text,
    ViewIcon,
} from "components/ui";
import Configure from "components/builder/Configure";
import ConfigureDataTree from "components/builder/ConfigureDataTree";
import {Datasource} from "models/datasource";
import {ConfiguredAttribute} from "models/builder";
import {FieldNode, findExampleBindings} from "utils/schema";

type Scenario = {
    id: string,
    label: string,
    description: string,
    intent: "mapping" | "repeating",
    scoped: boolean,
};

const SCENARIOS: Scenario[] = [
    {
        id: "map-root",
        label: "Map a value",
        description: "Binding a single property, like a heading's text. Only plain values outside any collection can be used.",
        intent: "mapping",
        scoped: false,
    },
    {
        id: "repeat-root",
        label: "Repeat an element",
        description: "Choosing a collection to repeat an element over, like one card per item. Only branches that contain collections are offered.",
        intent: "repeating",
        scoped: false,
    },
    {
        id: "map-scoped",
        label: "Map inside a repeat",
        description: "Binding a property on an element that already repeats. Values of the current item become available.",
        intent: "mapping",
        scoped: true,
    },
    {
        id: "repeat-scoped",
        label: "Nested repeat",
        description: "Repeating an element inside one that already repeats, like reviews inside each book.",
        intent: "repeating",
        scoped: true,
    },
];

export default function BindingPreview({datasource, fields}: { datasource: Datasource, fields: FieldNode[] }) {
    const examples = useMemo(() => findExampleBindings(fields), [fields]);

    const [bindings, setBindings] = useState<Record<string, string | null>>(() => ({
        repeat: examples.collection?.bindingPath ?? null,
        text: examples.text?.bindingPath ?? null,
        link: examples.link?.bindingPath ?? null,
    }));
    const [visible, setVisible] = useState(true);

    const bind = (key: string) => (path: string | null) => setBindings(prev => ({...prev, [key]: path}));

    const attributes: ConfiguredAttribute[] = [
        {
            key: "repeat", name: "data-path-scope", label: "Repeat for each", type: "context",
            icon: <RepeatIcon color="gray.500"/>, value: null, jsonpath: bindings.repeat, onConfigure: bind("repeat"),
        },
        {
            key: "text", name: "data-path-text", label: "Text content", type: "text",
            value: null, jsonpath: bindings.text, onConfigure: bind("text"),
        },
        {
            key: "link", name: "data-path-href", label: "Link", type: "url",
            icon: <LinkIcon color="gray.500"/>, value: null, jsonpath: bindings.link, onConfigure: bind("link"),
        },
        {
            key: "visibility", name: "data-path-hidden", label: "Visible", type: "boolean",
            icon: <ViewIcon color="gray.500"/>, value: visible, jsonpath: null,
            onChange: (v) => setVisible(Boolean(v)), onConfigure: () => undefined,
        },
    ];

    const scopes = bindings.repeat ? [bindings.repeat] : [];

    const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
    const [showUnavailable, setShowUnavailable] = useState(false);
    const [picked, setPicked] = useState<string | null>(null);
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    const scenarioScopes = scenario.scoped && examples.collection ? [examples.collection.bindingPath] : [];

    return (
        <Flex gap="8" align="flex-start" wrap="wrap">
            <Box flexShrink={0} w="420px">
                <Heading as="h3" size="sm" mb="1">Example element</Heading>
                <Text fontSize="sm" color="gray.500" mb="4">
                    The properties panel the builder shows for a selected element. Open a property to change what it’s bound to.
                </Text>
                <Box border="1px solid" borderColor="gray.200" borderRadius="lg" bg="white" overflow="hidden">
                    <Configure datasources={[datasource]} attributes={attributes} scopes={scopes}/>
                </Box>
            </Box>

            <Box flex="1" minW="380px">
                <Heading as="h3" size="sm" mb="1">How fields are offered</Heading>
                <Text fontSize="sm" color="gray.500" mb="4">
                    The field picker only offers data that makes sense where you are binding.
                </Text>

                <Box border="1px solid" borderColor="gray.200" borderRadius="lg" bg="white" p="5">
                    <ButtonGroup size="sm" isAttached variant="outline" mb="4" flexWrap="wrap">
                        {SCENARIOS.map(s => (
                            <Button
                                key={s.id}
                                onClick={() => { setScenarioId(s.id); setPicked(null); }}
                                isActive={s.id === scenarioId}
                                _active={{bg: "blue.50", color: "blue.700", borderColor: "blue.300"}}
                            >
                                {s.label}
                            </Button>
                        ))}
                    </ButtonGroup>

                    <Text fontSize="sm" mb="3">{scenario.description}</Text>
                    {scenario.scoped && examples.collection && (
                        <Text fontSize="sm" color="gray.500" mb="3">
                            Current repeat: <Badge colorScheme="purple" textTransform="none">{examples.collection.key}</Badge>
                        </Text>
                    )}

                    <FormControl display="flex" alignItems="center" mb="4">
                        <Switch id="show-unavailable" size="sm" isChecked={showUnavailable} onChange={() => setShowUnavailable(v => !v)}/>
                        <FormLabel htmlFor="show-unavailable" mb="0" ml="2" fontSize="sm" fontWeight="normal">
                            Show unavailable fields
                        </FormLabel>
                    </FormControl>

                    <Box bg="gray.50" borderRadius="md" py="3" pr="3" fontSize="sm" sx={{"ul": {margin: 0}, "li": {marginTop: "4px"}}}>
                        <ConfigureDataTree
                            key={scenarioId}
                            data={datasource.sample}
                            prefix={datasource.id}
                            intent={scenario.intent}
                            isVerbose={showUnavailable}
                            scopes={scenarioScopes}
                            path={picked}
                            onConfigure={setPicked}
                        />
                    </Box>

                    <Text fontSize="sm" color="gray.500" mt="3">
                        {picked
                            ? <>Selected <Code fontSize="xs">{picked}</Code></>
                            : "Click a highlighted field to select it. Hover a faded one to see why it isn’t available."}
                    </Text>
                </Box>

                <Flex gap="4" mt="4" fontSize="xs" color="gray.500" wrap="wrap">
                    <Flex align="center" gap="1"><Badge variant="datapath" colorScheme="purple">field</Badge> available</Flex>
                    <Flex align="center" gap="1"><Badge variant="datapath" colorScheme="green">field</Badge> selected</Flex>
                    <Flex align="center" gap="1"><Badge variant="datapath" colorScheme="gray">field</Badge> current repeat or not available</Flex>
                </Flex>
            </Box>
        </Flex>
    );
}
