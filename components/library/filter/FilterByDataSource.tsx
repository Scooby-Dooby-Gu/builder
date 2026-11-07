import React, {FunctionComponent, ReactElement} from "react";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {RootState} from "../../../store/store";
import {filterAndSort, setSelectedDataSources} from "../../../store/slices/collectionsSlice";
import {Datasource} from "models/datasource";
import styled from "@emotion/styled";
import {
    Box,
    Button,
    Checkbox,
    ChevronDownIcon,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Text
} from "components/ui";

export const PopoverContentStyled = styled(PopoverContent)`
  width: 250px;
`

const FilterByDataSource: FunctionComponent<{}> = (props: {}): ReactElement => {
    const selectedDatasources = useAppSelector((state: RootState) => state.collections.selectedDatasources);
    const datasources = useAppSelector((state: RootState) => state.datasources);

    const dispatch = useAppDispatch();

    const onChange = (datasource: Datasource) => {
        const dataSourceExists = selectedDatasources.filter((ds: Datasource) => datasource.id !== ds.id);

        dispatch(setSelectedDataSources(
            dataSourceExists.length === selectedDatasources.length ? [...selectedDatasources, datasource] : dataSourceExists
        ));

        dispatch(filterAndSort());
    }

    return (
        <Popover>
            <PopoverTrigger>
                <Button
                    variant="secondary"
                    w="32"
                >
                    <Text>
                        Data Source
                    </Text>

                    <ChevronDownIcon
                        ml="2"
                    />
                </Button>
            </PopoverTrigger>

            <PopoverContentStyled>
                <PopoverArrow/>

                <PopoverBody>
                    <Box
                        p={2}
                    >
                        {datasources.map((datasource: Datasource, index: number) => (
                            <Box
                                key={datasource.id}
                                mt={index > 0 && 3}
                                w="3xs"
                            >
                                <Checkbox
                                    onChange={() => onChange(datasource)}
                                    value={datasource.id}
                                    isChecked={!!selectedDatasources.find(sds => sds.id === datasource.id)}
                                >
                                    {datasource.name}
                                </Checkbox>
                            </Box>
                        ))}
                    </Box>
                </PopoverBody>
            </PopoverContentStyled>
        </Popover>
    );
}

export default FilterByDataSource;