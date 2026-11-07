// Shared UI layer: re-exports Chakra UI 1.x and adds the few app-specific
// components and theme variants used across the app.
import React, {ReactElement, ReactNode} from "react";
import {
    Box,
    Button,
    ChakraProvider,
    ChakraProviderProps,
    CloseButton,
    Flex,
    Heading,
    HeadingProps,
    HStack,
    Icon,
    IconButton,
    IconProps,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    InputProps as ChakraInputProps,
    InputRightElement,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    theme as chakraTheme,
} from "@chakra-ui/react";
import {PopoverTrigger as ChakraPopoverTrigger} from "@chakra-ui/react";
import {SearchIcon} from "@chakra-ui/icons";

export * from "@chakra-ui/react";
export * from "@chakra-ui/icons";

// Select is react-select based (options / object value / onChange(option)),
// not Chakra's native <select>. These explicit exports take precedence over `export *`.
export {Select} from "chakra-react-select";

// Chakra 1.x types PopoverTrigger without `children`, which React 18 types no longer imply.
export const PopoverTrigger = ChakraPopoverTrigger as React.FC<{ children: ReactNode }>;

// ---------------------------------------------------------------------------
// Theme: Chakra defaults plus the custom variants the app relies on
// ---------------------------------------------------------------------------

export const baseTheme = {
    ...chakraTheme,
    colors: {
        ...chakraTheme.colors,
        primary: chakraTheme.colors.blue,
    },
    components: {
        ...chakraTheme.components,
        Button: {
            ...chakraTheme.components.Button,
            variants: {
                ...chakraTheme.components.Button.variants,
                primary: (props) => chakraTheme.components.Button.variants.solid({
                    ...props,
                    colorScheme: props.colorScheme === "gray" ? "blue" : props.colorScheme,
                }),
                secondary: (props) => chakraTheme.components.Button.variants.outline({
                    ...props,
                    colorScheme: props.colorScheme === "gray" ? "blue" : props.colorScheme,
                }),
            },
        },
        Text: {
            ...(chakraTheme.components as any).Text,
            variants: {
                subtle: {color: "gray.500"},
                microcopy: {fontSize: "xs", color: "gray.500"},
            },
        },
    },
};

export function UIProvider(props: ChakraProviderProps) {
    return <ChakraProvider {...props}/>;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export function H2(props: HeadingProps) {
    return <Heading as="h2" size="md" {...props}/>;
}

export function DotsHorizontalIcon(props: IconProps) {
    return (
        <Icon viewBox="0 0 24 24" {...props}>
            <path fill="currentColor"
                  d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z"/>
        </Icon>
    );
}

export function DotsGridIcon(props: IconProps) {
    return (
        <Icon viewBox="0 0 24 24" {...props}>
            <path fill="currentColor"
                  d="M12 16C13.1 16 14 16.9 14 18S13.1 20 12 20 10 19.1 10 18 10.9 16 12 16M12 10C13.1 10 14 10.9 14 12S13.1 14 12 14 10 13.1 10 12 10.9 10 12 10M12 4C13.1 4 14 4.9 14 6S13.1 8 12 8 10 7.1 10 6 10.9 4 12 4M6 16C7.1 16 8 16.9 8 18S7.1 20 6 20 4 19.1 4 18 4.9 16 6 16M6 10C7.1 10 8 10.9 8 12S7.1 14 6 14 4 13.1 4 12 4.9 10 6 10M6 4C7.1 4 8 4.9 8 6S7.1 8 6 8 4 7.1 4 6 4.9 4 6 4M18 16C19.1 16 20 16.9 20 18S19.1 20 18 20 16 19.1 16 18 16.9 16 18 16M18 10C19.1 10 20 10.9 20 12S19.1 14 18 14 16 13.1 16 12 16.9 10 18 10M18 4C19.1 4 20 4.9 20 6S19.1 8 18 8 16 7.1 16 6 16.9 4 18 4Z"/>
        </Icon>
    );
}

export function SearchInput({value, onChange, onClearIconClick, InputProps}: {
    value?: string,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onClearIconClick?: () => void,
    InputProps?: ChakraInputProps,
}): ReactElement {
    return (
        <InputGroup>
            <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400"/>
            </InputLeftElement>
            <Input value={value} onChange={onChange} {...InputProps}/>
            {value && onClearIconClick && (
                <InputRightElement>
                    <CloseButton size="sm" onClick={onClearIconClick} aria-label="Clear search"/>
                </InputRightElement>
            )}
        </InputGroup>
    );
}

export function Placeholder({title, text}: { title?: ReactNode, text?: ReactNode }): ReactElement {
    return (
        <Flex direction="column" align="center" textAlign="center" py="16" color="gray.600">
            {title && <Heading as="h3" size="sm" mb="2">{title}</Heading>}
            {text && <Text>{text}</Text>}
        </Flex>
    );
}

type NavItem = { label: string, active?: boolean, onClick?: () => void };
type NavAction = { ariaLabel: string, icon: ReactElement, active?: boolean, onClick?: () => void };

export function NavigationHorizontal({items = [], actions = [], icon, image, brand, menu}: {
    items?: NavItem[],
    actions?: NavAction[],
    icon?: ReactElement,
    image?: { src: string, w?: string, alt?: string },
    brand?: ReactNode,
    menu?: { name: string, items: { label: string, onClick?: () => void }[] },
}): ReactElement {
    return (
        <Flex as="nav" h="full" align="center" pr="4" bg="white">
            {icon}
            {image && <Image src={image.src} w={image.w} alt={image.alt || ""} mr="8"/>}
            {brand && <Text fontWeight="bold" fontSize="lg" mr="8" whiteSpace="nowrap">{brand}</Text>}

            <HStack spacing="1" h="full">
                {items.map(item => (
                    <Button
                        key={item.label}
                        variant="ghost"
                        h="full"
                        borderRadius="0"
                        borderBottom="2px solid"
                        borderColor={item.active ? "blue.500" : "transparent"}
                        color={item.active ? "blue.600" : "gray.700"}
                        fontWeight={item.active ? "semibold" : "normal"}
                        onClick={item.onClick}
                    >
                        {item.label}
                    </Button>
                ))}
            </HStack>

            <Box flex="1"/>

            <HStack spacing="2">
                {actions.map(action => (
                    <IconButton
                        key={action.ariaLabel}
                        aria-label={action.ariaLabel}
                        icon={action.icon}
                        variant="ghost"
                        isActive={action.active}
                        onClick={action.onClick}
                    />
                ))}

                {menu && (
                    <Menu>
                        <MenuButton as={Button} variant="ghost" size="sm">{menu.name}</MenuButton>
                        <MenuList>
                            {menu.items.map(i => <MenuItem key={i.label} onClick={i.onClick}>{i.label}</MenuItem>)}
                        </MenuList>
                    </Menu>
                )}
            </HStack>
        </Flex>
    );
}
