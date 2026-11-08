import Link from "next/link";
import { useRouter } from "next/router";
import {
    Box,
    Button,
    ButtonGroup,
    ChevronDownIcon,
    EditIcon,
    Flex,
    IconButton,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
    NativeSelect,
    Text,
    Tooltip,
    ViewIcon,
} from "components/ui";
import { useAppDispatch, useAppSelector } from "store/hooks";
import { setDataDisplayed, setDataRepeated, setHiddenDisplayed, setPreviewBreakpoint } from "store/slices/builderSlice";
import { setComponentTheme } from "store/slices/stylesSlice";

// The canvas toolbar. Theme is a property of the component (saved, and it changes
// the output), so it sits on the left. Preview width and the View options only
// change how the canvas renders while editing, so they sit together on the right.

function ToolbarLabel({ children, htmlFor }: { children: React.ReactNode, htmlFor?: string }) {
    return <Text as="label" htmlFor={htmlFor} fontSize="sm" color="gray.500" mr="2" whiteSpace="nowrap">{children}</Text>;
}

// Pick the style guide theme that styles this component's variants.
function ThemePicker() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const componentId = String(router.query.id ?? "");
    const themes = useAppSelector((state) => state.styles.system.themes);
    const themeId = useAppSelector((state) => state.styles.componentThemes[componentId] ?? "");

    return <Flex align="center">
        <ToolbarLabel htmlFor="select-theme">Theme</ToolbarLabel>
        <NativeSelect
            id="select-theme"
            size="sm"
            width="40"
            bg="white"
            borderRadius="md"
            value={themeId}
            onChange={(e) => dispatch(setComponentTheme({ componentId, themeId: e.target.value || null }))}
        >
            <option value="">No theme</option>
            {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
        </NativeSelect>
        <Tooltip label="Edit themes in the style guide" openDelay={300}>
            <Box as="span" ml="1">
                <Link href="/styles/themes" passHref>
                    <IconButton as="a" aria-label="Edit themes" icon={<EditIcon />} size="sm" variant="ghost" color="gray.500" />
                </Link>
            </Box>
        </Tooltip>
    </Flex>
}

// Preview the component at one of the style guide's breakpoints.
function PreviewWidthPicker() {
    const dispatch = useAppDispatch();
    const breakpoints = useAppSelector((state) => state.styles.system.breakpoints);
    const selected = useAppSelector((state) => state.builder.previewBreakpointId);
    const sorted = [...breakpoints].sort((a, b) => a.width - b.width);
    const options = [{ id: null as string | null, label: "Fit", hint: "Default canvas width" },
        ...sorted.map((bp) => ({ id: bp.id, label: bp.name, hint: `${bp.width}px wide` }))];

    return <Flex align="center">
        <ToolbarLabel>Preview</ToolbarLabel>
        <ButtonGroup size="sm" isAttached variant="outline" role="radiogroup" aria-label="Preview width">
            {options.map((option) => {
                const isActive = option.id === (selected ?? null);
                return <Tooltip key={option.id ?? "fit"} label={option.hint} openDelay={300}>
                    <Button
                        role="radio"
                        aria-checked={isActive}
                        fontWeight="medium"
                        bg={isActive ? "blue.50" : "white"}
                        color={isActive ? "blue.700" : "gray.600"}
                        borderColor={isActive ? "blue.300" : "gray.200"}
                        zIndex={isActive ? 1 : undefined}
                        _hover={{ bg: isActive ? "blue.50" : "gray.50" }}
                        onClick={() => dispatch(setPreviewBreakpoint(option.id))}
                    >
                        {option.label}
                    </Button>
                </Tooltip>;
            })}
        </ButtonGroup>
    </Flex>
}

// Editing aids that change how the canvas draws content, not the component itself.
function ViewMenu() {
    const dispatch = useAppDispatch();
    const isHiddenDisplayed = useAppSelector((state) => state.builder.isHiddenDisplayed);
    const isDataDisplayed = useAppSelector((state) => state.builder.isDataDisplayed);
    const isDataRepeated = useAppSelector((state) => state.builder.isDataRepeated);
    const hasData = useAppSelector((state) => state.builder.hasData);
    const hasRepeating = useAppSelector((state) => state.builder.hasRepeating);

    const elementValues = isHiddenDisplayed ? ["hidden"] : [];
    const dataValues = [
        ...(isDataDisplayed ? ["data"] : []),
        ...(isDataRepeated ? ["repeat"] : []),
    ];

    const optionText = (title: string, description: string) => <Box>
        <Text fontWeight="medium" color="gray.800">{title}</Text>
        <Text fontSize="xs" color="gray.500" mt="0.5">{description}</Text>
    </Box>;
    // MenuOptionGroup injects checked state into its direct MenuItemOption children,
    // so the options are written out here rather than through a wrapper component.
    const optionProps = { alignItems: "flex-start", py: "2", fontSize: "sm" };

    return <Menu closeOnSelect={false} placement="bottom-end">
        <MenuButton
            as={Button}
            size="sm"
            variant="outline"
            bg="white"
            borderColor="gray.200"
            fontWeight="medium"
            color="gray.700"
            leftIcon={<ViewIcon color="gray.500" />}
            rightIcon={<ChevronDownIcon />}
        >
            View
        </MenuButton>
        <MenuList w="300px" py="1" zIndex={30}>
            <MenuOptionGroup
                title="Elements"
                type="checkbox"
                value={elementValues}
                onChange={(values) => dispatch(setHiddenDisplayed((values as string[]).includes("hidden")))}
            >
                <MenuItemOption value="hidden" {...optionProps}>
                    {optionText("Show hidden elements", "Elements hidden by a visibility rule appear faded.")}
                </MenuItemOption>
            </MenuOptionGroup>
            <MenuDivider />
            <MenuOptionGroup
                title="Sample data"
                type="checkbox"
                value={dataValues}
                onChange={(values) => {
                    const list = values as string[];
                    if (list.includes("data") !== isDataDisplayed) dispatch(setDataDisplayed(list.includes("data")));
                    if (list.includes("repeat") !== isDataRepeated) dispatch(setDataRepeated(list.includes("repeat")));
                }}
            >
                <MenuItemOption value="data" isDisabled={!hasData} {...optionProps}>
                    {optionText("Fill in data values", hasData ? "Show values from the data source instead of field names." : "This component doesn't use a data source.")}
                </MenuItemOption>
                <MenuItemOption value="repeat" isDisabled={!hasRepeating} {...optionProps}>
                    {optionText("Repeat for each item", hasRepeating ? "Repeat elements once per item in their collection." : "This component has no repeating elements.")}
                </MenuItemOption>
            </MenuOptionGroup>
        </MenuList>
    </Menu>
}

export default function EditorHeader() {
    return <Flex
        position="sticky"
        top="0"
        zIndex={20}
        align="center"
        gap="4"
        rowGap="2"
        wrap="wrap"
        px="6"
        py="2.5"
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
    >
        <ThemePicker />
        <Flex align="center" gap="3" ml="auto" wrap="wrap" rowGap="2">
            <PreviewWidthPicker />
            <ViewMenu />
        </Flex>
    </Flex>
}
