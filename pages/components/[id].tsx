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

const ComponentEditor = () => {
    const router = useRouter()
    const id = router.query.id ? String(router.query.id) : null;
    const dispatch = useAppDispatch();
    const [loadedId, setLoadedId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);

    // The editor builds its roots from the variants in the store when it starts,
    // so the saved draft has to be loaded first.
    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setLoadedId(null);
        setError(null);
        fetchComponentDraft(id)
            .then(({draft, published}) => {
                if (cancelled) return;
                dispatch(loadComponent({
                    id,
                    variants: draft?.variants?.length ? draft.variants : SEED_VARIANTS,
                    draftUpdatedAt: draft?.updatedAt ?? null,
                    published,
                }));
                setLoadedId(id);
            })
            .catch((e) => !cancelled && setError(e.message));
        return () => { cancelled = true; };
    }, [id, dispatch, attempt]);

    return <>
        <Head>
          <title>Edit component · Builder</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Navbar/>
        {error && <Flex direction="column" align="center" gap="3" py="20">
            <Text color="gray.600">Couldn’t load this component: {error}</Text>
            <Button size="sm" variant="secondary" onClick={() => setAttempt((n) => n + 1)}>Try again</Button>
        </Flex>}
        {!error && loadedId !== id && <Flex justify="center" py="20"><Spinner color="gray.400"/></Flex>}
        {!error && loadedId && loadedId === id && <Editor key={loadedId} />}
    </>
}

export default ComponentEditor;
