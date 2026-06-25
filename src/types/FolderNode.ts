export type FolderNode = {
    name: string;
    path: string;
    file_count: number,
    children: FolderNode[];
}
