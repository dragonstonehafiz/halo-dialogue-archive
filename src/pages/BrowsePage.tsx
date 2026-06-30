import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import "./BrowsePage.css";

import Navbar from "../components/Navbar"
import { supabase } from "../components/Supabase";
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
    useEffect(() => {
        if (nodePath.length === 0) return;

        const currentPath = nodePath.map(n => n.name).join('/');

        const fetchFiles = async () => {
            const { data, error } = await supabase
                .from('audio_files')
                .select('*')
                .like('path', `${currentPath}/%`)
                .not('path', 'like', `${currentPath}/%/%`)

                
            if (data) {
                const sortedFiles = data.sort((a, b) => 
                    a.filename.localeCompare(b.filename, undefined, { numeric: true })
                )
                setFiles(sortedFiles);   
            }
            if (error) console.error(error);
        }

        fetchFiles();
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
                    <FolderContents nodePath={nodePath} files={files} onFolderClick={onFolderClick}></FolderContents>
                </div>
            </div>
        </div>
    )
}