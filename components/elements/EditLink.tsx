import { css } from '@emotion/react'
import { CopyIcon, EditIcon, DeleteIcon, Input, Link, Badge, IconButton, Container, HStack, Spacer, Text } from "components/ui"


export default function EditLink({children, ...props}) {
    return <TruncatedIconLink rightIcon={<EditIcon ml={2} />} {...props}>
        {children}
    </TruncatedIconLink>
}

// Link that truncates text but keeps the icon visible on the right
export function TruncatedIconLink({children, leftIcon = null, rightIcon = null, ...props}) {
    return <Link {...props} css={css`
        text-decoration: underline;
        display: flex;
        align-items: center;
        min-width: 0;
        color: currentColor;
        span {
            text-overflow: ellipsis;
            overflow: hidden;
            min-width: 0px;
        }
        white-space: nowrap;
        &:not(:hover):not(:focus):not(:active) {
            text-decoration: none;
            svg {
                opacity: 0;
            }
        }
    `}>
        
        {leftIcon}
        <span>{children}</span>
        {rightIcon}
    </Link>
}