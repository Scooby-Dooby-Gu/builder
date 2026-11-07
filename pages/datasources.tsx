import Navbar from "components/Navbar";
import { useState } from "react";
import { FormLabel, Code, Container, FormControl, HStack, Switch } from "components/ui";
import ConfigureDataTree from "components/builder/ConfigureDataTree";
import Configure from "components/builder/Configure";
import { useAppSelector } from "store/hooks";



export default function Datasources() {
    const [isVerbose, setVerbosity] = useState(false)
    
    const datasources = useAppSelector((state) => state.datasources.filter((datasource) => state.builder.datasourceIds.includes(datasource.id)));
    const data = datasources[0].sample

    return <div>
        <Navbar />
    <HStack>
        <Container>
            <FormControl>
                <FormLabel>
                Show unapplicable?
                </FormLabel>
                <Switch isChecked={isVerbose} onChange={() => setVerbosity((v) => !v)} />
            </FormControl>
            <Configure datasources={datasources} attributes={[
                {key: 'repeating', label: 'Repeating', name: 'a', value: null, jsonpath: '0.store.books.*', type: 'context' as const},
                {key: 'visibility', label: 'Visibility', name: 'a', value: true, jsonpath: null, type: 'boolean' as const},
                {key: 'text-content', label: 'Text content', name: 'a', value: null, jsonpath: '0.store.books.*.title', type: 'text' as const},
                {key: 'url-link', label: 'URL Link', name: 'a', value: 'http://google.com', jsonpath: null, type: 'text' as const},
            ]} scopes={["0.store.books.*"]} />

<h2>Mapping in primitive array:</h2>
            <p>(Mapping & repeating on the same array of strings)</p>
            <ConfigureDataTree data={data} prefix="0" intent="mapping" isVerbose={isVerbose} scopes={["0.store.bicycle.available.parts.*"]} />
            <br />
            <br />
            <br />
            <h2>Repeating example:</h2>
            <p>(Only showing tree branches with arrays)</p>
            <ConfigureDataTree data={data} prefix="0" intent="repeating" isVerbose={isVerbose} />
            <br />
            <br />
            <h2>Mapping at root:</h2>
            <p>(Only shows primitives that arent in ant array)</p>
            <ConfigureDataTree data={data} prefix="0" intent="mapping" isVerbose={isVerbose} />
            <br />
            <br />
            <br />
            <h2>Mapping inside repeater:</h2>
            <p>(Show primitives in top and repeating scope)</p>
            <ConfigureDataTree data={data} prefix="0" intent="mapping" isVerbose={isVerbose} scopes={["0.store.books.*"]}/>
            <br />
            <h2>Repeating inside repeater:</h2>
            <p>(Show arrays in top and repeating scope)</p>
            <ConfigureDataTree data={data} prefix="0" intent="repeating" isVerbose={isVerbose} scopes={["0.store.books.*"]}/>
            <br />
            <h2>Mapping inside nested repeater:</h2>
            <p>(Show primitives in top and repeating scopes)</p>
            <ConfigureDataTree data={data} prefix="0" intent="mapping" isVerbose={isVerbose} scopes={["0.store.books.*", "0.store.books.*.reviews.*"]}/>
            <br />
            <h2>Repeating inside nested repeater:</h2>
            <p>(Show arrays in top and repeating scopes)</p>
            <ConfigureDataTree data={data} prefix="0" intent="repeating" isVerbose={isVerbose} scopes={["0.store.books.*", "0.store.books.*.reviews.*"]}/>

        </Container>
        <Container>
            <Code style={{whiteSpace: 'pre'}}>
                
                {//@ts-ignore
                JSON.stringify(data,2,2)}
            </Code>
            </Container>
        </HStack>
    </div>
}
