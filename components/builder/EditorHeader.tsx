import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import {
    Box,
    Button,
    Code,
    CopyIcon,
    Divider,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useClipboard,
    useToast,
    ButtonGroup,
    ChevronDownIcon,
    EditIcon,
    Flex,
    IconButton,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
    NativeSelect,
    Text,
    Tooltip,
    ViewIcon,
} from "components/ui";
import { useAppDispatch, useAppSelector } from "store/hooks";
import { setDataDisplayed, setDataRepeated, setHiddenDisplayed, setPreviewBreakpoint } from "store/slices/builderSlice";
import { setComponentTheme } from "store/slices/stylesSlice";
import { embedSnippet } from "lib/publish";
import { dataStates, publishBlocker, statusLine } from "lib/machines/document";
import type { PublishResult } from "utils/api";

// The canvas toolbar. Theme is a property of the component (saved, and it changes
// the output), so it sits on the left. Preview width and the View options only
// change how the canvas renders while editing, so they sit together on the right.

function ToolbarLabel({ children, htmlFor }: { children: React.ReactNode, htmlFor?: string }) {
    return <Text as="label" htmlFor={htmlFor} fontSize="sm" color="gray.500" mr="2" whiteSpace="nowrap">{children}</Text>;
}

// Pick the style guide theme that styles this component's variants.
function ThemePicker() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const componentId = String(router.query.id ?? "");
    const themes = useAppSelector((state) => state.styles.system.themes);
    const themeId = useAppSelector((state) => state.styles.componentThemes[componentId] ?? "");

    return <Flex align="center">
        <ToolbarLabel htmlFor="select-theme">Theme</ToolbarLabel>
        <NativeSelect
            id="select-theme"
            size="sm"
            width="40"
            bg="white"
            borderRadius="md"
            value={themeId}
            onChange={(e) => dispatch(setComponentTheme({ componentId, themeId: e.target.value || null }))}
        >
            <option value="">No theme</option>
            {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
        </NativeSelect>
        <Tooltip label="Edit themes in the style guide" openDelay={300}>
            <Box as="span" ml="1">
                <Link href="/styles/themes" passHref>
                    <IconButton as="a" aria-label="Edit themes" icon={<EditIcon />} size="sm" variant="ghost" color="gray.500" />
                </Link>
            </Box>
        </Tooltip>
    </Flex>
}

// Preview the component at one of the style guide's breakpoints.
function PreviewWidthPicker() {
    const dispatch = useAppDispatch();
    const breakpoints = useAppSelector((state) => state.styles.system.breakpoints);
    const selected = useAppSelector((state) => state.builder.previewBreakpointId);
    const sorted = [...breakpoints].sort((a, b) => a.width - b.width);
    const options = [{ id: null as string | null, label: "Fit", hint: "Default canvas width" },
        ...sorted.map((bp) => ({ id: bp.id, label: bp.name, hint: `${bp.width}px wide` }))];

    return <Flex align="center">
        <ToolbarLabel>Preview</ToolbarLabel>
        <ButtonGroup size="sm" isAttached variant="outline" role="radiogroup" aria-label="Preview width">
            {options.map((option) => {
                const isActive = option.id === (selected ?? null);
                return <Tooltip key={option.id ?? "fit"} label={option.hint} openDelay={300}>
                    <Button
                        role="radio"
                        aria-checked={isActive}
                        fontWeight="medium"
                        bg={isActive ? "blue.50" : "white"}
                        color={isActive ? "blue.700" : "gray.600"}
                        borderColor={isActive ? "blue.300" : "gray.200"}
                        zIndex={isActive ? 1 : undefined}
                        _hover={{ bg: isActive ? "blue.50" : "gray.50" }}
                        onClick={() => dispatch(setPreviewBreakpoint(option.id))}
                    >
                        {option.label}
                    </Button>
                </Tooltip>;
            })}
        </ButtonGroup>
    </Flex>
}

