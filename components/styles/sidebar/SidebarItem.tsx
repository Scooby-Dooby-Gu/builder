import {Flex, Icon, Text} from "components/ui";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {RootState} from "../../../store/store";
import {firstLetterUppercase} from "../../../utils/string";
import {setActiveSection} from "../../../store/slices/stylesSlice";
import {useRouter} from "next/router";

interface Props {
    section: any
}

const SidebarItem = (props: Props) => {
    const {section} = props;

    const activeSection = useAppSelector((state: RootState) => state.styles.activeSection);

    const dispatch = useAppDispatch();

    const router = useRouter();

    const onClick = () => {
        dispatch(setActiveSection(section));

        router.push(`/styles/${section.title}`);
    }

    const colors = {
        bg: activeSection.title === section.title && "primary.100",
        hover: activeSection.title !== section.title && {background: "gray.100"},
        text: activeSection.title === section.title ? "primary.500" : "gray.500"
    }

    return (
        <Flex
            h="12"
            w="full"
            px="2"
            align="center"
            cursor="pointer"
            onClick={onClick}
        >
            <Flex
                px="3"
                borderRadius="md"
                align="center"
                w="full"
                h="full"
                bg={colors.bg}
                _hover={colors.hover}
            >
                <Icon
                    w="5"
                    h="5"
                    path={section.icon}
                    color={colors.text}
                />

                <Text
                    ml="4"
                    color={colors.text}
                    fontWeight="semibold"
                >
                    {firstLetterUppercase(section.title)}
                </Text>
            </Flex>
        </Flex>
    )
}

export default SidebarItem;