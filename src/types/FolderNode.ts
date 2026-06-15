export type FolderNode = {
    name: string;
    path: string;
    file_count: number,
    show_in_browser: boolean,
    children: FolderNode[];
}
