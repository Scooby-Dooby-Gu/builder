import React, {useEffect, useState} from "react";
import SidebarGroup from "./SidebarGroup";
import {useAppSelector} from "../../../store/hooks";
import {RootState} from "../../../store/store";
import {Group} from "../../../store/slices/stylesSlice";
import {Accordion, AccordionItem, Box} from "components/ui";

const Sidebar = () => {
    const groups = useAppSelector((state: RootState) => state.styles.groups);
    const activeSection = useAppSelector((state: RootState) => state.styles.activeSection);

    const [active, setActive] = useState<any>([]);

    useEffect(() => {
        setActive([
            ...active,
            groups.findIndex(group => group.sections.find(section => section.title === activeSection.title))
        ])
    }, [activeSection])

    return (
        <Box
            bg="gray.50"
            h="full"
            w="64"
            pt="24"
            pos="fixed"
            top="0"
            left="0"
        >
            <Accordion
                allowMultiple
                index={active}
                onChange={i => setActive(i)}
            >
                {groups.map((group: Group, index: number) => (
                    <AccordionItem
                        border="none"
                        key={index}
                    >
                        <SidebarGroup
                            title={group.title}
                            sections={group.sections}
                        />
                    </AccordionItem>
                ))}
            </Accordion>
        </Box>
    )
}

export default Sidebar;