import {createAsyncThunk} from "@reduxjs/toolkit";
import {getSegment} from "../../../utils/url";
import {Font, saveFont, SectionsTitles, setActiveSection, setFonts, toggleActive} from "../../slices/stylesSlice";
import {RootState} from "../../store";
import * as Api from "../../../utils/api";
import fetchAndSaveFont from "./fetchAndSaveFontAction";

const fetchFonts = createAsyncThunk(
    'styles/fetchFonts',
    async (arg, thunkAPI) => {
        const fonts = await Api.fetchFonts();

        await window.WebFont.load({
            google: {
                families: fonts.map(f => f.name.split(" ").join("+"))
            }
        });

        thunkAPI.dispatch(setFonts(fonts));
    }
)

export default fetchFonts;