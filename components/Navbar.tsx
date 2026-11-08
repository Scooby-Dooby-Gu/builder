import React, {FunctionComponent, ReactElement} from "react";
import {useRouter} from "next/router";
import SessionBanner from "./SessionBanner";
import {useAppSelector} from "store/hooks";
import {resetSandbox, signOut} from "utils/api";
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
            active: false,
            ariaLabel: 'About this demo',
            tooltip: "A working demo of Mason’s Front-End-As-A-Service.",
            icon: <QuestionOutlineIcon/>,
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

    const session = useAppSelector((state) => state.session);
    const signInItem = {label: 'Owner sign in', onClick: () => router.push(`/login?next=${encodeURIComponent(router.asPath)}`)};
    const menu = session.role === 'owner'
        ? {name: 'Owner', items: [{label: 'Sign out', onClick: () => signOut().then(() => window.location.reload())}]}
        : {name: 'Visitor', items: [
            {label: 'Reset sandbox', onClick: () => {
                if (window.confirm("Reset your sandbox? Your changes will be discarded.")) resetSandbox().then(() => window.location.reload());
            }},
            ...(session.ownerLoginAvailable ? [signInItem] : []),
        ]};

    return (
        <>
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
                brand="Builder"
                items={items}
                menu={menu}
            />
        </Box>
            <SessionBanner/>
        </>
    )
}

export default Navbar;
