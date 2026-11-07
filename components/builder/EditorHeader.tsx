import { FormControl, FormLabel , HStack, Switch, Tooltip } from "components/ui";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "store/hooks";
import { setDataDisplayed, setDataRepeated, setHiddenDisplayed } from "store/slices/builderSlice";

export default function EditorHeader() {
    const dispatch = useAppDispatch();
    const isDataDisplayed = useAppSelector((state) => state.builder.isDataDisplayed);
    const isDataRepeated = useAppSelector((state) => state.builder.isDataRepeated);
    const isHiddenDisplayed = useAppSelector((state) => state.builder.isHiddenDisplayed);
    const hasData = useAppSelector((state) => state.builder.hasData);
    const hasRepeating = useAppSelector((state) => state.builder.hasRepeating);
    
    return <HStack justifyContent="center" spacing={8} py={8} background="gray.100">
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