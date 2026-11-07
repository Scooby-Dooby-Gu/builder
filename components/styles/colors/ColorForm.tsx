import {useAppDispatch} from "../../../store/hooks";
import {saveFont} from "../../../store/slices/stylesSlice";
import {useState} from "react";
import fetchAndSaveFont from "../../../store/actions/styles/fetchAndSaveFontAction";
import {shallowEqual} from "../../../utils/object";
import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "components/ui";

interface Props {
    title: string,
    id: string,
    description: string,
    preview: string,
    name: string
}

const ColorForm = (props: Props) => {
    const {title, id, description, preview, name} = props;

    const initialFont = {title, id, description, preview, name}

    const dispatch = useAppDispatch();

    const [font, setFont] = useState({
        name,
        title,
        id,
        description,
        preview
    });

    return (
        <Tabs
            mt="8"
        >
            <TabList>
                <Tab>
                    Details
                </Tab>

                <Tab>
                    Info
                </Tab>
            </TabList>

            <TabPanels>
                <TabPanel>
                    <FormControl
                        w="xs"
                        mt="3"
                    >
                        <FormLabel>
                            Title
                        </FormLabel>

                        <Input
                            value={font.title}
                            bg="white"
                            onChange={e => setFont({...font, title: e.target.value})}
                            type="text"
                        />
                    </FormControl>

                    <FormControl
                        w="xs"
                        mt="3"
                    >
                        <FormLabel>
                            Description
                        </FormLabel>

                        <Input
                            value={font.description}
                            bg="white"
                            onChange={e => setFont({...font, description: e.target.value})}
                            type="text"
                        />
                    </FormControl>

                    <FormControl
                        w="xs"
                        mt="3"
                    >
                        <FormLabel>
                            Preview
                        </FormLabel>

                        <Input
                            value={font.preview}
                            bg="white"
                            onChange={e => {
                                setFont({...font, preview: e.target.value})

                                dispatch(saveFont({...props, preview: e.target.value}))
                            }}
                            type="text"
                        />
                    </FormControl>
                </TabPanel>

                <TabPanel>
                    <FormControl
                        w="xs"
                        mt="3"
                    >
                        <FormLabel>
                            Type the font you want to use
                        </FormLabel>

                        <Input
                            value={font.name}
                            bg="white"
                            onChange={e => setFont({...font, name: e.target.value})}
                            type="text"
                        />
                    </FormControl>
                </TabPanel>
            </TabPanels>

            <Flex
                px="4"
            >
                <Button
                    variant="primary"
                    mt="5"
                    onClick={e => dispatch(fetchAndSaveFont(font))}
                >
                    Save
                </Button>

                {!shallowEqual(initialFont, font) &&
                    <Button
                        ml="5"
                        variant="secondary"
                        mt="5"
                        onClick={e => setFont(initialFont)}
                    >
                        Discard
                    </Button>
                }
            </Flex>
        </Tabs>
    )
}

export default ColorForm;