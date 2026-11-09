// Connecting a live data source: test the connection, then save it.
//
//   idle ──TEST_STARTED(key)──▶ testing ──TEST_SUCCEEDED(key)──▶ passed ──SAVE_STARTED──▶ saving
//                                  └──TEST_FAILED(key)──▶ failed            ▲              │
//                                                                           └─SAVE_FAILED──┘
//
// Every result carries the settings it was for (a fingerprint, `key`). A result
// for settings that are no longer current is ignored, and Save is only allowed
// when the passed test matches the settings on screen. So editing a field after
// testing, or while a test is running, can never let untested settings be saved.

export type ConnectionState =
    | { status: "idle" }
    | { status: "testing", key: string }
    | { status: "passed", key: string, sample: unknown }
    | { status: "failed", key: string, message: string }
    | { status: "saving", key: string, sample: unknown };

export type ConnectionEvent =
    | { type: "TEST_STARTED", key: string }
    | { type: "TEST_SUCCEEDED", key: string, sample: unknown }
    | { type: "TEST_FAILED", key: string, message: string }
    | { type: "SAVE_STARTED" }
    | { type: "SAVE_FAILED" };

export const initialConnection: ConnectionState = {status: "idle"};

export function connectionReducer(state: ConnectionState, event: ConnectionEvent): ConnectionState {
    switch (event.type) {
        case "TEST_STARTED":
            return state.status === "saving" ? state : {status: "testing", key: event.key};
        case "TEST_SUCCEEDED":
            return state.status === "testing" && state.key === event.key
                ? {status: "passed", key: event.key, sample: event.sample}
                : state;
        case "TEST_FAILED":
            return state.status === "testing" && state.key === event.key
                ? {status: "failed", key: event.key, message: event.message}
                : state;
        case "SAVE_STARTED":
            return state.status === "passed" ? {status: "saving", key: state.key, sample: state.sample} : state;
        case "SAVE_FAILED":
            return state.status === "saving" ? {status: "passed", key: state.key, sample: state.sample} : state;
    }
}

// A stable fingerprint of the settings that affect the connection.
export function configKey(config: Record<string, unknown>): string {
    const sorted = (value: unknown): unknown => {
        if (Array.isArray(value)) return value.map(sorted);
        if (value && typeof value === "object") {
            return Object.fromEntries(Object.keys(value as object).sort().map(k => [k, sorted((value as Record<string, unknown>)[k])]));
        }
        return value;
    };
    return JSON.stringify(sorted(config));
}

export function isBusy(state: ConnectionState) {
    return state.status === "testing" || state.status === "saving";
}

// The tested sample, if it belongs to the settings on screen.
export function currentSample(state: ConnectionState, key: string): unknown {
    return (state.status === "passed" || state.status === "saving") && state.key === key ? state.sample : undefined;
}

export function canSave(state: ConnectionState, key: string) {
    return state.status === "passed" && state.key === key;
}
