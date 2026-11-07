import React, {FunctionComponent, ReactElement, useEffect, useState} from "react";
import {Badge} from "components/ui";
import {States} from "../models/collection";

interface Props {
    state: States
}

const ComponentUpperBadge: FunctionComponent<Props> = (props: Props): ReactElement | null => {
    const {state} = props;

    const [colorScheme, setColorScheme] = useState<string>("");

    useEffect(() => {
        switch (state) {
            case States.PUBLISHED:
                setColorScheme("green");
                break;
            case States.STAGED:
                setColorScheme("cyan")
                break;
            case States.DELETED:
                setColorScheme("red");
                break;
            case States.NEW:
                setColorScheme("blue");
                break;
            case States.CHANGED:
                setColorScheme("yellow");
                break;
        }
    }, [state])

    return colorScheme && (
        <Badge
            colorScheme={colorScheme}
        >
            {state}
        </Badge>
    )
}

export default ComponentUpperBadge;