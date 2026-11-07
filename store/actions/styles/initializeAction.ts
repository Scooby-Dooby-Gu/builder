import {createAsyncThunk} from "@reduxjs/toolkit";
import {getSegment} from "../../../utils/url";
import {SectionsTitles, setActiveSection, toggleActive} from "../../slices/stylesSlice";
import {RootState} from "../../store";

const initialize = createAsyncThunk(
    'styles/initialize',
    async (arg, thunkAPI) => {

    }
)

export default initialize;