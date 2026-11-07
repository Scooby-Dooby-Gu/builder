import React from "react";
import Head from "next/head";
import {useAppSelector} from "store/hooks";
import {googleFontsUrl} from "utils/styleSystem";

// Loads the style guide's Google fonts on every page, so themes render with the
// right fonts in the builder too. One link per font, so a misspelled family
// can't block the others.
export default function FontLinks() {
    const fonts = useAppSelector(state => state.styles.system.fonts);
    return (
        <Head>
            {fonts.filter(f => f.source === "google").map(font => {
                const url = googleFontsUrl([font]);
                return url ? <link key={font.id} rel="stylesheet" href={url}/> : null;
            })}
        </Head>
    );
}
