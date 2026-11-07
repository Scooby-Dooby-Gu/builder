//@ts-nocheck

import React, { Fragment, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useEditorWithContext } from 'lib/editor';
import EditorWatchdog from './EditorWatchdog.tsx';
import Variant from 'components/builder/EditorCanvasVariant';
import { AddIcon, Container, IconButton, VStack } from "components/ui";
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { addVariant, deleteVariant, moveVariant } from 'store/slices/builderSlice';
import EditorHeader from './EditorHeader';


export default function CEditor({ onChange, onReady, ...props }: any) {
  const [node, setRef] = useState(null);
  const [editor, setEditor] = useState(null)
  const dispatch = useAppDispatch();
  const stylesheet = useAppSelector((state) => state.builder.styles);
  const variants = useAppSelector((state) => state.builder.variants);
  const isDataDisplayed = useAppSelector((state) => state.builder.isDataDisplayed);
  const isHiddenDisplayed = useAppSelector((state) => state.builder.isHiddenDisplayed);


  const editableElements = useMemo(() => variants.map((variant) => {
    return <Variant key={variant.id} {...variant} />
  }), [variants]);

  const onMouseDown = (e) => {
    if (e.target === node || e.target === node.parentNode) {
      document.activeElement.blur();
      e.preventDefault();
    }
  }
  return (<Fragment>
    <style>
      {stylesheet}
    </style>
    <EditorWatchdog {...{ node, editor, variants, setEditor }} />
    <EditorHeader />
    <VStack className={`${isDataDisplayed ? 'data-displayed' : 'data-not-displayed'} ${isHiddenDisplayed ? 'hidden-displayed' : 'hidden-not-displayed'}`} onContextMenu={(e) => e.preventDefault()} flexGrow={1} key="editor" pt={10} pb={10} background="gray.100" spacing="20" onMouseDownCapture={onMouseDown}>
      <VStack spacing={10} ref={setRef}>
        {editableElements}
      </VStack>
      <VStack onClick={() => dispatch(addVariant())} mt={3} spacing="3">
        <IconButton variant="secondary" bgColor="purple.200" color="purple.600" aria-label="Users" icon={<AddIcon />} />
        <span>Add new variant</span>
      </VStack>
    </VStack>
  </Fragment>)
}
