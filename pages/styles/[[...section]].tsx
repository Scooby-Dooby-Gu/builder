import React from "react";
import Head from "next/head";
import {useRouter} from "next/router";
import Navbar from "components/Navbar";
import StyleSidebar from "components/styleguide/StyleSidebar";
import {layerOf, LAYERS, SectionId, SECTIONS} from "components/styleguide/sections";
import {BreakpointsSection, ColorsSection, FontsSection, SpacingSection} from "components/styleguide/Primitives";
import {TextStylesSection} from "components/styleguide/Presets";
import {ButtonsSection, CardsSection, LinksSection} from "components/styleguide/Elements";
import {CssSection} from "components/styleguide/CssOutput";
import {ThemesSection} from "components/styleguide/Themes";
import {Box, Button, ChevronRightIcon, Flex, H2, Placeholder, RepeatIcon, Text} from "components/ui";
import {useAppDispatch, useAppSelector} from "store/hooks";
import {resetSystem} from "store/slices/stylesSlice";

const CONTENT: Record<SectionId, React.FC> = {
    colors: ColorsSection,
    fonts: FontsSection,
    spacing: SpacingSection,
    breakpoints: BreakpointsSection,
    text: TextStylesSection,
    buttons: ButtonsSection,
    links: LinksSection,
    cards: CardsSection,
    themes: ThemesSection,
    css: CssSection,
};

function LayerFlow({activeLayer}: { activeLayer?: string }) {
    const steps = LAYERS.filter(l => l.id !== "output");
    return (
        <Flex align="center" gap="2" fontSize="xs" color="gray.500" mb="3" wrap="wrap">
            {steps.map((layer, i) => (
                <React.Fragment key={layer.id}>
                    {i > 0 && <ChevronRightIcon color="gray.300"/>}
                    <Text
                        as="span"
                        px="2"
                        py="0.5"
                        borderRadius="full"
                        bg={layer.id === activeLayer ? "blue.50" : "gray.100"}
                        color={layer.id === activeLayer ? "blue.700" : "gray.500"}
                        fontWeight={layer.id === activeLayer ? "semibold" : "normal"}
                    >
                        {layer.label}
                    </Text>
                </React.Fragment>
            ))}
            <ChevronRightIcon color="gray.300"/>
            <Text
                as="span"
                px="2"
                py="0.5"
                borderRadius="full"
                bg={activeLayer === "output" ? "blue.50" : "gray.100"}
                color={activeLayer === "output" ? "blue.700" : "gray.500"}
                fontWeight={activeLayer === "output" ? "semibold" : "normal"}
            >
                CSS
            </Text>
        </Flex>
    );
}

export default function StyleGuide() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const requested = Array.isArray(router.query.section) ? router.query.section[0] : undefined;
    const section = requested === undefined ? SECTIONS[0] : SECTIONS.find(s => s.id === requested);
    const Content = section ? CONTENT[section.id] : null;
    const layer = section ? layerOf(section.id) : undefined;

    const reset = () => {
        if (window.confirm("Reset the whole style guide to its defaults? Your changes will be lost.")) {
            dispatch(resetSystem());
        }
    };

    return (
        <Flex direction="column" h="full">
            <Head>
                <title>{section ? `${section.label} · ` : ""}Style Guide · Builder</title>
            </Head>
            <Navbar/>

            <Flex flex="1" minH="0">
                <StyleSidebar activeId={section?.id}/>

                <Box as="main" flex="1" minW="0" overflowY="auto" bg="white">
                    {!section ? (
                        <Box pt="16">
                            <Placeholder title="Section not found" text="Pick a section from the sidebar."/>
                        </Box>
                    ) : (
                        <Box maxW="6xl" px="8" py="6">
                            <LayerFlow activeLayer={layer?.id}/>
                            <Flex align="flex-start" gap="4" mb="6" wrap="wrap">
                                <Box flex="1" minW="260px">
                                    <H2 fontWeight="semibold" mb="1">{section.label}</H2>
                                    <Text color="gray.600">{section.description}</Text>
                                </Box>
                                <Button size="sm" variant="ghost" leftIcon={<RepeatIcon/>} ml="auto" flexShrink={0} onClick={reset}>
                                    Reset to defaults
                                </Button>
                            </Flex>
                            <Content/>
                        </Box>
                    )}
                </Box>
            </Flex>
        </Flex>
    );
}
