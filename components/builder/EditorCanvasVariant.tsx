import React, { useState } from "react"
import { CopyIcon, DeleteIcon, Input, Badge, IconButton, Container, HStack, Spacer, VStack, RepeatIcon, CloseIcon, Text } from "components/ui"
import { useAppDispatch, useAppSelector } from "store/hooks";
import {RootState} from "store/store";
import { css } from "@chakra-ui/styled-system";
import EditLink from "components/elements/EditLink";
import { restoreVariant, deleteVariant, duplicateVariant } from "store/slices/builderSlice";
import { ComponentVariant } from "models/builder";
import { Button } from "components/ui";

function VariantBadge({state}) {
    switch(state) {
        case 'published':
            return <Badge colorScheme="teal" variant="subtle">
                Up-to-date
            </Badge>
        case 'draft':
            return <Badge colorScheme="green" variant="subtle">
                New
            </Badge>
        case 'incorrect':
            return <Badge colorScheme="red" variant="subtle">
                Data issue
            </Badge>
        case 'deleting':
            return <Badge colorScheme="red" variant="subtle">
                Marked for deletion
            </Badge>
        default:
            return <Badge colorScheme="teal" variant="subtle">
                Up-to-date
            </Badge>
    }
}



export default function Variant({ id, name, content, state, isDeleted } : ComponentVariant) {
    const [isFocused, setFocused] = useState(false);
    const [isEditing, setEditing] = useState(false);
    
    const dispatch = useAppDispatch();
    const focusedEditableName = useAppSelector((state: RootState) => state.builder.focusedEditableName);
    const builderIsFocused = useAppSelector((state: RootState) => state.builder.isFocused);


    return <Container key={id} css={css`
        &:not(:hover):not(.focused) .menu {
            opacity: 0;
        }
        & {
            max-width: 600px;
        }
    `} className={`${builderIsFocused && focusedEditableName == id ? 'focused' : ''}`}>
        <HStack width="100%">
            <HStack minWidth={0}>
                <VariantBadge state={isDeleted ? 'deleting' : state} />
                {isEditing && <Input />}
                {!isEditing && <EditLink href="#">{name}</EditLink>}
            </HStack>
            <Spacer />
            <HStack spacing={0} className="menu">
                {isDeleted && <Button aria-label="Restore variant" size="sm" variant="secondary" leftIcon={<CloseIcon />} onClick={() => dispatch(restoreVariant(id))}>Restore</Button>}
                {!isDeleted && <IconButton color={"gray.500"} aria-label="Duplicate variant" icon={<CopyIcon w={6} h={6} />} onClick={() => dispatch(duplicateVariant(id))}  />}
                {!isDeleted && <IconButton color={"gray.500"} aria-label="Delete variant" icon={<DeleteIcon w={6} h={6} />} onClick={() => dispatch(deleteVariant(id))}  />}
            </HStack>
        </HStack>
        {!isDeleted && <VStack background="white" borderRadius={3} minH={100} p={0}>
            <Container
                px={5}
                py={5}
                flexGrow={1}
                placeholder={"Click and start typing"}
                id={id}
                className={`content`}
                dangerouslySetInnerHTML={{ __html: content || '' }} />
        </VStack>}
    </Container>
}