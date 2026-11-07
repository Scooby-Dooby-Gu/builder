import React, {FunctionComponent, ReactElement, ReactNode, useEffect} from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/styles/sidebar/Sidebar";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import Content from "../components/styles/Content";
import {useRouter} from "next/router";
import {RootState} from "../store/store";
import {SectionsTitles, setActiveSection} from "../store/slices/stylesSlice";
import Head from "next/head";
import Script from "next/script";
import {Flex} from "components/ui";
import {NextPage} from "next";

const Styles: NextPage = () => {
    const groups = useAppSelector((state: RootState) => state.styles.groups);

    const dispatch = useAppDispatch();
    const router = useRouter()

    useEffect(() => {
        const {section: sectionQuery} = router.query;

        for (const group of groups) {
            for (const section of group.sections) {
                if (section.title === sectionQuery && Object.values(SectionsTitles).includes(sectionQuery as SectionsTitles)) {
                    dispatch(setActiveSection(section));

                    return;
                }
            }
        }
    }, [router.query])

    return (
        <>
            <Navbar/>

            <Head>
                <title>Style Guide</title>
            </Head>

            <Script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"/>

            <Flex
                h="full"
                w="full"
            >
                <Sidebar/>
                <Content/>
            </Flex>
        </>
    )
}

export default Styles;