import {useRouter} from "next/router";
import type { NextPage } from 'next'
import dynamic from 'next/dynamic';
import Head from 'next/head'

import Navbar from 'components/Navbar';

const Editor = dynamic(() => import('components/builder/EditorCanvas'), {
  ssr: false,
});

const ComponentEditor = () => {
    const router = useRouter()
    const {id} = router.query

    return <>
        <Head>
          <title>Edit component · Builder</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Navbar/>
        <Editor />
    </>
}

export default ComponentEditor;