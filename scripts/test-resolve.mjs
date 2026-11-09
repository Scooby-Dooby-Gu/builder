// Lets `node --test` run the app's TypeScript modules directly: Next.js imports
// them without file extensions, so retry relative imports with ".ts".
import {registerHooks} from "node:module";

registerHooks({
    resolve(specifier, context, nextResolve) {
        try {
            return nextResolve(specifier, context);
        } catch (error) {
            if (specifier.startsWith(".") && !/\.[cm]?[jt]s$/.test(specifier)) {
                return nextResolve(`${specifier}.ts`, context);
            }
            throw error;
        }
    },
});
