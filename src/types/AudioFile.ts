export type AudioFile = {
    id: number;
    game: string;
    character: string | null;
    tags: string[] | null;
    path: string;
    transcript: string | null;
    filename: string;
}