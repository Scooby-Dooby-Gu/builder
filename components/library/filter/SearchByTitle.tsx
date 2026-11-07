import React, {FunctionComponent, ReactElement} from "react";
import {RootState} from "../../../store/store";
import {useAppDispatch, useAppSelector} from "store/hooks";
import {filterAndSort, setSearch} from "../../../store/slices/collectionsSlice";
import {Box, SearchInput} from "components/ui";

const SearchByTitle: FunctionComponent<{}> = (props: {}): ReactElement => {
    const searchTerm = useAppSelector((state: RootState) => state.collections.searchTerm);

    const dispatch = useAppDispatch();

    const onChange = (value: string) => {
        dispatch(setSearch(value));

        dispatch(filterAndSort());
    }

    return (
        <Box
            w="xs"
        >
            <SearchInput
                onChange={e => onChange(e.target.value)}
                value={searchTerm}
                onClearIconClick={() => onChange("")}
                InputProps={{placeholder: "Search by Component Title"}}
            />
        </Box>
    );
}

export default SearchByTitle;