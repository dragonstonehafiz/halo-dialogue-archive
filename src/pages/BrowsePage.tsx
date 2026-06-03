import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import "./BrowsePage.css";
import { useEffect, useState } from "react";

type FolderNode = {
    name: string;
    children: FolderNode[];
}

function filterEmptyFolders(node: FolderNode): FolderNode {
    const filteredChildren = node.children
        .filter(child => child.children.length > 0)
        .map(child => filterEmptyFolders(child))
    return { ...node, children: filteredChildren }
}

function FolderTree({ node, depth = 0 }: { node: FolderNode, depth: number }) {
    return (
        <div>
            { depth !== 1 && (
                <button 
                    className="folder-button" 
                    style={{paddingLeft:`${depth * 16 - 16}px`}}
                >
                    {node.name}
                </button>
            )}

            <div>
                {node.children.map(child => (
                    <FolderTree key = {child.name} node={child} depth={depth+1}/>
                ))}
            </div>
        </div>
    )
}

export default function BrowsePage() {
    const { game } = useParams();
    const [tree, setTree] = useState<FolderNode | null>(null);
    
    useEffect(() => {
        const loadTree = async() => {
            const res = await fetch('/structure.json');
            const data = await res.json();
            const gameNode = data.children.find(
                (node: FolderNode) => node.name === game
            );
            setTree(filterEmptyFolders(gameNode));
        }
        loadTree();
    }, [])

    return (
        <div>
            <Navbar />

            <div className="browse-page-div">
                <div className="browse-page-directory">
                    <h2>Browser</h2>
                    {tree && <FolderTree node={tree} depth={1}/>}
                </div>

                <div className="browse-page-contents">
                    <h2>Contents</h2>
                </div>
            </div>
        </div>
    )
}