// Editing aids that change how the canvas draws content, not the component itself.
function ViewMenu() {
    const dispatch = useAppDispatch();
    const isHiddenDisplayed = useAppSelector((state) => state.builder.isHiddenDisplayed);
    const isDataDisplayed = useAppSelector((state) => state.builder.isDataDisplayed);
    const isDataRepeated = useAppSelector((state) => state.builder.isDataRepeated);
    const hasData = useAppSelector((state) => state.builder.hasData);
    const hasRepeating = useAppSelector((state) => state.builder.hasRepeating);

    const elementValues = isHiddenDisplayed ? ["hidden"] : [];
    const dataValues = [
        ...(isDataDisplayed ? ["data"] : []),
        ...(isDataRepeated ? ["repeat"] : []),
    ];

    const optionText = (title: string, description: string) => <Box>
        <Text fontWeight="medium" color="gray.800">{title}</Text>
        <Text fontSize="xs" color="gray.500" mt="0.5">{description}</Text>
    </Box>;
    // MenuOptionGroup injects checked state into its direct MenuItemOption children,
    // so the options are written out here rather than through a wrapper component.
    const optionProps = { alignItems: "flex-start", py: "2", fontSize: "sm" };

    return <Menu closeOnSelect={false} placement="bottom-end">
        <MenuButton
            as={Button}
            size="sm"
            variant="outline"
            bg="white"
            borderColor="gray.200"
            fontWeight="medium"
            color="gray.700"
            leftIcon={<ViewIcon color="gray.500" />}
            rightIcon={<ChevronDownIcon />}
        >
            View
        </MenuButton>
        <MenuList w="300px" py="1" zIndex={30}>
            <MenuOptionGroup
                title="Elements"
                type="checkbox"
                value={elementValues}
                onChange={(values) => dispatch(setHiddenDisplayed((values as string[]).includes("hidden")))}
            >
                <MenuItemOption value="hidden" {...optionProps}>
                    {optionText("Show hidden elements", "Elements hidden by a visibility rule appear faded.")}
                </MenuItemOption>
            </MenuOptionGroup>
            <MenuDivider />
            <MenuOptionGroup
                title="Sample data"
                type="checkbox"
                value={dataValues}
                onChange={(values) => {
                    const list = values as string[];
                    if (list.includes("data") !== isDataDisplayed) dispatch(setDataDisplayed(list.includes("data")));
                    if (list.includes("repeat") !== isDataRepeated) dispatch(setDataRepeated(list.includes("repeat")));
                }}
            >
                <MenuItemOption value="data" isDisabled={!hasData} {...optionProps}>
                    {optionText("Fill in data values", hasData ? "Show values from the data source instead of field names." : "This component doesn't use a data source.")}
                </MenuItemOption>
                <MenuItemOption value="repeat" isDisabled={!hasRepeating} {...optionProps}>
                    {optionText("Repeat for each item", hasRepeating ? "Repeat elements once per item in their collection." : "This component has no repeating elements.")}
                </MenuItemOption>
            </MenuOptionGroup>
        </MenuList>
    </Menu>
}

