import React, {useMemo, useState} from "react";
import Head from "next/head";
import Link from "next/link";
import {useRouter} from "next/router";
import Navbar from "components/Navbar";
import DatasourceSidebar from "components/datasources/DatasourceSidebar";
import SchemaTree from "components/datasources/SchemaTree";
import SampleData from "components/datasources/SampleData";
import BindingPreview from "components/datasources/BindingPreview";
import ConnectDatasourceForm from "components/datasources/ConnectDatasourceForm";
import {
    Badge,
    Box,
    Button,
    Flex,
    H2,
    HStack,
    Placeholder,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from "components/ui";
import {useAppDispatch, useAppSelector} from "store/hooks";
import {addDatasource} from "store/slices/datasourcesSlice";
import {Datasource} from "models/datasource";
import {describeSchema, summarize} from "utils/schema";

export default function Datasources() {
    const router = useRouter();
    const datasources = useAppSelector(state => state.datasources);
    const dispatch = useAppDispatch();
    const [isCreating, setIsCreating] = useState(false);

    const requestedId = Array.isArray(router.query.id) ? router.query.id[0] : undefined;
    const datasource = requestedId === undefined
        ? datasources[0]
        : datasources.find(ds => ds.id === requestedId);

    const fields = useMemo(
        () => datasource ? describeSchema(datasource.sample, datasource.id) : [],
        [datasource]
    );
    const stats = summarize(fields);

    return (
        <Flex direction="column" h="full">
            <Head>
                <title>{datasource ? `${datasource.name} · ` : ""}Data sources · Builder</title>
            </Head>
            <Navbar/>

            <Flex flex="1" minH="0">
                <DatasourceSidebar datasources={datasources} activeId={datasource?.id} onAdd={() => setIsCreating(true)}/>

                <Box as="main" flex="1" minW="0" overflowY="auto" bg="white">
                    {isCreating ? (
                        <Box maxW="4xl" px="8" py="6">
                            <ConnectDatasourceForm
                                onCancel={() => setIsCreating(false)}
                                onCreated={(created: Datasource) => {
                                    dispatch(addDatasource(created));
                                    setIsCreating(false);
                                    router.push(`/datasources/${created.id}`);
                                }}
                            />
                        </Box>
                    ) : !datasource ? (
                        <Box pt="16">
                            <Placeholder
                                title="Data source not found"
                                text="It may have been removed, or the link is out of date."
                            />
                            <Flex justify="center">
                                <Link href="/datasources" passHref>
                                    <Button as="a" variant="secondary" size="sm">View all data sources</Button>
                                </Link>
                            </Flex>
                        </Box>
                    ) : (
                        <Box maxW="7xl" px="8" py="6">
                            <Box mb="6">
                                <H2 fontWeight="semibold" mb="2">{datasource.name}</H2>
                                {datasource.description && (
                                    <Text color="gray.600" mb="3">{datasource.description}</Text>
                                )}
                                <HStack spacing="2">
                                    <Badge variant="outline" colorScheme={datasource.live ? "green" : "gray"} textTransform="none">
                                        {datasource.live ? `Live ${datasource.kind === "graphql" ? "GraphQL" : "REST"}` : "JSON sample"}
                                    </Badge>
                                    <Badge variant="subtle" colorScheme="blue" textTransform="none">{stats.fields} fields</Badge>
                                    <Badge variant="subtle" colorScheme="purple" textTransform="none">
                                        {stats.collections} {stats.collections === 1 ? "collection" : "collections"}
                                    </Badge>
                                </HStack>
                                {datasource.endpoint && (
                                    <Flex mt="3" align="center" gap="2" wrap="wrap">
                                        <Text fontSize="xs" color="gray.500">Endpoint</Text>
                                        <Text as="code" fontSize="xs" color="gray.700" wordBreak="break-all">{datasource.endpoint}</Text>
                                        {datasource.authConfigured && <Badge colorScheme="green" variant="subtle" textTransform="none">Credentials saved securely</Badge>}
                                    </Flex>
                                )}
                            </Box>

                            <Tabs key={datasource.id} colorScheme="blue" isLazy>
                                <TabList>
                                    <Tab>Fields</Tab>
                                    <Tab>Sample data</Tab>
                                    <Tab>Binding preview</Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel px="0" pt="6">
                                        <Text fontSize="sm" color="gray.500" mb="4">
                                            Everything a component can bind to. Collections can repeat an element once per item; their fields are shown from the first item.
                                        </Text>
                                        <SchemaTree fields={fields}/>
                                    </TabPanel>
                                    <TabPanel px="0" pt="6">
                                        <SampleData data={datasource.sample}/>
                                    </TabPanel>
                                    <TabPanel px="0" pt="6">
                                        <BindingPreview datasource={datasource} fields={fields}/>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </Box>
                    )}
                </Box>
            </Flex>
        </Flex>
    );
}
