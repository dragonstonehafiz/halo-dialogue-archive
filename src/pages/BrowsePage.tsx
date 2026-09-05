import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import "./BrowsePage.css";

import Navbar from "../components/Navbar"
import { browse } from "../lib/api";
import BrowsePageGameSelector from "../components/BrowsePageGameSelector.tsx";
import type { FolderNode } from "../types/FolderNode.ts"; 
import type { AudioFile } from "../types/AudioFile.ts";
import { FolderContents } from "../components/FolderContents.tsx";
import { Breadcrumb } from "../components/Breadcrumb.tsx";

export default function BrowsePage() {
    const { game, '*': subPath } = useParams()
    const [nodePath, setNodePath] = useState<FolderNode[]>([]);
    const navigate = useNavigate()

    const [tree, setTree] = useState<FolderNode | null>(null);
    useEffect(() => {
        const loadTree = async () => {
            const res = await fetch('/structure.json');
            const data = await res.json();
            const gameNode = data.children.find((node: FolderNode) => node.name === game);
            setTree(gameNode);

            if (subPath) {
                const targetPath = `${game}/${subPath}`.replace(/\/$/, '');
                const found = findPathByString(gameNode, targetPath);
                setNodePath(found ?? [gameNode]);
            } else {
                setNodePath([gameNode]);
            }
        }

        loadTree();
    }, [game, subPath])
    
    function findPathByString(root: FolderNode, targetPath: string): FolderNode[] | null {
    if (root.path === targetPath) return [root]
    for (const child of root.children) {
        const path = findPathByString(child, targetPath)
        if (path) return [root, ...path]
    }
    return null
}

    const [files, setFiles] = useState<AudioFile[]>([]);
    const [filesLoading, setFilesLoading] = useState(false);
    const [filesError, setFilesError] = useState<string | null>(null);
    useEffect(() => {
        if (nodePath.length === 0) return;

        const currentPath = nodePath.map(n => n.name).join('/');
        const controller = new AbortController();

        const fetchFiles = async () => {
            setFilesLoading(true);
            setFilesError(null);
            try {
                const data = await browse(currentPath, controller.signal);
                const sortedFiles = data.sort((a, b) =>
                    a.filename.localeCompare(b.filename, undefined, { numeric: true })
                )
                setFiles(sortedFiles);
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") return;
                setFiles([]);
                setFilesError(err instanceof Error ? err.message : "Failed to load folder contents.");
            } finally {
                if (!controller.signal.aborted) setFilesLoading(false);
            }
        }

        fetchFiles();

        return () => controller.abort();
    }, [nodePath])

    function findPath(root: FolderNode, target: FolderNode): FolderNode[] | null {
        if (root.path === target.path) return [root]
        for (const child of root.children) {
            const path = findPath(child, target)
            if (path) return [root, ...path]
        }
        return null
    }

    const onFolderClick = (node: FolderNode) => {
        const path = findPath(tree!, node);
        setNodePath(path ?? []);

        // node.path is like "infinite/multiplayer/announcer" — strip the game prefix for the URL
        const subPath = node.path.split('/').slice(1).join('/');
        navigate(`/browse/${game}/${subPath}`);
    }
 

    return (
        <div>
            <Navbar />

            <div className="browse-page-game-selector">
                <BrowsePageGameSelector/>
            </div>

            <div className="browse-page-div">

                <div className="browse-page-contents">
                    <h2>Contents</h2>
                    <Breadcrumb nodePath={nodePath} onFolderClick={onFolderClick}></Breadcrumb>
                    {filesLoading && <p>Loading…</p>}
                    {filesError && <p className="browse-page-error">{filesError}</p>}
                    {!filesLoading && !filesError && (
                        <FolderContents nodePath={nodePath} files={files} onFolderClick={onFolderClick}></FolderContents>
                    )}
                </div>
            </div>
        </div>
    )
}