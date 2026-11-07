import React, {useState} from "react";
import {Box, Flex, Text} from "components/ui";
import ItemCard, {SectionList, useStyleSystem} from "./ItemCard";
import {Segmented, TextField, TokenSelect} from "./fields";
import {buttonCss, cardCss, find, linkCss, SizeToken, StyleSystem, textStyleCss} from "utils/styleSystem";

function useOpen() {
    const [openId, setOpenId] = useState<string | null>(null);
    return {openId, setOpenId, toggle: (id: string) => setOpenId(prev => prev === id ? null : id)};
}

const px = (t: SizeToken) => `${t.value}px`;
const nameOf = (system: StyleSystem, list: keyof StyleSystem, id: string | null) =>
    (find(system[list] as { id: string, name: string }[], id)?.name) ?? null;

function Caption({children}: { children: React.ReactNode }) {
    return <Text fontSize="2xs" textTransform="uppercase" letterSpacing="wider" color="gray.400" mt="2" textAlign="center">{children}</Text>;
}

export function ButtonsSection() {
    const {system, update} = useStyleSystem();
    const {openId, setOpenId, toggle} = useOpen();

    return (
        <SectionList kind="buttons" addLabel="Add button" onAdded={setOpenId}>
            {system.buttons.map(button => {
                const css = buttonCss(system, button);
                const set = (patch: Record<string, any>) => update("buttons", button.id, patch);
                return (
                    <ItemCard
                        key={button.id}
                        kind="buttons"
                        item={button}
                        isOpen={openId === button.id}
                        onToggle={() => toggle(button.id)}
                        previewBg="gray.50"
                        meta={[
                            nameOf(system, "textStyles", button.textStyleId),
                            nameOf(system, "colors", button.backgroundId) ?? "Transparent",
                            `${nameOf(system, "radii", button.radiusId) ?? "No"} radius`,
                        ].filter(Boolean).join(" · ")}
                        preview={
                            <Flex gap="6" align="flex-start">
                                <Box>
                                    <Box as="button" type="button" sx={{...css.base, "&:hover": css.hover}}>Get started</Box>
                                    <Caption>Default</Caption>
                                </Box>
                                <Box>
                                    <Box as="span" display="inline-block" sx={{...css.base, ...css.hover, cursor: "default"}}>Get started</Box>
                                    <Caption>Hover</Caption>
                                </Box>
                            </Flex>
                        }
                        form={<>
                            <TextField label="Name" value={button.name} onChange={name => set({name})}/>
                            <TokenSelect label="Text style" items={system.textStyles} value={button.textStyleId} onChange={textStyleId => set({textStyleId})}/>
                            <TokenSelect label="Text color" items={system.colors} value={button.textColorId} onChange={textColorId => set({textColorId})} describe={c => c.value}/>
                            <TokenSelect label="Background" items={system.colors} value={button.backgroundId} onChange={backgroundId => set({backgroundId})} allowNone noneLabel="Transparent" describe={c => c.value}/>
                            <TokenSelect label="Hover background" items={system.colors} value={button.hoverBackgroundId} onChange={hoverBackgroundId => set({hoverBackgroundId})} allowNone noneLabel="No change" describe={c => c.value}/>
                            <TokenSelect label="Border" items={system.colors} value={button.borderColorId} onChange={borderColorId => set({borderColorId})} allowNone noneLabel="No border" describe={c => c.value}/>
                            <TokenSelect label="Corner radius" items={system.radii} value={button.radiusId} onChange={radiusId => set({radiusId})} describe={px}/>
                            <TokenSelect label="Padding, sides" items={system.spacing} value={button.paddingXId} onChange={paddingXId => set({paddingXId})} describe={px}/>
                            <TokenSelect label="Padding, top and bottom" items={system.spacing} value={button.paddingYId} onChange={paddingYId => set({paddingYId})} describe={px}/>
                        </>}
                    />
                );
            })}
        </SectionList>
    );
}

