import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import dynamic from 'next/dynamic';
import Head from 'next/head'

import Navbar from 'components/Navbar';
import {Button, Flex, Spinner, Text} from "components/ui";
import {useAppDispatch} from "store/hooks";
import {loadComponent, SEED_VARIANTS} from "store/slices/builderSlice";
import {fetchComponentDraft} from "utils/api";

const Editor = dynamic(() => import('components/builder/EditorCanvas'), {
  ssr: false,
});

type LoadState =
    | { status: "loading" }
    | { status: "ready", id: string }
    | { status: "error", message: string };

const ComponentEditor = () => {
    const router = useRouter()
    const id = router.query.id ? String(router.query.id) : null;
    const dispatch = useAppDispatch();
    // loading ──▶ ready | error ──(Try again)──▶ loading
    const [load, setLoad] = useState<LoadState>({status: "loading"});
    const [attempt, setAttempt] = useState(0);

    // The editor builds its roots from the variants in the store when it starts,
    // so the saved draft has to be loaded first.
    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setLoad({status: "loading"});
        fetchComponentDraft(id)
            .then(({draft, published}) => {
                if (cancelled) return;
                dispatch(loadComponent({
                    id,
                    variants: draft?.variants?.length ? draft.variants : SEED_VARIANTS,
                    savedAt: draft?.updatedAt || null,
                    // Older servers may not send fingerprints yet; treat that as nothing to compare.
                    published: published ? {...published, variants: published.variants ?? []} : null,
                }));
                setLoad({status: "ready", id});
            })
            .catch((e) => !cancelled && setLoad({status: "error", message: e.message}));
        return () => { cancelled = true; };
    }, [id, dispatch, attempt]);

    // Ready only for the component in the URL, so switching components shows the spinner.
    const ready = load.status === "ready" && load.id === id;

    return <>
        <Head>
          <title>Edit component · Builder</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Navbar/>
        <Flex direction="column" flexGrow={1} flexShrink={0} data-load-state={ready ? "ready" : load.status}>
            {load.status === "error" && <Flex direction="column" align="center" gap="3" py="20">
                <Text color="gray.600">Couldn’t load this component: {load.message}</Text>
                <Button size="sm" variant="secondary" onClick={() => setAttempt((n) => n + 1)}>Try again</Button>
            </Flex>}
            {load.status !== "error" && !ready && <Flex justify="center" py="20"><Spinner color="gray.400"/></Flex>}
            {ready && <Editor key={load.id} />}
        </Flex>
    </>
}

export default ComponentEditor;
