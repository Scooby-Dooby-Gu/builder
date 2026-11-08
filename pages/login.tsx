import React, {useState} from "react";
import Head from "next/head";
import {useRouter} from "next/router";
import Navbar from "components/Navbar";
import {Box, Button, Flex, FormControl, FormLabel, Heading, Input, Text} from "components/ui";
import {signIn} from "utils/api";

// Owner sign-in. Visitors don't need an account: they get a private sandbox.
export default function Login() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Only follow same-site paths after signing in.
    const next = typeof router.query.next === "string" && router.query.next.startsWith("/") && !router.query.next.startsWith("//")
        ? router.query.next
        : "/components";

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await signIn(password);
            window.location.href = next;
        } catch (err) {
            setError((err as Error).message);
            setIsSubmitting(false);
        }
    };

    return (
        <Flex direction="column" h="full">
            <Head><title>Owner sign in · Builder</title></Head>
            <Navbar/>
            <Flex flex="1" align="flex-start" justify="center" bg="gray.50" pt="20" px="6">
                <Box as="form" onSubmit={submit} w="full" maxW="sm" bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p="6">
                    <Heading as="h1" size="md" mb="1">Owner sign in</Heading>
                    <Text fontSize="sm" color="gray.600" mb="5">
                        Signing in edits and publishes the live components. Visitors can keep using their private sandbox without an account.
                    </Text>
                    <FormControl isInvalid={Boolean(error)}>
                        <FormLabel htmlFor="password" fontSize="sm">Password</FormLabel>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </FormControl>
                    {error && <Text fontSize="sm" color="red.600" mt="2" role="alert">{error}</Text>}
                    <Button type="submit" colorScheme="blue" w="full" mt="5" isLoading={isSubmitting} isDisabled={!password}>
                        Sign in
                    </Button>
                </Box>
            </Flex>
        </Flex>
    );
}
