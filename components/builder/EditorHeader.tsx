import Link from "next/link";
import { useRouter } from "next/router";
import { Box, Divider, FormControl, FormLabel , HStack, NativeSelect, Switch, Text, Tooltip } from "components/ui";
import { useAppDispatch, useAppSelector } from "store/hooks";
import { setDataDisplayed, setDataRepeated, setHiddenDisplayed } from "store/slices/builderSlice";
import { setComponentTheme } from "store/slices/stylesSlice";

// Pick the style guide theme that styles this component's variants.
function ThemePicker() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const componentId = String(router.query.id ?? "");
    const themes = useAppSelector((state) => state.styles.system.themes);
    const themeId = useAppSelector((state) => state.styles.componentThemes[componentId] ?? "");

    return <FormControl display="flex" alignItems="center" width="auto">
        <FormLabel mb="0" htmlFor="select-theme">
            Theme
        </FormLabel>
        <NativeSelect
            id="select-theme"
            size="sm"
            width="44"
            bg="white"
            value={themeId}
            onChange={(e) => dispatch(setComponentTheme({ componentId, themeId: e.target.value || null }))}
        >
            <option value="">No theme</option>
            {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
        </NativeSelect>
        <Link href="/styles/themes" passHref>
            <Text as="a" ml="3" fontSize="sm" color="blue.600" whiteSpace="nowrap" _hover={{ textDecoration: "underline" }}>
                Edit themes
            </Text>
        </Link>
    </FormControl>
}

export default function EditorHeader() {
    const dispatch = useAppDispatch();
    const isDataDisplayed = useAppSelector((state) => state.builder.isDataDisplayed);
    const isDataRepeated = useAppSelector((state) => state.builder.isDataRepeated);
    const isHiddenDisplayed = useAppSelector((state) => state.builder.isHiddenDisplayed);
    const hasData = useAppSelector((state) => state.builder.hasData);
    const hasRepeating = useAppSelector((state) => state.builder.hasRepeating);
    
    return <HStack justifyContent="center" spacing={8} py={8} background="gray.100" flexWrap="wrap" rowGap={4}>
        <ThemePicker />
        <Box alignSelf="stretch"><Divider orientation="vertical" borderColor="gray.300" /></Box>
        <Tooltip label="Not implemented">
            <FormControl display="flex" alignItems="center" width="auto" isDisabled={true}>
                    <FormLabel mb="0" htmlFor="switch-repeating">
                        Show outlines
                    </FormLabel>
                    <Switch  id="switch-repeating" />
            </FormControl>
        </Tooltip>
        <Tooltip label={hasData ? null : "Component does not use data"}>
            <FormControl display="flex" alignItems="center" width="auto">
                <FormLabel mb="0" htmlFor="switch-data">
                    Show hidden
                </FormLabel>
                <Switch  id="switch-data" isChecked={isHiddenDisplayed} onChange={(e) => dispatch(setHiddenDisplayed(e.target.checked))} />
            </FormControl>
        </Tooltip>
        <Tooltip label={hasData ? null : "Component does not use data"}>
            <FormControl display="flex" alignItems="center" width="auto" isDisabled={!hasData}>
                <FormLabel mb="0" htmlFor="switch-data">
                    Show data
                </FormLabel>
                <Switch  id="switch-data" isChecked={isDataDisplayed} onChange={(e) => dispatch(setDataDisplayed(e.target.checked))} />
            </FormControl>
        </Tooltip>
        <Tooltip label={hasRepeating ? null : "Component does not use repeating"}>
            <FormControl display="flex" alignItems="center" width="auto" isDisabled={!hasRepeating}>
                <FormLabel mb="0" htmlFor="switch-repeating">
                    Repeat data
                </FormLabel>
                <Switch  id="switch-repeating" isChecked={isDataRepeated} onChange={(e) => dispatch(setDataRepeated(e.target.checked))} />
            </FormControl>
        </Tooltip>

    </HStack>
}