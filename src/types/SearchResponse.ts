import type { AudioFile } from "./AudioFile";

export type SearchResponse = {
    results: AudioFile[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}
