import type {AppProps} from 'next/app';
import "../styles/editor-chrome.css";
import dynamic from "next/dynamic";
import {UIProvider, extendTheme, baseTheme} from "components/ui";
import Head from "next/head";
import {Provider} from "react-redux";
import store from "../store/store";
import FontLinks from "components/styleguide/FontLinks";
import {useEffect} from "react";
import {useAppDispatch} from "store/hooks";
import {loadSession} from "store/slices/sessionSlice";
import {loadDatasources} from "store/slices/datasourcesSlice";

const globalStyles = {
    styles: {
        global: {
            // Styles that allow page components 
            // to take all vertical space with flex grow
            "html, body, #__next": {
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                padding: "0",
                margin: "0"
            },
        },
    },
    components: {
        Badge: {
            variants: {
                datapath: (props) => ({
                    ...baseTheme.components.Badge.variants.subtle({
                        colorScheme: 'green',
                        ...props,
                    }),
                    lineHeight: '1.6'
                })
            }
        }
    }
}

const theme = extendTheme(globalStyles, baseTheme);

// Stack of providers shared across the app
// Extracted to be reused for different react roots
export function AppProviders({children}) {
    return (
        <UIProvider theme={theme}>
            <Provider store={store}>
                <FontLinks/>
                {children}
            </Provider>
        </UIProvider>
    );
}

// Who is using the app (owner or sandboxed visitor), loaded once.
function SessionLoader() {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(loadSession());
        dispatch(loadDatasources());
    }, [dispatch]);
    return null;
}

function App({Component, pageProps}: AppProps) {
    return (
        <AppProviders>
            <SessionLoader/>
            <Head>
                <title>Builder</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
            </Head>

            <Component {...pageProps} />
        </AppProviders>
    )
}

export default dynamic(() => Promise.resolve(App), {
    ssr: false,
});
