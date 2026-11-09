import React, {FunctionComponent, ReactElement} from "react";
import {Badge} from "components/ui";
import {PUBLICATION_LABEL, PUBLICATION_TONE, toPublicationStatus} from "lib/machines/componentStatus";

interface Props {
    // The stored component state ("new", "changed", "published"; legacy values read as unpublished).
    state: string
}

// A component's publication status, in the same words and colors the builder uses.
const StateBadge: FunctionComponent<Props> = ({state}: Props): ReactElement => {
    const status = toPublicationStatus(state);
    return (
        <Badge colorScheme={PUBLICATION_TONE[status]} data-publish-state={status}>
            {PUBLICATION_LABEL[status]}
        </Badge>
    );
};

export default StateBadge;
