import styled from '@emotion/styled'
import { css } from "@emotion/react";
import { CloseButton, FormLabel, Badge, Code, Container, FormControl, HStack, RepeatIcon, Switch, Tooltip, WarningIcon } from "components/ui";

const List = styled.ul`
padding-left: 20px;
list-style: none;
`
const ListRoot = styled.ul`
list-style: none;
`
const Item = styled.li`
`


export default function ConfigureDataTree({ validator = null, data, prefix = "$", path = undefined, intent, isVerbose, scopes = [], onConfigure = undefined }) {
    return <ListRoot>
        {ConfigureDataBranch({ validator, prefix, label: prefix, data, bits: [prefix], path, intent, action: null, isVerbose, scopes, onConfigure })}
    </ListRoot>
}

type ConfigureAction = "mapping" | "rooting" | "repeating" | "nesting" | "repeating-mapping" | "indicating";

interface BranchParams {
    prefix: string,
    data: any,
    bits: string[],
    path: string | null,
    label?: string,
    intent: ConfigureAction,
    action: ConfigureAction | "reporting" | null,
    isVerbose: boolean,
    scopes: string[],
    validator?: (value: any) => string,
    onConfigure: (value: string | null) => void,
}

function walk(callback, data, key) {
    if (data != null && Array.isArray(data)) {
        for (var prop of data) {
            callback(data[prop], prop)
        }
    } else if (data != null && typeof data == 'object') {
        for (var prop1 in data) {
            callback(data[prop1], prop1)
        }
    } else {
        callback(data, key);
    }
}

function ConfigureDataLeaf({ warning, action, label, isVerbose, error, onClick, onClear }) {
    if (error) {
        if (!isVerbose) return;
        return <Tooltip label={error} >
            <Badge variant="datapath" colorScheme="red">{label}</Badge>
        </Tooltip>
    }
    var badge = null;

    if (action == 'repeating') {
        return <Badge variant="datapath" colorScheme="purple" cursor="pointer" onClick={onClick}>{label} </Badge>
    } else if (action == 'mapping') {
        if (warning) {
            //@ts-ignore
            return <Tooltip label={warning}>
                <Badge variant="datapath" colorScheme="purple" opacity={0.5} cursor="pointer" onClick={onClick}>{label}</Badge>
            </Tooltip>
        } else {
            return <Badge variant="datapath" colorScheme="purple" cursor="pointer" onClick={onClick}>{label}</Badge>
        }
    } else if (action == 'repeating-mapping') {
        return <Badge variant="datapath" colorScheme="purple" cursor="pointer" onClick={onClick}>{label} <RepeatIcon /></Badge>
    } else if (action == 'nesting') {
        return <Badge variant="datapath" colorScheme="gray">{label} <RepeatIcon /> </Badge>
    } else if (action == 'indicating') {
        return <>
            <HStack spacing={0} onClick={onClear}>
                <Badge variant="datapath" colorScheme="green" cursor="pointer">{label}</Badge>
                <CloseButton size="sm" />
            </HStack>
        </>
    } else {
        return <Badge variant="datapath" colorScheme="gray" opacity={0.5}>{label}</Badge>
    }
}

function isPrimitive(value) {
    return !(value != null && (Array.isArray(value) || typeof value == 'object'))
}

// check if paths equal, or if left path is qualifying the right with array expression ([], .*) 
function matchPath(left, right) {
    return left.startsWith(right) && left.substring(right.length).match(/^(|\.\*|\[[^]+\])$/)
}


// this following function is not great, but it handles all the cases
// as long as this mess is contained in here, it works alright.
function ConfigureDataBranch({ validator, prefix, data, bits, path, label = prefix, intent, action, isVerbose, scopes = [], onConfigure }: BranchParams) {
    var currentPath = bits.join('.');
    var shouldDescend = true;

    if (!action && scopes.find((scope) => matchPath(scope, currentPath))) {
        action = 'nesting'
    }
    if (path && matchPath(path, bits.join('.'))) {
        action = 'indicating'
        shouldDescend = false;
    }
    if (typeof data == 'object' && data != null) {
        var entries = Object.entries(data);
        if (Array.isArray(data)) {
            bits = bits.concat('*');
            if (intent == 'repeating' && !action) {
                action = 'repeating';
            }
            if (!isPrimitive(entries[0][1])) {

                entries = Object.entries(entries[0][1])
            }
            // go deeper quicker by skipping objects with a single key and going into arrays direcly
        } else if (entries.length == 1 && intent != 'rooting') {
            return ConfigureDataBranch({
                prefix: (bits.length == 1 ? '' : prefix + '.') + entries[0][0],
                validator,
                path,
                data: entries[0][1],
                bits: bits.concat(entries[0][0]),
                intent,
                action,
                isVerbose,
                onConfigure,
                scopes
            })
        }
    }


    // dont show nodes that dont contain arrays when repeating
    if (intent == 'repeating') {
        var hasArrays = action == 'repeating' || action == 'nesting';
        walk((value: any) => {
            if (Array.isArray(value))
                hasArrays = true;
        }, data, '')

        if (!hasArrays && action != 'repeating' && action != 'nesting' && action != 'indicating') {
            if (isPrimitive(data)) {
                var error = 'Only collections can be used for repeating'
            } else {
                var error = 'Does not contain collections for repeating'
            }
        };
        if (!hasArrays || action == 'repeating')
            shouldDescend = false;
    }
    if (intent == 'mapping' && (!action || action == 'nesting')) {
        if (action == 'nesting' && isPrimitive(Object.entries(data)[0][1])) {
            action = 'repeating-mapping'
            shouldDescend = false;
            currentPath += '.*' // ugh lol
        } else if (isPrimitive(data)) {
            var warning = validator ? validator(data) : null;
            action = 'mapping';
        } else {
            if (Array.isArray(data) && action != 'nesting') {
                shouldDescend = false;
                if (scopes.length) {
                    error = 'This collection is not in the current scope'
                } else {
                    error = 'Use repeating on this collection to map its values'
                }
            }
            var hasPrimitives = true;
            walk((value) => {
                if (isPrimitive(value)) hasPrimitives = true;
            }, data, '');

            if (!hasPrimitives) {
                var error = 'Does not contain primitive value'
            };
        }
    }

    return <Item key={prefix}>
        <ConfigureDataLeaf onClick={() => onConfigure(currentPath)} warning={warning} onClear={() => onConfigure(null)} label={label} action={action} error={error} isVerbose={isVerbose} />
        {entries && shouldDescend && entries.length > 0 && <List>
            {entries.map((([key, value]) => {
                return ConfigureDataBranch({
                    prefix: key,
                    validator,
                    path,
                    data: value,
                    bits: bits.concat(key),
                    intent,
                    action: null,
                    isVerbose,
                    scopes,
                    onConfigure
                })
            }))}
        </List>}
    </Item>
}