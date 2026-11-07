import {createAsyncThunk} from "@reduxjs/toolkit";
import {getSegment} from "../../../utils/url";
import {
    Font,
    saveFont,
    SectionsTitles,
    setActiveSection,
    setColors,
    setFonts,
    toggleActive
} from "../../slices/stylesSlice";
import {RootState} from "../../store";
import * as Api from "../../../utils/api";
import fetchAndSaveFont from "./fetchAndSaveFontAction";

const fetchColors = createAsyncThunk(
    'styles/fetchColors',
    async (arg, thunkAPI) => {
        const fonts = await Api.fetchColors();

        thunkAPI.dispatch(setColors(fonts));
    }
)

export default fetchColors;