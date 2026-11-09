import React, { useState } from "react"
import { CopyIcon, DeleteIcon, Input, Badge, IconButton, Container, HStack, Spacer, VStack, RepeatIcon, CloseIcon, Text, Tooltip } from "components/ui"
import { useAppDispatch, useAppSelector } from "store/hooks";
import {RootState} from "store/store";
import { css } from "@chakra-ui/styled-system";
import EditLink from "components/elements/EditLink";
import { restoreVariant, deleteVariant, duplicateVariant } from "store/slices/builderSlice";
import { ComponentVariant } from "models/builder";
import { variantStatuses } from "lib/machines/document";
import { VARIANT_LABEL, VARIANT_TONE } from "lib/machines/componentStatus";
import { Button } from "components/ui";

// Each variant's status against the live version, from the document state machine.
function VariantBadge({ id, isDeleted }: { id: string, isDeleted: boolean }) {
    const status = useAppSelector((state: RootState) =>
        variantStatuses(state.builder.document, [{ id, isDeleted }])[id]);
    return <Badge colorScheme={VARIANT_TONE[status]} variant="subtle" data-variant-state={status}>
        {VARIANT_LABEL[status]}
    </Badge>
}

export default function Variant({ id, name, content, state, isDeleted } : ComponentVariant) {
    const [isFocused, setFocused] = useState(false);
    const [isEditing, setEditing] = useState(false);
    
    const dispatch = useAppDispatch();
    const focusedEditableName = useAppSelector((state: RootState) => state.builder.focusedEditableName);
    const builderIsFocused = useAppSelector((state: RootState) => state.builder.isFocused);
    // Width of the style guide breakpoint being previewed, if any.
    const previewWidth = useAppSelector((state: RootState) => {
        const id = state.builder.previewBreakpointId;
        return id ? state.styles.system.breakpoints.find((bp) => bp.id === id)?.width ?? null : null;
    });


    return <Container key={id} css={css`
        &:not(:hover):not(.focused) .menu {
            opacity: 0;
        }
    `}
        maxW={previewWidth ? "none" : "600px"}
        w={previewWidth ? `${previewWidth}px` : undefined}
        // No side padding while previewing, so the themed content is exactly the breakpoint's width.
        px={previewWidth ? 0 : undefined}
        flexShrink={0}
        className={`${builderIsFocused && focusedEditableName == id ? 'focused' : ''}`}>
        <HStack width="100%">
            <HStack minWidth={0}>
                <VariantBadge id={id} isDeleted={isDeleted} />
                {isEditing && <Input />}
                {!isEditing && <EditLink href="#">{name}</EditLink>}
            </HStack>
            <Spacer />
            <HStack spacing={1} className="menu">
                {isDeleted && <Button aria-label="Restore variant" size="xs" variant="secondary" leftIcon={<CloseIcon boxSize={2.5} />} onClick={() => dispatch(restoreVariant(id))}>Restore</Button>}
                {!isDeleted && <Tooltip label="Duplicate variant" openDelay={300}>
                    <IconButton size="xs" variant="ghost" color="gray.500" _hover={{ bg: "blackAlpha.100", color: "gray.800" }} aria-label="Duplicate variant" icon={<CopyIcon boxSize={3.5} />} onClick={() => dispatch(duplicateVariant(id))} />
                </Tooltip>}
                {!isDeleted && <Tooltip label="Delete variant" openDelay={300}>
                    <IconButton size="xs" variant="ghost" color="gray.500" _hover={{ bg: "red.50", color: "red.600" }} aria-label="Delete variant" icon={<DeleteIcon boxSize={3.5} />} onClick={() => dispatch(deleteVariant(id))} />
                </Tooltip>}
            </HStack>
        </HStack>
        {!isDeleted && <VStack className="variant-surface" background="white" borderRadius={3} minH={100} p={0}>
            <Container
                px={5}
                pt="44px"
                pb={6}
                flexGrow={1}
                placeholder={"Click and start typing"}
                id={id}
                className={`content`}
                dangerouslySetInnerHTML={{ __html: content || '' }} />
        </VStack>}
    </Container>
}