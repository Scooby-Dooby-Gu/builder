import React, {useState} from "react";
import {Box, NativeSelect, Text} from "components/ui";
import ItemCard, {SectionList, useStyleSystem} from "./ItemCard";
import {Field, NumberField, Segmented, TextField, TokenSelect} from "./fields";
import {find, textStyleCss} from "utils/styleSystem";

const WEIGHTS = [300, 400, 500, 600, 700, 800];
const SAMPLE = "Build interfaces from live data";

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
                        meta={`${font?.name ?? "No font"} · ${style.size}/${style.lineHeight} · ${style.weight} · ${color?.name ?? "No color"}`}
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
                            <NumberField label="Size" unit="px" min={8} max={160} value={style.size} onChange={size => set({size})}/>
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
