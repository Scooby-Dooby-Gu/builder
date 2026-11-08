import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Datasource } from "models/datasource";
import { DATASOURCES } from "data/datasources";
import * as API from "utils/api";

const initialState: Datasource[] = DATASOURCES;

export const loadDatasources = createAsyncThunk("datasources/load", () => API.fetchDatasources());

export const datasourcesSlice = createSlice({
    name: 'datasources',
    initialState,
    reducers: {
        addDatasource: (state, action: PayloadAction<Datasource>) => [...state.filter(ds => ds.id !== action.payload.id), action.payload],
    },
    extraReducers: builder => builder.addCase(loadDatasources.fulfilled, (_state, action) => action.payload),
});

export const {addDatasource} = datasourcesSlice.actions;
export default datasourcesSlice.reducer;