export function LinksSection() {
    const {system, update} = useStyleSystem();
    const {openId, setOpenId, toggle} = useOpen();

    return (
        <SectionList kind="links" addLabel="Add link style" onAdded={setOpenId}>
            {system.links.map(link => {
                const css = linkCss(system, link);
                const set = (patch: Record<string, any>) => update("links", link.id, patch);
                const surrounding = textStyleCss(system, link.textStyleId);
                return (
                    <ItemCard
                        key={link.id}
                        kind="links"
                        item={link}
                        isOpen={openId === link.id}
                        onToggle={() => toggle(link.id)}
                        meta={[
                            nameOf(system, "textStyles", link.textStyleId),
                            nameOf(system, "colors", link.colorId),
                            link.underline === "always" ? "Underlined" : link.underline === "hover" ? "Underline on hover" : "No underline",
                        ].filter(Boolean).join(" · ")}
                        preview={
                            <Text m="0" style={{...surrounding, color: surrounding.color}}>
                                Read the{" "}
                                <Box as="a" href="#" onClick={(e: React.MouseEvent) => e.preventDefault()} sx={{...css.base, "&:hover": css.hover}}>
                                    getting started guide
                                </Box>
                                {" "}before you publish.
                            </Text>
                        }
                        form={<>
                            <TextField label="Name" value={link.name} onChange={name => set({name})}/>
                            <TokenSelect label="Text style" items={system.textStyles} value={link.textStyleId} onChange={textStyleId => set({textStyleId})}/>
                            <TokenSelect label="Color" items={system.colors} value={link.colorId} onChange={colorId => set({colorId})} describe={c => c.value}/>
                            <TokenSelect label="Hover color" items={system.colors} value={link.hoverColorId} onChange={hoverColorId => set({hoverColorId})} describe={c => c.value}/>
                            <Segmented
                                label="Underline"
                                value={link.underline}
                                options={[{value: "always", label: "Always"}, {value: "hover", label: "On hover"}, {value: "none", label: "Never"}]}
                                onChange={underline => set({underline})}
                            />
                        </>}
                    />
                );
            })}
        </SectionList>
    );
}

export function CardsSection() {
    const {system, update} = useStyleSystem();
    const {openId, setOpenId, toggle} = useOpen();

    return (
        <SectionList kind="cards" addLabel="Add card" onAdded={setOpenId}>
            {system.cards.map(card => {
                const set = (patch: Record<string, any>) => update("cards", card.id, patch);
                return (
                    <ItemCard
                        key={card.id}
                        kind="cards"
                        item={card}
                        isOpen={openId === card.id}
                        onToggle={() => toggle(card.id)}
                        previewBg="gray.100"
                        meta={[
                            nameOf(system, "colors", card.backgroundId),
                            `${nameOf(system, "radii", card.radiusId) ?? "No"} radius`,
                            card.shadow === "none" ? "No shadow" : `${card.shadow.toUpperCase()} shadow`,
                        ].filter(Boolean).join(" · ")}
                        preview={
                            <Box w="full" maxW="md" my="2" style={cardCss(system, card)}>
                                <Text m="0" mb="2" style={textStyleCss(system, card.titleStyleId)}>Spring catalog</Text>
                                <Text m="0" style={textStyleCss(system, card.bodyStyleId)}>
                                    New arrivals are in. Each card can repeat over a data source and bind its title and text to fields.
                                </Text>
                            </Box>
                        }
                        form={<>
                            <TextField label="Name" value={card.name} onChange={name => set({name})}/>
                            <TokenSelect label="Background" items={system.colors} value={card.backgroundId} onChange={backgroundId => set({backgroundId})} describe={c => c.value}/>
                            <TokenSelect label="Border" items={system.colors} value={card.borderColorId} onChange={borderColorId => set({borderColorId})} allowNone noneLabel="No border" describe={c => c.value}/>
                            <TokenSelect label="Corner radius" items={system.radii} value={card.radiusId} onChange={radiusId => set({radiusId})} describe={px}/>
                            <TokenSelect label="Padding" items={system.spacing} value={card.paddingId} onChange={paddingId => set({paddingId})} describe={px}/>
                            <Segmented
                                label="Shadow"
                                value={card.shadow}
                                options={[{value: "none", label: "None"}, {value: "sm", label: "S"}, {value: "md", label: "M"}, {value: "lg", label: "L"}]}
                                onChange={shadow => set({shadow})}
                            />
                            <TokenSelect label="Title text style" items={system.textStyles} value={card.titleStyleId} onChange={titleStyleId => set({titleStyleId})}/>
                            <TokenSelect label="Body text style" items={system.textStyles} value={card.bodyStyleId} onChange={bodyStyleId => set({bodyStyleId})}/>
                        </>}
                    />
                );
            })}
        </SectionList>
    );
}
