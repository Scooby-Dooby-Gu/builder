import {ChevronDownIcon, ChevronUpIcon, DotsHorizontalIcon, Flex, IconButton} from "components/ui";
import {SectionsTitles, toggleActive} from "../../store/slices/stylesSlice";
import {useAppDispatch} from "../../store/hooks";

interface Props {
    type: SectionsTitles,
    id: string,
    active: boolean
}

const HeadingActions = (props: Props) => {
    const {type, id, active} = props;

    const dispatch = useAppDispatch();

    return (
        <Flex>
            <IconButton
                icon={<DotsHorizontalIcon/>}
                aria-label=""
            />

            <IconButton
                onClick={e => {
                    // window.history.pushState({}, "", `/styles/${activeSection.title}/${id}`)
                    dispatch(toggleActive({type: type, id}))
                }}
                icon={active ? <ChevronUpIcon/> : <ChevronDownIcon/>}
                aria-label=""
            />
        </Flex>
    )
}

export default HeadingActions;