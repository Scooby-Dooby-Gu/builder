import {Box, Button} from "components/ui";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import fetchColors from "../../../store/actions/styles/fetchColorsAction";
import {useEffect} from "react";
import {RootState} from "../../../store/store";
import {Color as ColorModel} from "../../../store/slices/stylesSlice";
import Color from "./Color";

const Colors = () => {
    const colors = useAppSelector((state: RootState) => state.styles.colors);

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchColors());
    }, [])

    return (
        <Box>
            <Button
                mt="10"
                variant="primary"
                // onClick={e => dispatch(createFont())}
            >
                Add new
            </Button>

            {colors.map((color: ColorModel) => (
                <Color
                    colors={color.colors}
                    key={color.id}
                    title={color.title}
                    id={color.id}
                    description={color.description}
                    active={color.active}
                    preview={color.preview}
                    name={color.name}
                />
            ))}
        </Box>
    )
}

export default Colors;