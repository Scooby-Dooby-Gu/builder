import React, {useState} from "react";
import {Box, Checkbox, CheckboxGroup, Flex, Heading, SimpleGrid, Text, Wrap, WrapItem} from "components/ui";
import ItemCard, {SectionList, useStyleSystem} from "./ItemCard";
import {ColorField, Field, NumberField, Segmented, TextField} from "./fields";
import {fontStack, SizeToken, TokenKind} from "utils/styleSystem";
import {NativeSelect} from "components/ui";

function useOpen() {
    const [openId, setOpenId] = useState<string | null>(null);
    return {openId, setOpenId, toggle: (id: string) => setOpenId(prev => prev === id ? null : id)};
}

// Readable text color on top of a swatch.
function contrastText(hex: string) {
    const full = hex.length === 4 ? `#${[...hex.slice(1)].map(c => c + c).join("")}` : hex;
    const n = parseInt(full.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#1a202c" : "#ffffff";
}

export function ColorsSection() {
    const {system, update} = useStyleSystem();
    const {openId, setOpenId, toggle} = useOpen();

    return (
        <SectionList kind="colors" addLabel="Add color" onAdded={setOpenId}>
            <SimpleGrid columns={{base: 1, xl: 2}} spacing="3">
                {system.colors.map(color => (
                    <ItemCard
                        key={color.id}
                        kind="colors"
                        item={color}
                        isOpen={openId === color.id}
                        onToggle={() => toggle(color.id)}
                        meta={<Text as="span" fontFamily="mono">{color.value}</Text>}
                        preview={
                            <Flex
                                align="flex-end"
                                w="full"
                                h="14"
                                px="3"
                                py="2"
                                borderRadius="md"
                                bg={color.value}
                                border="1px solid"
                                borderColor="blackAlpha.100"
                                color={contrastText(color.value)}
                                fontSize="xs"
                                fontWeight="semibold"
                            >
                                Aa
                            </Flex>
                        }
                        form={<>
                            <TextField label="Name" value={color.name} onChange={name => update("colors", color.id, {name})}/>
                            <ColorField label="Value" value={color.value} onChange={value => update("colors", color.id, {value})}/>
                        </>}
                    />
                ))}
            </SimpleGrid>
        </SectionList>
    );
}

const WEIGHTS = [300, 400, 500, 600, 700, 800];
const PANGRAM = "Sphinx of black quartz, judge my vow.";

export function FontsSection() {
    const {system, update} = useStyleSystem();
    const {openId, setOpenId, toggle} = useOpen();

    return (
        <SectionList kind="fonts" addLabel="Add font" onAdded={setOpenId}>
            {system.fonts.map(font => (
                <ItemCard
                    key={font.id}
                    kind="fonts"
                    item={font}
                    isOpen={openId === font.id}
                    onToggle={() => toggle(font.id)}
                    meta={`${font.source === "google" ? "Google Fonts" : "System"} · ${font.weights.join(", ") || "default weight"}`}
                    preview={
                        <Flex align="center" gap="6" minW="0" style={{fontFamily: fontStack(font)}}>
                            <Text fontSize="4xl" lineHeight="1" flexShrink={0}>Aa</Text>
                            <Box minW="0">
                                <Text fontSize="lg" isTruncated>{PANGRAM}</Text>
                                <Wrap spacing="3" mt="1" color="gray.500" fontSize="sm">
                                    {font.weights.map(w => <WrapItem key={w} style={{fontWeight: w}}>{w}</WrapItem>)}
                                </Wrap>
                            </Box>
                        </Flex>
                    }
                    form={<>
                        <TextField label="Name" value={font.name} onChange={name => update("fonts", font.id, {name})}/>
                        <TextField
                            label={font.source === "google" ? "Google Fonts family" : "CSS font family"}
                            help={font.source === "google" ? "Exactly as listed on fonts.google.com, e.g. Playfair Display" : "e.g. system-ui or Georgia"}
                            value={font.family}
                            onChange={family => update("fonts", font.id, {family})}
                        />
                        <Segmented
                            label="Source"
                            value={font.source}
                            options={[{value: "google", label: "Google Fonts"}, {value: "system", label: "System"}]}
                            onChange={source => update("fonts", font.id, {source})}
                        />
                        <Field label="Fallback">
                            <NativeSelect size="sm" value={font.fallback} onChange={e => update("fonts", font.id, {fallback: e.target.value})}>
                                <option value="sans-serif">Sans serif</option>
                                <option value="serif">Serif</option>
                                <option value="monospace">Monospace</option>
                            </NativeSelect>
                        </Field>
                        {font.source === "google" && (
                            <Field label="Weights to load" help="Only pick weights the font offers, or it won't load.">
                                <CheckboxGroup
                                    value={font.weights.map(String)}
                                    onChange={values => update("fonts", font.id, {weights: values.map(Number).sort((a, b) => a - b)})}
                                >
                                    <Wrap spacing="3">
                                        {WEIGHTS.map(w => (
                                            <WrapItem key={w}><Checkbox size="sm" value={String(w)}>{w}</Checkbox></WrapItem>
                                        ))}
                                    </Wrap>
                                </CheckboxGroup>
                            </Field>
                        )}
                    </>}
                />
            ))}
        </SectionList>
    );
}

function ScaleList({kind, title, hint, items, addLabel, renderPreview}: {
    kind: TokenKind,
    title: string,
    hint: string,
    items: SizeToken[],
    addLabel: string,
    renderPreview: (item: SizeToken) => React.ReactNode,
}) {
    const {update} = useStyleSystem();
    const {openId, setOpenId, toggle} = useOpen();
    return (
        <Box mb="10">
            <Heading as="h3" size="sm" mb="1">{title}</Heading>
            <Text fontSize="sm" color="gray.500" mb="4">{hint}</Text>
            <SectionList kind={kind} addLabel={addLabel} onAdded={setOpenId}>
                <SimpleGrid columns={{base: 1, xl: 2}} spacing="3">
                    {[...items].sort((a, b) => a.value - b.value).map(item => (
                        <ItemCard
                            key={item.id}
                            kind={kind}
                            item={item}
                            isOpen={openId === item.id}
                            onToggle={() => toggle(item.id)}
                            meta={`${item.value}px`}
                            preview={renderPreview(item)}
                            form={<>
                                <TextField label="Name" value={item.name} onChange={name => update(kind, item.id, {name})}/>
                                <NumberField label="Value" unit="px" min={0} max={999} value={item.value} onChange={value => update(kind, item.id, {value})}/>
                            </>}
                        />
                    ))}
                </SimpleGrid>
            </SectionList>
        </Box>
    );
}

export function SpacingSection() {
    const {system} = useStyleSystem();
    return (
        <>
            <ScaleList
                kind="spacing"
                title="Spacing"
                hint="Padding steps that elements choose from."
                items={system.spacing}
                addLabel="Add spacing step"
                renderPreview={item => (
                    <Flex align="center" gap="3" w="full">
                        <Box h="4" w={`${Math.min(item.value, 200)}px`} minW="2px" bg="blue.300" borderRadius="sm"/>
                    </Flex>
                )}
            />
            <ScaleList
                kind="radii"
                title="Corner radii"
                hint="How rounded buttons and cards are."
                items={system.radii}
                addLabel="Add radius"
                renderPreview={item => (
                    <Box boxSize="12" bg="blue.50" border="2px solid" borderColor="blue.300" style={{borderRadius: `${Math.min(item.value, 24)}px`}}/>
                )}
            />
        </>
    );
}

export function BreakpointsSection() {
    const {system, update} = useStyleSystem();
    const {openId, setOpenId, toggle} = useOpen();
    const sorted = [...system.breakpoints].sort((a, b) => a.width - b.width);
    const widest = Math.max(...sorted.map(b => b.width), 1);

    return (
        <SectionList kind="breakpoints" addLabel="Add breakpoint" onAdded={setOpenId}>
            {sorted.map((bp, i) => (
                <ItemCard
                    key={bp.id}
                    kind="breakpoints"
                    item={bp}
                    isOpen={openId === bp.id}
                    onToggle={() => toggle(bp.id)}
                    meta={i === 0 ? `${bp.width}px · smallest; base sizes apply here` : `${bp.width}px and wider`}
                    preview={
                        <Box w="full">
                            <Box
                                h="10"
                                w={`${Math.max((bp.width / widest) * 100, 8)}%`}
                                border="2px solid"
                                borderColor="gray.300"
                                borderRadius="md"
                                bg="white"
                                position="relative"
                            >
                                <Box position="absolute" top="1.5" left="2" right="2" h="1.5" bg="gray.200" borderRadius="full"/>
                            </Box>
                        </Box>
                    }
                    form={<>
                        <TextField label="Name" value={bp.name} onChange={name => update("breakpoints", bp.id, {name})}/>
                        <NumberField label="Width" unit="px" min={240} max={3840} step={8} value={bp.width} onChange={width => update("breakpoints", bp.id, {width})}/>
                    </>}
                />
            ))}
        </SectionList>
    );
}
