import React, {FunctionComponent, ReactElement} from "react";
import {useRouter} from "next/router";
import {
    QuestionOutlineIcon,
    NavigationHorizontal,
    Box,
    DotsGridIcon
} from "components/ui";

const Navbar: FunctionComponent<{}> = (props: {}): ReactElement => {
    const router = useRouter();

    const actions = [
        {
            active: false, ariaLabel: 'Toggle Drawer', icon: <QuestionOutlineIcon/>, onClick: () => {
            }
        }
    ];

    const items = [
        {
            label: 'Component Library',
            active: router.asPath.startsWith('/components'),
            onClick: () => router.push('/components')
        },
        {
            label: 'Style Guide',
            active: router.asPath.startsWith('/styles'),
            onClick: () => router.push('/styles')
        },
        {
            label: 'Data sources',
            active: router.asPath.startsWith('/datasources'),
            onClick: () => router.push('/datasources')
        }
    ];

    const menu = {name: 'John Doe', items: [{label: 'Logout'}]}

    return (
        <Box
            height="14"
            boxShadow="base"
            flexShrink={0}
            zIndex={99}
        >
            <NavigationHorizontal
                actions={actions}
                icon={<DotsGridIcon
                    cursor="pointer"
                    ml="4"
                    mr="4"
                />}
                items={items}
                menu={menu}
            />
        </Box>
    )
}

export default Navbar;