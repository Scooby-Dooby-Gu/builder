import { Badge, Switch, Stack, FormControl, FormLabel, Tabs, TabList, Tab, TabPanel, TabPanels, Input, FormHelperText, FormErrorMessage, Select, Link, Code, Button, CloseIcon, Text, Container, Box } from "components/ui"
import { ConfiguredAttribute } from "models/builder";
import { Datasource } from "models/datasource";
import { useEffect, useState } from "react";
import { getLastPathBit } from "./Configure";
import ConfigureDataTree from "./ConfigureDataTree"

function DataUnmapping({attribute, mentionOverride = false, ...props}, {attribute: ConfiguredAttribute}) {
    return attribute.jsonpath && <Box {...props}>
        <Text variant="subtle">
            {attribute.type == 'context'
                ? 'This element is set to repeat for each item in: '
                : mentionOverride && attribute.value != null
                    ? 'This value is used as a placeholder inside the editor, and will be overriden by the mapped value of:' 
                    : 'This property is mapped to use value of: '}
            <Badge variant="datapath" colorScheme="green">{getLastPathBit(attribute.jsonpath)}</Badge>
        </Text>
        <Button variant="secondary" mt={4} leftIcon={<CloseIcon />} onClick={() => attribute.onConfigure(null)}>
            {attribute.type == 'context'
                ? 'Remove repeating'
                : 'Remove mapping'}
        </Button>
</Box>
}

