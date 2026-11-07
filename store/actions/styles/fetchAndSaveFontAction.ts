import {createAsyncThunk} from "@reduxjs/toolkit";
import {getSegment} from "../../../utils/url";
import {Font, saveFont, SectionsTitles, setActiveSection, toggleActive} from "../../slices/stylesSlice";
import {RootState} from "../../store";

const fetchAndSaveFont = createAsyncThunk(
    'styles/saveFont',
    async (arg: Partial<Font>, thunkAPI) => {
        await window.WebFont.load({
            google: {
                families: [arg.name.split(" ").join("+")]
            }
        });

        thunkAPI.dispatch(saveFont(arg));
    }
)

export default fetchAndSaveFont;