import {Box, Divider, Flex, Text} from "components/ui";

interface Props {
    title: string,
    description: string
}

const Heading = (props: Props) => {
    const {title, description} = props;

    return (
        <Flex
            mt="5"
        >
            <Text
                fontWeight="bold"
                color="gray.500"
            >
                {title}
            </Text>

            <Box>
                <Divider
                orientation="vertical"
                mx="2"
                borderColor="blackAlpha"
            />
            </Box>


            <Text
                fontWeight="medium"
                color="gray.500"
            >
                {description}
            </Text>
        </Flex>
    )
}

export default Heading;