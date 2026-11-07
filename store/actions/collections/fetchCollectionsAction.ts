import {createAsyncThunk} from "@reduxjs/toolkit";
import {setCollections} from "../../slices/collectionsSlice";
import * as API from "../../../utils/api";
import {arrayToObject} from "../../../utils/array";

const fetchCollections = createAsyncThunk(
    'collections/fetchCollections',
    async (arg, thunkAPI) => {
        const {dispatch} = thunkAPI;

        try {
            const collections = await API.fetchCollections();

            dispatch(setCollections(arrayToObject(collections)));
        } catch (error) {
            // Handle error
        }
    }
)

export default fetchCollections;