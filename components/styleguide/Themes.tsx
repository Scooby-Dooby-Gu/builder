import React, {useState} from "react";
import Link from "next/link";
import {Box, Text} from "components/ui";
import ItemCard, {SectionList, useStyleSystem} from "./ItemCard";
import {TextField, TokenSelect} from "./fields";
import {find, StyleSystem, themeCss, ThemeToken} from "utils/styleSystem";
import {useAppSelector} from "store/hooks";

// Sample content shaped like what the builder's editor produces, so the preview
// shows exactly how a theme will style a component.
const SAMPLE_HTML = `
<h1>Spring catalog</h1>
<p>Everything new this season, pulled straight from your data source. <a href="#">See all arrivals</a></p>
<p><a class="button" href="#">Shop now</a></p>
<h2>Featured</h2>
<div class="container">
  <h3>Sayings of the Century</h3>
  <p>Nigel Rees · $8.95</p>
  <span class="tag">Self-help</span><span class="tag">Bestseller</span>
</div>
`;

export function ThemePreview({system, theme, compact}: { system: StyleSystem, theme: ThemeToken, compact?: boolean }) {
    const scope = `.theme-preview-${theme.id}`;
    return (
        <Box w="full" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
            <style>{themeCss(system, theme, scope)}</style>
            <Box
                className={scope.slice(1)}
                p={compact ? 5 : 8}
                sx={{"a": {cursor: "pointer"}}}
                onClick={(e: React.MouseEvent) => e.preventDefault()}
                dangerouslySetInnerHTML={{__html: SAMPLE_HTML}}
            />
        </Box>
    );
}

export function ThemesSection() {
    const {system, update} = useStyleSystem();
    const componentThemes = useAppSelector(state => state.styles.componentThemes);
    const [openId, setOpenId] = useState<string | null>(null);
    const name = (list: keyof StyleSystem, id: string | null) =>
        find(system[list] as { id: string, name: string }[], id)?.name;

    return (
        <Box>
            <Text fontSize="sm" color="gray.500" mb="4">
                Pick a theme for a component from the <b>Theme</b> menu at the top of the{" "}
                <Link href="/components/4" passHref><Text as="a" color="blue.600" textDecoration="underline">builder</Text></Link>.
                It styles headings, text, links, buttons, cards and tags across every variant.
            </Text>
            <SectionList kind="themes" addLabel="Add theme" onAdded={setOpenId}>
                {system.themes.map(theme => {
                    const set = (patch: Record<string, any>) => update("themes", theme.id, patch);
                    const appliedTo = Object.entries(componentThemes)
                        .filter(([, themeId]) => themeId === theme.id)
                        .map(([componentId]) => `component ${componentId}`);
                    return (
                        <ItemCard
                            key={theme.id}
                            kind="themes"
                            item={theme}
                            isOpen={openId === theme.id}
                            onToggle={() => setOpenId(prev => prev === theme.id ? null : theme.id)}
                            previewBg="gray.100"
                            appliedTo={appliedTo}
                            meta={[name("textStyles", theme.h1StyleId), name("buttons", theme.buttonId), `${name("cards", theme.cardId)} card`].filter(Boolean).join(" · ")}
                            preview={<ThemePreview system={system} theme={theme}/>}
                            form={<>
                                <TextField label="Name" value={theme.name} onChange={v => set({name: v})}/>
                                <TokenSelect label="Background" items={system.colors} value={theme.backgroundId} onChange={backgroundId => set({backgroundId})} describe={c => c.value}/>
                                <TokenSelect label="Heading 1" items={system.textStyles} value={theme.h1StyleId} onChange={h1StyleId => set({h1StyleId})}/>
                                <TokenSelect label="Heading 2" items={system.textStyles} value={theme.h2StyleId} onChange={h2StyleId => set({h2StyleId})}/>
                                <TokenSelect label="Heading 3" items={system.textStyles} value={theme.h3StyleId} onChange={h3StyleId => set({h3StyleId})}/>
                                <TokenSelect label="Body text" items={system.textStyles} value={theme.bodyStyleId} onChange={bodyStyleId => set({bodyStyleId})}/>
                                <TokenSelect label="Accent text" items={system.textStyles} value={theme.accentStyleId} onChange={accentStyleId => set({accentStyleId})}/>
                                <TokenSelect label="Links" items={system.links} value={theme.linkId} onChange={linkId => set({linkId})}/>
                                <TokenSelect label="Buttons" items={system.buttons} value={theme.buttonId} onChange={buttonId => set({buttonId})}/>
                                <TokenSelect label="Cards" items={system.cards} value={theme.cardId} onChange={cardId => set({cardId})}/>
                                <TokenSelect label="Tag background" items={system.colors} value={theme.tagBackgroundId} onChange={tagBackgroundId => set({tagBackgroundId})} allowNone noneLabel="None" describe={c => c.value}/>
                            </>}
                        />
                    );
                })}
            </SectionList>
        </Box>
    );
}
