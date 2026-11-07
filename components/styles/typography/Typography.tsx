import {Box, Button} from "components/ui";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {RootState} from "../../../store/store";
import {createFont, Font as FontModel} from "../../../store/slices/stylesSlice";
import TypographyItem from "./TypographyItem";
import {useEffect} from "react";
import fetchFonts from "../../../store/actions/styles/fetchFontsAction";

const Typography = () => {
    const fonts = useAppSelector((state: RootState) => state.styles.fonts);

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchFonts());
    }, [])

    return (
        <Box>
            <Button
                mt="10"
                variant="primary"
                onClick={e => dispatch(createFont())}
            >
                Add new
            </Button>

            {fonts.map((font: FontModel) => (
                <TypographyItem
                    key={font.id}
                    title={font.title}
                    id={font.id}
                    description={font.description}
                    active={font.active}
                    preview={font.preview}
                    name={font.name}
                />
            ))}
        </Box>
    )
}

export default Typography;