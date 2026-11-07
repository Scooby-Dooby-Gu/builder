import React from "react";
import Link from "next/link";
import {mdiPaletteSwatchOutline} from "@mdi/js";
import {Badge, Icon, Tooltip} from "components/ui";
import {useAppSelector} from "store/hooks";

// Which style guide theme a component uses, linking to the theme.
export default function ThemeBadge({componentId}: { componentId: string }) {
    const theme = useAppSelector(state => {
        const themeId = state.styles.componentThemes[String(componentId)];
        return themeId ? state.styles.system.themes.find(t => t.id === themeId) : undefined;
    });

    if (!theme) {
        return (
            <Tooltip label="Pick a theme in the builder">
                <Badge variant="outline" colorScheme="gray" textTransform="none" fontWeight="normal" bg="white">
                    No theme
                </Badge>
            </Tooltip>
        );
    }

    return (
        <Link href="/styles/themes" passHref>
            <Badge
                as="a"
                variant="subtle"
                colorScheme="purple"
                textTransform="none"
                display="inline-flex"
                alignItems="center"
                gap="1"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                title={`Theme: ${theme.name}`}
            >
                <Icon path={mdiPaletteSwatchOutline} boxSize="3"/>
                {theme.name}
            </Badge>
        </Link>
    );
}
