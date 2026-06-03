import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import "./BrowsePage.css";
import { useEffect, useState } from "react";

type FolderNode = {
    name: string;
    children: FolderNode[];
}

function FolderTree({ node, depth = 0, onFolderClick }: { 
    node: FolderNode, 
    depth: number,
    onFolderClick: (node: FolderNode) => void 
}) {
    return (
        <div>
            { depth !== 1 && (
                <button 
                    className="folder-button" 
                    style={{paddingLeft:`${depth * 16 - 16}px`}}
                    onClick={() => onFolderClick(node)}
                >
                    {node.name}
                </button>
            )}

            <div>
                {node.children
                    .filter(child => child.children.length > 0)
                    .map(child => (
                    <FolderTree 
                        key={child.name}
                        node={child}
                        depth={depth+1} 
                        onFolderClick={onFolderClick}
                    />
                ))}
            </div>
        </div>
    )
}

function Breadcrumb({ nodePath, onSegmentClick } : {
    nodePath: FolderNode[],
    onSegmentClick: (node: FolderNode) => void
}) {
    return (
        <div className="breadcrumb">
            {nodePath.map((node, index) => (
                <span key={node.name}>
                    <button
                        className="breadcrumb-segment"
                        onClick={() => onSegmentClick(node)}
                    >
                        {node.name}
                    </button>

                    {index < nodePath.length - 1 && <span className="breadcrumb-separator"> &gt; </span>}
                </span>
            ))}
        </div>
    )
}

export default function BrowsePage() {
    const { game } = useParams();
    const [tree, setTree] = useState<FolderNode | null>(null);
    const [nodePath, setNodePath] = useState<FolderNode[]>([]);

    useEffect(() => {
        const loadTree = async() => {
            const res = await fetch('/structure.json');
            const data = await res.json();
            const gameNode = data.children.find(
                (node: FolderNode) => node.name === game
            );
            setTree(gameNode);
        }
        loadTree();
    }, [])

    function findPath(root: FolderNode, target: FolderNode): FolderNode[] | null {
        if (root.name === target.name) return [root]
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

            <div className="browse-page-div">
                <div className="browse-page-directory">
                    <h2>Browser</h2>
                    {tree && <FolderTree node={tree} depth={1} onFolderClick={onFolderClick}/>}
                </div>

                <div className="browse-page-contents">
                    <h2>Contents</h2>
                    <Breadcrumb nodePath={nodePath} onSegmentClick={onFolderClick}></Breadcrumb>
                </div>
            </div>
        </div>
    )
}