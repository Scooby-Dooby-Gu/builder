import {useAppSelector} from "../../store/hooks";
import {RootState} from "../../store/store";
import {firstLetterUppercase} from "../../utils/string";
import {SectionsTitles} from "../../store/slices/stylesSlice";
import Fonts from "./fonts/Fonts";
import Colors from "./colors/Colors";
import Typography from "./typography/Typography";
import {Box, Button, Flex, H2, Spacer, Text} from "components/ui";

const Content = (props) => {
    const activeSection = useAppSelector((state: RootState) => state.styles.activeSection);

    return (
        <Box
            pl="272px"
            w="full"
            pr="5"
            pt="5"
        >
            <Flex>
                <Box>
                    <H2
                        fontWeight="semibold"
                    >
                        {firstLetterUppercase(activeSection.title)}
                    </H2>

                    <Text
                        mt="3"
                    >
                        {activeSection.description}
                    </Text>
                </Box>

                <Spacer/>

                <Button
                    variant="secondary"
                    size="sm"
                >
                    Reset to Default
                </Button>
            </Flex>

            {activeSection.title === SectionsTitles.FONT && <Fonts/>}
            {activeSection.title === SectionsTitles.COLORS && <Colors/>}
            {activeSection.title === SectionsTitles.TYPOGRAPHY && <Typography/>}
        </Box>
    )
}

export default Content