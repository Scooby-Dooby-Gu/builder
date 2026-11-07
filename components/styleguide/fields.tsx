import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    InputGroup,
    InputRightAddon,
    NativeSelect,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
} from "components/ui";

export function Field({label, help, children}: { label: string, help?: string, children: React.ReactNode }) {
    return (
        <FormControl>
            <FormLabel fontSize="sm" mb="1">{label}</FormLabel>
            {children}
            {help && <FormHelperText fontSize="xs">{help}</FormHelperText>}
        </FormControl>
    );
}

export function TextField({label, value, onChange, help}: {
    label: string, value: string, onChange: (value: string) => void, help?: string,
}) {
    // Commit on blur so typing doesn't rebuild every preview on each keystroke.
    const [draft, setDraft] = useState(value);
    useEffect(() => setDraft(value), [value]);
    return (
        <Field label={label} help={help}>
            <Input
                size="sm"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={() => draft !== value && onChange(draft)}
                onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            />
        </Field>
    );
}

export function NumberField({label, value, onChange, min, max, step = 1, unit, precision}: {
    label: string, value: number, onChange: (value: number) => void,
    min?: number, max?: number, step?: number, unit?: string, precision?: number,
}) {
    const input = (
        <NumberInput
            size="sm"
            value={value}
            min={min}
            max={max}
            step={step}
            precision={precision}
            onChange={(_, n) => !Number.isNaN(n) && onChange(n)}
            flex="1"
        >
            <NumberInputField borderRightRadius={unit ? 0 : undefined}/>
            <NumberInputStepper>
                <NumberIncrementStepper/>
                <NumberDecrementStepper/>
            </NumberInputStepper>
        </NumberInput>
    );
    return (
        <Field label={label}>
            {unit ? <InputGroup size="sm">{input}<InputRightAddon>{unit}</InputRightAddon></InputGroup> : input}
        </Field>
    );
}

export function ColorField({label, value, onChange}: { label: string, value: string, onChange: (value: string) => void }) {
    const [draft, setDraft] = useState(value);
    useEffect(() => setDraft(value), [value]);
    const commit = (v: string) => {
        const hex = v.startsWith("#") ? v : `#${v}`;
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) onChange(hex.toLowerCase());
        else setDraft(value);
    };
    return (
        <Field label={label}>
            <Flex gap="2">
                <Box
                    as="input"
                    type="color"
                    value={value.length === 4 ? `#${[...value.slice(1)].map(c => c + c).join("")}` : value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    w="10"
                    h="8"
                    p="0"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    cursor="pointer"
                    bg="white"
                    aria-label={`${label} picker`}
                />
                <Input
                    size="sm"
                    fontFamily="mono"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onBlur={() => commit(draft)}
                    onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                    aria-label={`${label} hex value`}
                />
            </Flex>
        </Field>
    );
}

export function TokenSelect<T extends { id: string, name: string }>({label, items, value, onChange, allowNone, noneLabel = "None", describe}: {
    label: string,
    items: T[],
    value: string | null,
    onChange: (id: string | null) => void,
    allowNone?: boolean,
    noneLabel?: string,
    describe?: (item: T) => string,
}) {
    return (
        <Field label={label}>
            <NativeSelect
                size="sm"
                value={value ?? ""}
                onChange={e => onChange(e.target.value || null)}
            >
                {allowNone && <option value="">{noneLabel}</option>}
                {!allowNone && !items.some(i => i.id === value) && <option value="">Choose…</option>}
                {items.map(item => (
                    <option key={item.id} value={item.id}>
                        {describe ? `${item.name} · ${describe(item)}` : item.name}
                    </option>
                ))}
            </NativeSelect>
        </Field>
    );
}

export function Segmented<T extends string | number | boolean>({label, value, options, onChange}: {
    label: string, value: T, options: { value: T, label: string }[], onChange: (value: T) => void,
}) {
    return (
        <Field label={label}>
            <ButtonGroup size="sm" isAttached variant="outline" display="flex">
                {options.map(o => (
                    <Button
                        key={String(o.value)}
                        flex="1"
                        fontWeight="normal"
                        isActive={o.value === value}
                        _active={{bg: "blue.50", color: "blue.700", borderColor: "blue.300", zIndex: 1}}
                        onClick={() => onChange(o.value)}
                    >
                        {o.label}
                    </Button>
                ))}
            </ButtonGroup>
        </Field>
    );
}
