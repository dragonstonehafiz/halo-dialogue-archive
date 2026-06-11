export type FolderNode = {
    name: string;
    path: string;
    file_count: number,
    always_show: boolean,
    children: FolderNode[];
}
