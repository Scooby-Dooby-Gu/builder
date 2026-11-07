import React, {useState} from "react";
import {Box, Input, InputGroup, InputRightAddon, NativeSelect, SimpleGrid, Text} from "components/ui";
import ItemCard, {SectionList, useStyleSystem} from "./ItemCard";
import {Field, NumberField, Segmented, TextField, TokenSelect} from "./fields";
import {find, responsiveSizes, StyleSystem, TextStyle, textStyleCss} from "utils/styleSystem";

const WEIGHTS = [300, 400, 500, 600, 700, 800];
const SAMPLE = "Build interfaces from live data";

// Optional size per breakpoint (except the smallest, where the base size applies).
// Left empty, a breakpoint inherits the size from the one below it.
function ResponsiveSizes({system, style, onChange}: {
    system: StyleSystem, style: TextStyle, onChange: (sizes: Record<string, number>) => void,
}) {
    const sorted = [...system.breakpoints].sort((a, b) => a.width - b.width).slice(1);
    if (!sorted.length) return null;
    let inherited = style.size;
    return (
        <Field label="Size at breakpoints" help="Leave empty to keep the size from the smaller screen.">
            <SimpleGrid columns={2} spacing="2">
                {sorted.map(bp => {
                    const own = style.sizes?.[bp.id];
                    const placeholder = String(inherited);
                    if (own != null) inherited = own;
                    return (
                        <Box key={bp.id}>
                            <Text fontSize="xs" color="gray.500" mb="0.5">{bp.name} · {bp.width}px+</Text>
                            <InputGroup size="sm">
                                <Input
                                    type="number"
                                    bg="white"
                                    min={8}
                                    max={160}
                                    placeholder={placeholder}
                                    value={own ?? ""}
                                    onChange={e => {
                                        const next = {...(style.sizes ?? {})};
                                        const n = parseFloat(e.target.value);
                                        if (Number.isNaN(n)) delete next[bp.id]; else next[bp.id] = n;
                                        onChange(next);
                                    }}
                                    aria-label={`${style.name} size at ${bp.name}`}
                                />
                                <InputRightAddon>px</InputRightAddon>
                            </InputGroup>
                        </Box>
                    );
                })}
            </SimpleGrid>
        </Field>
    );
}

function sizeSummary(system: StyleSystem, style: TextStyle) {
    const steps = responsiveSizes(system, style.id).map(s => s.size);
    return [style.size, ...steps].join(" → ");
}

export function TextStylesSection() {
    const {system, update} = useStyleSystem();
    const [openId, setOpenId] = useState<string | null>(null);

    return (
        <SectionList kind="textStyles" addLabel="Add text style" onAdded={setOpenId}>
            {system.textStyles.map(style => {
                const font = find(system.fonts, style.fontId);
                const color = find(system.colors, style.colorId);
                const set = (patch: Record<string, any>) => update("textStyles", style.id, patch);
                return (
                    <ItemCard
                        key={style.id}
                        kind="textStyles"
                        item={style}
                        isOpen={openId === style.id}
                        onToggle={() => setOpenId(prev => prev === style.id ? null : style.id)}
                        meta={`${font?.name ?? "No font"} · ${sizeSummary(system, style)}px · ${style.weight} · ${color?.name ?? "No color"}`}
                        preview={
                            <Box minW="0" w="full">
                                <Text style={textStyleCss(system, style.id)} m="0" isTruncated>{SAMPLE}</Text>
                            </Box>
                        }
                        form={<>
                            <TextField label="Name" value={style.name} onChange={name => set({name})}/>
                            <TokenSelect label="Font" items={system.fonts} value={style.fontId} onChange={fontId => set({fontId})}/>
                            <TokenSelect
                                label="Color"
                                items={system.colors}
                                value={style.colorId}
                                onChange={colorId => set({colorId})}
                                describe={c => c.value}
                            />
                            <NumberField label="Base size" unit="px" min={8} max={160} value={style.size} onChange={size => set({size})}/>
                            <ResponsiveSizes system={system} style={style} onChange={sizes => set({sizes})}/>
                            <Field label="Weight" help={font && !font.weights.includes(style.weight) && font.source === "google" ? `${font.name} doesn't load this weight; the browser will fake it.` : undefined}>
                                <NativeSelect size="sm" value={style.weight} onChange={e => set({weight: Number(e.target.value)})}>
                                    {WEIGHTS.map(w => (
                                        <option key={w} value={w}>
                                            {w}{font?.source === "google" && !font.weights.includes(w) ? " (not loaded)" : ""}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </Field>
                            <NumberField label="Line height" min={0.8} max={3} step={0.05} precision={2} value={style.lineHeight} onChange={lineHeight => set({lineHeight})}/>
                            <NumberField label="Letter spacing" unit="em" min={-0.1} max={0.5} step={0.005} precision={3} value={style.letterSpacing} onChange={letterSpacing => set({letterSpacing})}/>
                            <Segmented
                                label="Case"
                                value={style.uppercase}
                                options={[{value: false, label: "As typed"}, {value: true, label: "Uppercase"}]}
                                onChange={uppercase => set({uppercase})}
                            />
                        </>}
                    />
                );
            })}
        </SectionList>
    );
}