function timeAgo(iso: string | null | undefined) {
    if (!iso) return "";
    const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 45) return "just now";
    if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} h ago`;
    return new Date(iso).toLocaleDateString();
}

// Save state, publish state and the Publish button. The owner publishes to the live
// embed; visitors publish to their own sandbox, a few times a day.
function PublishControls({ onPublish, onRetrySave }: { onPublish: () => Promise<PublishResult>, onRetrySave: () => Promise<unknown> }) {
    const componentId = useAppSelector((state) => state.builder.componentId) ?? "";
    const document = useAppSelector((state) => state.builder.document);
    const session = useAppSelector((state) => state.session);
    const isVisitor = session.role !== "owner";
    const [dialog, setDialog] = useState<{ version: number, target: "live" | "sandbox" } | null>(null);
    const toast = useToast();

    // Everything below is derived from the document state machine (lib/machines/document.ts).
    const line = statusLine(document, timeAgo);
    const isPublishing = document.publish.status === "publishing";
    const blocker = publishBlocker(document, isVisitor ? { left: session.publishesLeft, perDay: session.publishesPerDay } : undefined);
    const states = dataStates(document);
    const published = document.published;

    const publish = async () => {
        try {
            const result = await onPublish();
            setDialog({ version: result.version, target: result.target });
        } catch (error) {
            toast({ status: "error", title: "Couldn’t publish", description: (error as Error).message, isClosable: true });
        }
    };

    const publishLabel = isVisitor ? "Publish to sandbox" : published ? "Publish changes" : "Publish";
    const lineColor = line.tone === "orange" ? "orange.600" : line.tone === "red" ? "red.600" : "gray.500";

    return <Flex align="center" gap="3" data-save-state={states.save} data-publish-state={states.publish}>
        <Box textAlign="right" lineHeight="short">
            <Text fontSize="sm" color={lineColor} whiteSpace="nowrap" aria-live="polite">{line.text}</Text>
            {isVisitor && session.loaded && session.publishesLeft != null && (
                <Text fontSize="xs" color="gray.400" whiteSpace="nowrap">
                    {session.publishesLeft} of {session.publishesPerDay} sandbox publishes left today
                </Text>
            )}
        </Box>
        {document.sync.status === "error" && (
            <Tooltip label={document.sync.message}>
                <Button size="xs" variant="ghost" onClick={() => onRetrySave().catch(() => undefined)}>Retry</Button>
            </Tooltip>
        )}
        {published && <Button size="sm" variant="ghost" color="gray.600" onClick={() => setDialog({ version: published.version, target: isVisitor ? "sandbox" : "live" })}>
            {isVisitor ? "Preview" : "Embed code"}
        </Button>}
        <Tooltip label={blocker} isDisabled={!blocker || isPublishing}>
            <Box as="span">
                <Button
                    size="sm"
                    colorScheme="blue"
                    isLoading={isPublishing}
                    loadingText="Publishing"
                    isDisabled={Boolean(blocker)}
                    onClick={publish}
                >
                    {publishLabel}
                </Button>
            </Box>
        </Tooltip>
        <EmbedModal componentId={componentId} dialog={dialog} onClose={() => setDialog(null)} />
    </Flex>
}

function EmbedModal({ componentId, dialog, onClose }: { componentId: string, dialog: { version: number, target: "live" | "sandbox" } | null, onClose: () => void }) {
    const snippet = embedSnippet(componentId);
    const { hasCopied, onCopy } = useClipboard(snippet);
    const isSandbox = dialog?.target === "sandbox";
    const testUrl = `/embed-test.html?id=${encodeURIComponent(componentId)}${isSandbox ? "&preview=1" : ""}`;

    return <Modal isOpen={dialog != null} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
            <ModalHeader fontSize="lg">
                {isSandbox ? `Published to your sandbox · version ${dialog?.version}` : `Published · version ${dialog?.version}`}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                {isSandbox ? (
                    <Text fontSize="sm" color="gray.600" mb="3">
                        Open the preview to see your version rendered the way an embed would show it. It’s private to you:
                        embeds on other sites keep showing the owner’s published version, using the code below.
                    </Text>
                ) : (
                    <Text fontSize="sm" color="gray.600" mb="3">
                        Add this to any page to show the component. It always renders the latest published version, so you won’t need to change it after publishing again.
                    </Text>
                )}
                <Box borderRadius="md" overflow="hidden" bg="gray.900">
                    <Flex align="center" px="4" py="1.5" borderBottom="1px solid" borderColor="whiteAlpha.200">
                        <Text fontSize="xs" color="gray.400">HTML</Text>
                        <Button size="xs" ml="auto" variant="ghost" color="gray.200" _hover={{ bg: "whiteAlpha.200" }} leftIcon={<CopyIcon />} onClick={onCopy}>
                            {hasCopied ? "Copied" : "Copy"}
                        </Button>
                    </Flex>
                    <Code display="block" whiteSpace="pre" overflowX="auto" p="4" bg="transparent" color="gray.100" fontSize="sm">
                        {snippet}
                    </Code>
                </Box>
                <Text fontSize="xs" color="gray.500" mt="3">
                    The script loads once per page. Use the <Code fontSize="xs">variant</Code> attribute to pick a variant by name, e.g. <Code fontSize="xs">{'variant="Simple flat variant"'}</Code>. New versions can take up to a minute to appear.
                </Text>
            </ModalBody>
            <ModalFooter gap="2">
                <Button as="a" href={testUrl} target="_blank" rel="noopener" size="sm" variant={isSandbox ? "solid" : "ghost"} colorScheme={isSandbox ? "blue" : undefined}>
                    {isSandbox ? "Open preview" : "Open test page"}
                </Button>
                <Button size="sm" variant={isSandbox ? "ghost" : "solid"} colorScheme={isSandbox ? undefined : "blue"} onClick={onClose}>Done</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
}

export default function EditorHeader({ onPublish, onRetrySave }: { onPublish: () => Promise<PublishResult>, onRetrySave: () => Promise<unknown> }) {
    return <Flex
        position="sticky"
        top="0"
        zIndex={20}
        align="center"
        gap="4"
        rowGap="2"
        wrap="wrap"
        px="6"
        py="2.5"
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
    >
        <ThemePicker />
        <Flex align="center" gap="3" ml="auto" wrap="wrap" rowGap="2">
            <PreviewWidthPicker />
            <ViewMenu />
            <Box alignSelf="stretch" py="1"><Divider orientation="vertical" borderColor="gray.200" /></Box>
            <PublishControls onPublish={onPublish} onRetrySave={onRetrySave} />
        </Flex>
    </Flex>
}
