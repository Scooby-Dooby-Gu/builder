import React, {useEffect} from "react";
import {useAppDispatch} from "../../../store/hooks";
import {SectionsTitles} from "../../../store/slices/stylesSlice";
import {Box, Flex, Spacer} from "components/ui";
import fetchAndSaveFont from "../../../store/actions/styles/fetchAndSaveFontAction";
import Heading from "../Heading";
import HeadingActions from "../HeadingActions";
import Wrapper from "../Wrapper";
import {ChromePicker} from "react-color";

interface Props {
    title: string,
    id: string,
    description: string,
    preview: string,
    active: boolean,
    name: string,
    colors: string[]
}

const Color = (props: Props) => {
    const {id, preview, active, title, description, name, colors} = props;

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchAndSaveFont(props));
    }, [])

    return (
        <Wrapper
            active={active}
        >
            <Flex
                align="center"
            >
                <Flex>
                    {colors.map(c => (
                        <Box ml="3" bg={c} key={c} w={10} h={10}>

                        </Box>
                    ))}

                    <ChromePicker/>
                </Flex>

                <Spacer/>

                <HeadingActions
                    active={active}
                    id={id}
                    type={SectionsTitles.COLORS}
                />
            </Flex>

            <Heading
                title={title}
                description={description}
            />

            {/*{active && <ColorForm*/}
            {/*    title={title}*/}
            {/*    id={id}*/}
            {/*    description={description}*/}
            {/*    preview={preview}*/}
            {/*    name={name}*/}
            {/*/>}*/}
        </Wrapper>
    )
}

export default Color;