import type { AudioFile } from "../types/AudioFile";
import type { SearchResponse } from "../types/SearchResponse";

export const SEARCH_MIN_QUERY_LENGTH = 3;
export const SEARCH_MAX_PAGE_SIZE = 200;

function getBaseUrl(): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    if (!baseUrl) {
        throw new Error(
            "VITE_API_BASE_URL is not set. Configure it in your environment to reach the metadata API."
        );
    }
    return baseUrl;
}

async function readErrorMessage(response: Response): Promise<string | null> {
    try {
        const body = await response.json();
        if (body && typeof body.error === "string" && body.error.trim()) return body.error;
    } catch {
        // Body was missing or not JSON; fall back to a generic message.
    }
    return null;
}

// Array values are sent as repeated params (?characters=A&characters=B) rather than
// joined, so values containing commas (e.g. "Yabda, The Merciless") stay whole.
async function requestJson<T>(path: string, params: Record<string, string | string[] | undefined>, signal?: AbortSignal): Promise<T> {
    const url = new URL(path, getBaseUrl());
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
            for (const v of value) if (v) search.append(key, v);
        } else if (value) {
            search.set(key, value);
        }
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
        const message = await readErrorMessage(response);
        throw new Error(message ?? "The metadata service returned an error. Please try again.");
    }

    return response.json();
}

export function browse(folder: string, signal?: AbortSignal): Promise<AudioFile[]> {
    return requestJson<AudioFile[]>("/browse", { folder }, signal);
}

export function search(
    opts: {
        q?: string;
        games?: string[];
        characters?: string[];
        tags?: string[];
        page?: number;
        pageSize?: number;
    },
    signal?: AbortSignal
): Promise<SearchResponse> {
    return requestJson<SearchResponse>(
        "/search",
        {
            q: opts.q?.trim() || undefined,
            games: opts.games,
            characters: opts.characters,
            tags: opts.tags,
            page: opts.page !== undefined ? String(opts.page) : undefined,
            pageSize: opts.pageSize !== undefined ? String(opts.pageSize) : undefined,
        },
        signal
    );
}
