import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import * as API from "utils/api";

export interface SessionState extends Partial<API.Session> {
    loaded: boolean,
}

const initialState: SessionState = {loaded: false};

export const loadSession = createAsyncThunk("session/load", () => API.fetchSession());

export const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        setPublishesLeft: (state, action: PayloadAction<number | null | undefined>) => {
            if (action.payload != null) state.publishesLeft = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loadSession.fulfilled, (state, action) => ({...action.payload, loaded: true}));
        builder.addCase(loadSession.rejected, (state) => ({...state, loaded: true, role: "visitor"}));
    },
});

export const {setPublishesLeft} = sessionSlice.actions;
export default sessionSlice.reducer;
