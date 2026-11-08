import React, {useState} from "react";
import {
    Badge, Box, Button, Code, Flex, FormControl, FormLabel, Input, NativeSelect,
    Text, Textarea, useToast,
} from "components/ui";
import {createDatasource, testDatasource} from "utils/api";
import {Datasource} from "models/datasource";

export default function ConnectDatasourceForm({onCancel, onCreated}: {
    onCancel: () => void,
    onCreated: (datasource: Datasource) => void,
}) {
    const toast = useToast();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [kind, setKind] = useState<"rest" | "graphql">("rest");
    const [endpoint, setEndpoint] = useState("");
    const [method, setMethod] = useState<"GET" | "POST">("GET");
    const [token, setToken] = useState("");
    const [extraHeaders, setExtraHeaders] = useState("{}");
    const [query, setQuery] = useState("");
    const [jsonText, setJsonText] = useState("{}");
    const [sample, setSample] = useState<unknown>(null);
    const [tested, setTested] = useState(false);
    const [busy, setBusy] = useState(false);

    const config = () => {
        let extra: unknown;
        let variables: unknown;
        try { extra = JSON.parse(extraHeaders || "{}"); }
        catch { throw new Error("Additional headers must be valid JSON."); }
        if (!extra || Array.isArray(extra) || typeof extra !== "object") throw new Error("Additional headers must be a JSON object.");
        try { variables = JSON.parse(jsonText || "{}"); }
        catch { throw new Error(kind === "graphql" ? "GraphQL variables must be valid JSON." : "The request body must be valid JSON."); }
        if (!variables || Array.isArray(variables) || typeof variables !== "object") throw new Error("Use a JSON object for variables or the request body.");
        const headers = {...extra as Record<string, string>};
        if (token.trim()) headers.Authorization = `Bearer ${token.trim()}`;
        return {name, description, kind, endpoint, method, query, variables, headers};
    };

    const test = async () => {
        setBusy(true);
        try {
            const result = await testDatasource(config());
            setSample(result.sample);
            setTested(true);
            toast({title: "Connection successful", description: "The JSON response is ready to use for field bindings.", status: "success", duration: 3000, isClosable: true});
        } catch (error) {
            setTested(false);
            toast({title: "Couldn’t connect", description: (error as Error).message, status: "error", duration: 5000, isClosable: true});
        } finally {
            setBusy(false);
        }
    };

    const save = async () => {
        setBusy(true);
        try {
            const datasource = await createDatasource(config());
            onCreated(datasource);
        } catch (error) {
            toast({title: "Couldn’t save data source", description: (error as Error).message, status: "error", duration: 5000, isClosable: true});
        } finally {
            setBusy(false);
        }
    };

    return (
        <Box border="1px solid" borderColor="gray.200" borderRadius="xl" p={{base: "5", md: "7"}} bg="white" boxShadow="sm">
            <Flex align="flex-start" mb="6" gap="4">
                <Box>
                    <Text fontSize="lg" fontWeight="semibold">Connect a live API</Text>
                    <Text fontSize="sm" color="gray.600" mt="1">Connect REST or GraphQL data from Contentful or another headless CMS. Credentials stay on the server.</Text>
                </Box>
                <Badge ml="auto" colorScheme="green" variant="subtle">Server-side</Badge>
            </Flex>

            <Box display="grid" gridTemplateColumns={{base: "1fr", md: "1fr 1fr"}} gap="4">
                <FormControl isRequired>
                    <FormLabel>Data source name</FormLabel>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Product catalog" maxLength={80}/>
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>API type</FormLabel>
                    <NativeSelect value={kind} onChange={e => {setKind(e.target.value as "rest" | "graphql"); setTested(false);}}>
                        <option value="rest">REST API</option>
                        <option value="graphql">GraphQL API</option>
                    </NativeSelect>
                </FormControl>
                <FormControl isRequired gridColumn={{md: "1 / -1"}}>
                    <FormLabel>{kind === "graphql" ? "GraphQL endpoint" : "API endpoint"}</FormLabel>
                    <Input value={endpoint} onChange={e => {setEndpoint(e.target.value); setTested(false);}} placeholder={kind === "graphql" ? "https://graphql.contentful.com/content/v1/spaces/..." : "https://api.example.com/products"} type="url"/>
                    <Text fontSize="xs" color="gray.500" mt="1">Use the full HTTPS URL. For Contentful, include your space and environment in the endpoint.</Text>
                    <Text fontSize="xs" color="gray.500" mt="1">
                        Contentful’s GraphQL API and REST Delivery API work here. Paste a Contentful access token above; other CMS APIs can use a bearer token or custom headers.
                    </Text>
                </FormControl>
                {kind === "rest" && <FormControl>
                    <FormLabel>Request method</FormLabel>
                    <NativeSelect value={method} onChange={e => {setMethod(e.target.value as "GET" | "POST"); setTested(false);}}>
                        <option value="GET">GET</option><option value="POST">POST</option>
                    </NativeSelect>
                </FormControl>}
                <FormControl>
                    <FormLabel>Bearer token <Text as="span" fontWeight="normal" color="gray.500">(optional)</Text></FormLabel>
                    <Input type="password" autoComplete="new-password" value={token} onChange={e => {setToken(e.target.value); setTested(false);}} placeholder="API token"/>
                </FormControl>
                <FormControl gridColumn={{md: "1 / -1"}}>
                    <FormLabel>Additional headers <Text as="span" fontWeight="normal" color="gray.500">(JSON, optional)</Text></FormLabel>
                    <Textarea value={extraHeaders} onChange={e => {setExtraHeaders(e.target.value); setTested(false);}} fontFamily="mono" fontSize="sm" rows={2} placeholder={'{"X-API-Key":"your-key"}'}/>
                </FormControl>
                {kind === "graphql" && <FormControl isRequired gridColumn={{md: "1 / -1"}}>
                    <FormLabel>GraphQL query</FormLabel>
                    <Textarea value={query} onChange={e => {setQuery(e.target.value); setTested(false);}} fontFamily="mono" fontSize="sm" rows={7} placeholder={'query Products {\n  productCollection { items { name slug } }\n}'}/>
                </FormControl>}
                {(kind === "graphql" || method === "POST") && <FormControl gridColumn={{md: "1 / -1"}}>
                    <FormLabel>{kind === "graphql" ? "Variables" : "JSON request body"}</FormLabel>
                    <Textarea value={jsonText} onChange={e => {setJsonText(e.target.value); setTested(false);}} fontFamily="mono" fontSize="sm" rows={3}/>
                </FormControl>}
            </Box>

            {tested && <Box mt="5" border="1px solid" borderColor="green.200" borderRadius="md" overflow="hidden">
                <Text px="3" py="2" bg="green.50" color="green.800" fontSize="sm" fontWeight="medium">Response sample · fields become available for binding</Text>
                <Box as="pre" m="0" p="3" maxH="220px" overflow="auto" fontSize="xs" bg="gray.900" color="gray.100">{JSON.stringify(sample, null, 2)}</Box>
            </Box>}

            <Flex mt="6" gap="3" justify="flex-end" wrap="wrap">
                <Button variant="ghost" onClick={onCancel} isDisabled={busy}>Cancel</Button>
                <Button variant="secondary" onClick={test} isLoading={busy} isDisabled={!name.trim() || !endpoint.trim()}>
                    Test connection
                </Button>
                <Button variant="primary" onClick={save} isLoading={busy} isDisabled={!tested || !name.trim()}>
                    Save data source
                </Button>
            </Flex>
            <Text mt="4" fontSize="xs" color="gray.500">
                API access runs through Builder’s server. Use an endpoint you trust; responses are limited to 300 KB and requests time out after 8 seconds.
            </Text>
        </Box>
    );
}
