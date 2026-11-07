import React, {FunctionComponent, ReactElement} from "react";
import {Box, Flex} from "components/ui";
import SearchByTitle from "./SearchByTitle";
import Sort from "./Sort";
import FilterByDataSource from "./FilterByDataSource";
import {RootState} from "../../../store/store";
import {useAppSelector} from "../../../store/hooks";

const Filter: FunctionComponent<{}> = (props: {}): ReactElement => {
    const datasources = useAppSelector((state: RootState) => state.datasources);

    return (
        <Flex
            align="center"
            wrap="wrap"
        >
            <Box>
                <SearchByTitle/>
            </Box>

            <Box
                ml="4"
            >
                <Sort/>
            </Box>

            <Box
                ml="4"
            >
                {datasources.length > 0 && <FilterByDataSource/>}
            </Box>
        </Flex>
    )
}

export default Filter;
