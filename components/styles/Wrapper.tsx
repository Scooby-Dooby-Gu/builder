import {Box} from "components/ui";

const Wrapper = (props) => {
    return (
        <Box
            key={props.id}
            bg={props.active && "gray.50"}
            p="5"
            mt="4"
            _hover={{bg:"gray.50"}}
        >
            {props.children}
        </Box>
    )
}

export default Wrapper;