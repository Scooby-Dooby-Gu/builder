import SidebarItem from "./SidebarItem";
import {Section,} from "../../../store/slices/stylesSlice";
import {AccordionButton, AccordionIcon, AccordionPanel, Text} from "components/ui";

interface Props {
    title: string,
    sections: Section[]
}

const SidebarGroup = (props: Props) => {
    const {title, sections} = props;

    return (
        <>
            <AccordionButton
                px="3"
                boxShadow="none"
                _focus={{boxShadow: "none"}}
            >
                <Text
                    px="2"
                    fontSize="x-small"
                    color="gray.500"
                    fontWeight="bold"
                >
                    {title.toUpperCase()}
                </Text>

                <AccordionIcon/>
            </AccordionButton>

            <AccordionPanel
                p="0"
            >
                {sections.map((section, index) => (
                    <SidebarItem
                        key={index}
                        section={section}
                    />
                ))}
            </AccordionPanel>
        </>
    )
}

export default SidebarGroup;