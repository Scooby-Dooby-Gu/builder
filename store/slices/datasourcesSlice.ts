import { createSlice } from "@reduxjs/toolkit";
import { Datasource } from "models/datasource";
import { DATASOURCES } from "data/datasources";

const initialState: Datasource[] = DATASOURCES;

export const datasourcesSlice = createSlice({
    name: 'datasources',
    initialState,
    reducers: {
    }
});

export default datasourcesSlice.reducer;
