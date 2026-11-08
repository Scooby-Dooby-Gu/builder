import React from "react";
import {useRouter} from "next/router";
import {Button, Flex, Text} from "components/ui";
import {useAppSelector} from "store/hooks";
import {resetSandbox} from "utils/api";

// Tells visitors they're in a private sandbox, and how to start over or sign in.
export default function SessionBanner() {
    const router = useRouter();
    const session = useAppSelector((state) => state.session);
    if (!session.loaded || session.role !== "visitor") return null;

    const reset = async () => {
        if (!window.confirm("Reset your sandbox? Your changes will be discarded and you'll start again from the live version.")) return;
        await resetSandbox();
        window.location.reload();
    };

    return (
        <Flex
            align="center"
            justify="center"
            gap="3"
            wrap="wrap"
            flexShrink={0}
            px="6"
            py="1.5"
            bg="blue.50"
            borderBottom="1px solid"
            borderColor="blue.100"
            fontSize="sm"
            color="blue.900"
        >
            <Text>
                <b>Demo sandbox.</b> Your changes are private to you and reset after {session.sandboxHours ?? 24} hours.
                {" "}You can publish {session.publishesPerDay ?? 5} times a day to preview your work.
            </Text>
            <Flex gap="1">
                <Button size="xs" variant="ghost" colorScheme="blue" onClick={reset}>Reset sandbox</Button>
                {session.ownerLoginAvailable && (
                    <Button size="xs" variant="ghost" colorScheme="blue" onClick={() => router.push(`/login?next=${encodeURIComponent(router.asPath)}`)}>
                        Owner sign in
                    </Button>
                )}
            </Flex>
        </Flex>
    );
}