export default function ConfigureAttribute(
    { datasources, attribute, scopes }:
        { datasources: Datasource[], attribute: ConfiguredAttribute, scopes: string[] }) {


    const showRemove = (attribute.value != null || attribute.jsonpath != null) && attribute.labels?.remove;
    const showSet = attribute.labels?.set;

    
    const values = datasources.map((datasource) => {
        return {
            label: datasource.name,
            id: datasource.id,
        }
    })

    const [showDetails, setShowDetails] = useState(false);

    const [datasourceId, setDatasourceId] = useState(() => {
        return datasources[0]?.id ?? '0';
    })

    const [textpath, setTextpath] = useState(attribute.value);
    const [tabIndex, setTabIndex] = useState(() => attribute.name == 'data-path' ? 1 : 0)

    useEffect(() => {
        if (tabIndex == 0 && !showSet) {
            setTabIndex(1);
        } else if (tabIndex == 2 && !showRemove) {
            setTabIndex(1);
        }
    }, [tabIndex, showRemove, showSet])

    useEffect(() => {
        setTextpath(attribute.jsonpath);
    }, [attribute.jsonpath]);

    const value = values.find((v) => v.id == datasourceId)

    const datasource = datasources.find((d) => d.id == value.id);
    const data = datasource ? datasource.sample : null;

    const validate = (value) => {
        if (attribute.type == 'url') {
            if (typeof value != 'string' || (!value.startsWith('/') && !value.includes('//'))) {
                return 'Value does not look like an URL'
            }
        }
        if (attribute.type == 'boolean') {
            if (typeof value != 'boolean' && typeof value != 'number') {
                return 'Value does not look like an boolean'
            }
        }
    }

    const DataMapping = <>
        <FormControl zIndex={2}>
            <FormLabel>Data source</FormLabel>
            <Select options={values} value={value} />
        </FormControl>
        <br />
        <FormControl display={"flex"} alignItems="center" float="right" width="auto" zIndex={"1"}>
            <FormLabel mb="0" htmlFor="is-expert">
                Show details
            </FormLabel>
            <Switch id="is-expert" onChange={() => setShowDetails((v) => !v)} isChecked={showDetails}>

            </Switch>
        </FormControl>
        <FormLabel>
            {showDetails ? <Link href="https://www.npmjs.com/package/jsonpath-plus">JSONPath</Link> : 'Path'}
            {' '}to data {attribute.type == 'context' ? 'collection' : 'value'}</FormLabel>

        {showDetails && <Input
            type="text"
            mb={4}
            fontFamily="mono"
            value={textpath}
            onChange={(e) => setTextpath(e.target.value)}
            onBlur={(e) => attribute.onConfigure(e.target.value)}
            placeholder="JSON Path" />}
        <FormControl>
            <ConfigureDataTree
                validator={validate}
                isVerbose={showDetails}
                onConfigure={attribute.onConfigure}
                intent={attribute.type == 'context' ? "repeating" : 'mapping'}
                data={data}
                prefix={datasourceId}
                path={attribute.jsonpath}
                scopes={scopes}
            />
        </FormControl>
    </>
    if (attribute.type == 'context') {
    //    return DataMapping
    }

    // select data mapping by default if
    const defaultIndex =
        // already has data binding
        (attribute.jsonpath && attribute.name != 'data-path-scope'
            // is text variable
            || attribute.name == 'data-path'
            // already in repeating scope
            || scopes.length > 0 && attribute.name != 'data-path-scope' ? 1 : 0);

    
    return <Tabs index={tabIndex} onChange={setTabIndex} isFitted={true}>
        {(showSet || showRemove) && <TabList whiteSpace={"nowrap"}>
            <Tab key="a" hidden={!showSet}>
                {attribute.labels?.set}
            </Tab>
            <Tab key="b">
                {attribute.labels?.configure || 'Data mapping'}
            </Tab>
            <Tab key="c" hidden={!showRemove}>
                {attribute.labels?.remove} 
            </Tab>
        </TabList>}
        <TabPanels>
            <TabPanel key="a" hidden={!(attribute.labels?.set && attribute.name != 'data-path-text')}>
                <FormControl id="email">
                    <FormLabel>
                    </FormLabel>

                    {attribute.type == 'boolean' && <Switch
                        size="lg"
                        isChecked={attribute.value}
                        onChange={(e) => attribute.onChange(!attribute.value)} />}
                    {attribute.type != 'boolean' && <Input
                        placeholder={attribute.type == 'url' ? 'http://' : ''}
                        defaultValue={attribute.value}
                        key={attribute.value}
                        onBlur={(e) => attribute.onChange(e.target.value)} />}
                    <FormHelperText>
                        {attribute.name == 'data-path-href'
                            ? 'Paste URL here to create a link over the element'
                            : attribute.name == 'data-path-src'
                                ? 'Paste URL to an image here'
                                : attribute.name == 'data-path-text' || attribute.name == 'data-path'
                                    ? 'This text label will only be visible in the editor'
                                    : attribute.name == 'data-path-hidden'
                                        ? 'Element will not show up unless switch is turned on'
                                        : 'Fill in value for the attribute here.'}
                    </FormHelperText>
                    <FormErrorMessage>
                        Error here
                    </FormErrorMessage>
                </FormControl>
                <DataUnmapping attribute={attribute} mentionOverride={true}
                    bg="gray.100"
                    maxW="sm"
                    mt={4}
                    padding="4" />
            </TabPanel>

            <TabPanel key="b">
                {DataMapping}
            </TabPanel>

            <TabPanel key="c" hidden={!showRemove}>
                {attribute.jsonpath && <DataUnmapping attribute={attribute} />}
                {!attribute.jsonpath && attribute.value != null && <>
                    {attribute.labels?.hasData && <Text variant="subtle">
                        {attribute.labels?.hasData}
                    </Text>}
                    <Button variant="secondary" mt={4} leftIcon={<CloseIcon />} onClick={() => attribute.onChange(null)}>
                        {attribute.labels?.clear || 'Remove data'}
                    </Button>
                </>}
                {!attribute.jsonpath && attribute.value == null && <>
                    <Text variant="subtle">{attribute.name == 'data-path-href' ? 'This element does not have a link associated to it' :
                        attribute.name == 'data-path-scope' ? 'This element is not mapped to any data collection and will not repeat' :
                            'No value will be used for this attribute.'}</Text>
                </>}
            </TabPanel>
        </TabPanels>
    </Tabs>
}
