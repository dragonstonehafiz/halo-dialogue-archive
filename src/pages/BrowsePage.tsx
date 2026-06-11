import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import "./BrowsePage.css";
import { useEffect, useState } from "react";
import { supabase } from "../components/Supabase";
import GameCard from "../components/GameCard";

import halo2Logo from '../assets/games/halo2.png'
import halo3Logo from '../assets/games/halo3.png'

import type { FolderNode } from "../types/FolderNode.ts"; 
import type { AudioFile } from "../types/AudioFile.ts";

import { FolderTree } from "../components/FolderTree.tsx";
import { FolderContents } from "../components/FolderContents.tsx";
import { Breadcrumb } from "../components/Breadcrumb.tsx";

export default function BrowsePage() {
    const { game } = useParams();
    const [nodePath, setNodePath] = useState<FolderNode[]>([]);

    const [tree, setTree] = useState<FolderNode | null>(null);
    useEffect(() => {
        const loadTree = async() => {
            const res = await fetch('/structure.json');
            const data = await res.json();
            const gameNode = data.children.find(
                (node: FolderNode) => node.name === game
            );
            setTree(gameNode);
            setNodePath([gameNode]);
        }
        loadTree();
    }, [game])

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
            
            if (data) setFiles(data);
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
    }
 

    return (
        <div>
            <Navbar />

            <div className="browse-page-game-selector">
                <GameCard name="Halo 2" image={halo2Logo} path="/browse/halo2" />
                <GameCard name="Halo 3" image={halo3Logo} path="/browse/halo3" />
            </div>

            <div className="browse-page-div">
                <div className="browse-page-directory">
                    <h2>Browser</h2>
                    {tree && <FolderTree node={tree} depth={1} onFolderClick={onFolderClick}/>}
                </div>

                <div className="browse-page-contents">
                    <h2>Contents</h2>
                    <Breadcrumb nodePath={nodePath} onFolderClick={onFolderClick}></Breadcrumb>
                    <FolderContents nodePath={nodePath} files={files} onFolderClick={onFolderClick}></FolderContents>
                </div>
            </div>
        </div>
    )
}