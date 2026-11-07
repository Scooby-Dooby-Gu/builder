import React, {FunctionComponent} from "react";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {RootState} from "../../../store/store";
import {setSortBy, sort} from "../../../store/slices/collectionsSlice";
import {PopoverContentStyled} from "./FilterByDataSource";
import {
    Box,
    Button,
    ChevronDownIcon,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverTrigger,
    Radio,
    Text
} from "components/ui";

const sortFilters = [{id: "published_at", label: 'Published'}, {id: "modified_at", label: 'Last Modified'}];

const Sort: FunctionComponent<{}> = (props: {}) => {
    const sortBy = useAppSelector((state: RootState) => state.collections.sortBy);

    const dispatch = useAppDispatch();

    const onChange = (e) => {
        dispatch(setSortBy(e.target.value));

        dispatch(sort());
    }

    return (
        <Popover>
            <PopoverTrigger>
                <Button
                    variant="secondary"
                    w="200px"
                >
                    <Text
                        variant="microcopy"
                    >
                        Sort by:
                    </Text>

                    <Text
                        ml="1"
                    >
                        {sortBy && sortFilters.find(s => sortBy === s.id).label}
                    </Text>

                    <ChevronDownIcon ml="2"/>
                </Button>
            </PopoverTrigger>

            <PopoverContentStyled>
                <PopoverArrow/>

                <PopoverBody>
                    <Box
                        p="2"
                    >
                        {sortFilters.map((sortFilter: { id: string, label: string }, index: number) => (
                            <Box
                                key={sortFilter.id}
                                mt={index > 0 && 3}
                                w="200px"
                            >
                                <Radio
                                    onChange={onChange}
                                    value={sortFilter.id}
                                    isChecked={sortBy === sortFilter.id}
                                >
                                    {sortFilter.label}
                                </Radio>
                            </Box>
                        ))}
                    </Box>

                </PopoverBody>
            </PopoverContentStyled>
        </Popover>
    )
}

export default Sort;