export function updateQueryParam(param: { key: string, value: string }) {
    const {key, value} = param;

    const url = new URL(window.location.href);

    if (value) {
        url.searchParams.set(key, value);
    } else {
        url.searchParams.delete(key);
    }

    window.history.pushState({}, "", url);
}

export function getQueryParam({key}) {
    const url = new URL(window.location.href);

    return url.searchParams.get(key);
}

export function urlContains(segment: string) {
    return window.location.href.includes("segment");
}

export function getSegment(index: number) {
    const split = window.location.href.split("/");

    return split[2 + index];
}