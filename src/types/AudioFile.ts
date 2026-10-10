export type AudioFile = {
    id: number;
    game: string;
    character: string | null;
    tags: string[] | null;
    path: string;
    // Only returned by /search, which orders results by it.
    parent?: string;
    transcript: string | null;
    filename: string;
}