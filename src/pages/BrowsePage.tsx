import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react";
import "./BrowsePage.css";

import Navbar from "../components/Navbar"
import { browse } from "../lib/api";
import BrowsePageGameSelector from "../components/BrowsePageGameSelector.tsx";
import type { FolderNode } from "../types/FolderNode.ts";
import type { AudioFile } from "../types/AudioFile.ts";
import { FolderContents } from "../components/FolderContents.tsx";
import { Breadcrumb } from "../components/Breadcrumb.tsx";
import { LoadingContainer } from "../components/LoadingSpinner.tsx";

function findPathByString(root: FolderNode, targetPath: string): FolderNode[] | null {
    if (root.path === targetPath) return [root]
    for (const child of root.children) {
        const path = findPathByString(child, targetPath)
        if (path) return [root, ...path]
    }
    return null
}

function findPath(root: FolderNode, target: FolderNode): FolderNode[] | null {
    if (root.path === target.path) return [root]
    for (const child of root.children) {
        const path = findPath(child, target)
        if (path) return [root, ...path]
    }
    return null
}

export default function BrowsePage() {
    const { game, '*': subPath } = useParams()
    const navigate = useNavigate()

    const [tree, setTree] = useState<FolderNode | null>(null);
    const [treeLoading, setTreeLoading] = useState(true);
    const [treeError, setTreeError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadTree = async () => {
            setTree(null);
            setTreeLoading(true);
            setTreeError(null);
            try {
                const res = await fetch('/structure.json', { signal: controller.signal });
                if (!res.ok) throw new Error("Could not load the catalog. Please try again.");
                const data = await res.json();
                const gameNode: FolderNode | undefined = Array.isArray(data?.children)
                    ? data.children.find((node: FolderNode) => node.name === game)
                    : undefined;
                if (!gameNode) throw new Error(`"${game}" could not be found in the catalog.`);
                setTree(gameNode);
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") return;
                setTreeError(err instanceof Error ? err.message : "Failed to load the catalog.");
            } finally {
                if (!controller.signal.aborted) setTreeLoading(false);
            }
        }

        loadTree();

        return () => controller.abort();
    }, [game])

    const nodePath = useMemo<FolderNode[] | null>(() => {
        if (!tree) return null;
        if (!subPath) return [tree];
        const targetPath = `${game}/${subPath}`.replace(/\/$/, '');
        return findPathByString(tree, targetPath);
    }, [tree, game, subPath])

    const pathError = tree && !nodePath ? "This folder could not be found." : null;
    const currentPath = nodePath ? nodePath.map(n => n.name).join('/') : null;

    const [files, setFiles] = useState<AudioFile[] | null>(null);
    const [filesPath, setFilesPath] = useState<string | null>(null);
    const [filesLoading, setFilesLoading] = useState(false);
    const [filesError, setFilesError] = useState<string | null>(null);

    useEffect(() => {
        if (!currentPath) return;

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
                setFilesPath(currentPath);
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") return;
                setFiles(null);
                setFilesPath(null);
                setFilesError(err instanceof Error ? err.message : "Failed to load folder contents.");
            } finally {
                if (!controller.signal.aborted) setFilesLoading(false);
            }
        }

        fetchFiles();

        return () => controller.abort();
    }, [currentPath])

    const isContentLoading = treeLoading || filesLoading || (currentPath !== null && filesPath !== currentPath && !filesError);
    const isEmpty = !isContentLoading && !filesError && !treeError && !pathError
        && (nodePath?.[nodePath.length - 1]?.children.length ?? 0) === 0
        && (files?.length ?? 0) === 0;

    const onFolderClick = (node: FolderNode) => {
        if (!tree) return;
        const path = findPath(tree, node);
        if (!path) return;

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
                    {nodePath && <Breadcrumb nodePath={nodePath} onFolderClick={onFolderClick}></Breadcrumb>}
                    <div aria-busy={isContentLoading}>
                        {(treeError || pathError) && (
                            <p className="browse-page-error" role="alert">{treeError ?? pathError}</p>
                        )}
                        {!treeError && !pathError && isContentLoading && (
                            <LoadingContainer label="Loading folder contents" />
                        )}
                        {!treeError && !pathError && !isContentLoading && filesError && (
                            <p className="browse-page-error" role="alert">{filesError}</p>
                        )}
                        {!treeError && !pathError && !isContentLoading && !filesError && isEmpty && (
                            <p className="browse-page-empty">No files or folders found.</p>
                        )}
                        {!treeError && !pathError && !isContentLoading && !filesError && !isEmpty && (
                            <FolderContents nodePath={nodePath} files={files} onFolderClick={onFolderClick}></FolderContents>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
