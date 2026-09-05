import type { AudioFile } from "../types/AudioFile";

function getBaseUrl(): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    if (!baseUrl) {
        throw new Error(
            "VITE_API_BASE_URL is not set. Configure it in your environment to reach the metadata API."
        );
    }
    return baseUrl;
}

async function requestJson(path: string, params: Record<string, string | undefined>, signal?: AbortSignal): Promise<AudioFile[]> {
    const url = new URL(path, getBaseUrl());
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value) search.set(key, value);
    }
    url.search = search.toString();

    let response: Response;
    try {
        response = await fetch(url, { signal });
    } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") throw err;
        throw new Error("Could not reach the metadata service. Please try again.", { cause: err });
    }

    if (!response.ok) {
        throw new Error("The metadata service returned an error. Please try again.");
    }

    return response.json();
}

export function browse(folder: string, signal?: AbortSignal): Promise<AudioFile[]> {
    return requestJson("/browse", { folder }, signal);
}

export function search(
    opts: {
        q: string;
        games?: string[];
        characters?: string[];
        tags?: string[];
    },
    signal?: AbortSignal
): Promise<AudioFile[]> {
    return requestJson(
        "/search",
        {
            q: opts.q,
            games: opts.games?.join(","),
            characters: opts.characters?.join(","),
            tags: opts.tags?.join(","),
        },
        signal
    );
}
