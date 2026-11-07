import React, {useEffect} from "react";
import {useAppDispatch} from "../../../store/hooks";
import {SectionsTitles} from "../../../store/slices/stylesSlice";
import TypographyForm from "./TypographyForm";
import {Box, Flex, Spacer, Text} from "components/ui";
import fetchAndSaveFont from "../../../store/actions/styles/fetchAndSaveFontAction";
import Heading from "../Heading";
import HeadingActions from "../HeadingActions";
import Wrapper from "../Wrapper";

interface Props {
    title: string,
    id: string,
    description: string,
    preview: string,
    active: boolean,
    name: string
}

const Font = (props: Props) => {
    const {id, preview, active, title, description, name} = props;

    return (
        <Wrapper
            active={active}
        >
            <Flex
                align="center"
            >
                <Box>
                    <Text
                        style={{fontFamily: name}}
                        fontSize="xxx-large"
                    >
                        {preview}
                    </Text>
                </Box>

                <Spacer/>

                <HeadingActions
                    active={active}
                    id={id}
                    type={SectionsTitles.FONT}
                />
            </Flex>

            <Heading
                title={title}
                description={description}
            />

            {active && <TypographyForm
                title={title}
                id={id}
                description={description}
                preview={preview}
                name={name}
            />}
        </Wrapper>
    )
}

export default Font;