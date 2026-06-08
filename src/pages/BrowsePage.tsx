import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import "./BrowsePage.css";
import { useEffect, useState } from "react";
import { supabase } from "../components/Supabase";

type FolderNode = {
    name: string;
    children: FolderNode[];
}

type AudioFile = {
    id: number;
    game: string;
    character: string | null;
    tags: string[] | null;
    path: string;
    transcript: string | null;
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

function Breadcrumb({ nodePath, onFolderClick: onSegmentClick } : {
    nodePath: FolderNode[],
    onFolderClick: (node: FolderNode) => void
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

function Contents({ nodePath, files, onFolderClick } : { 
    nodePath: FolderNode[] | null, 
    files: AudioFile[] | null,
    onFolderClick: (node: FolderNode) => void }) {
    if (!nodePath || nodePath.length === 0) return null;
    const currentNode = nodePath[nodePath.length - 1];
    const R2_BASE_URL = import.meta.env.VITE_R2_BASE_URL

    return (
        <div className="contents-grid">
            <table className="contents-table">
                <colgroup>
                    <col style={{width: '60px'}} />
                    <col style={{width: '250px'}} />
                    <col />
                    <col style={{width: '120px'}} />
                    <col style={{width: '180px'}} />
                    <col style={{width: '60px'}} />
                    <col style={{width: '60px'}} />
                </colgroup>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Name</th>
                        <th>Transcript</th>
                        <th>Tags</th>
                        <th>Character</th>
                        <th>Play</th>
                        <th>Download</th>
                    </tr>
                </thead>
                <tbody>
                    {currentNode.children.map(child => (
                        <tr key={child.name}>
                            <td>📁</td>
                            <td><button onClick={() => onFolderClick(child)}>{child.name}</button></td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                    ))}
                    {files?.map(file => (
                        <tr key={file.path}>
                            <td>🔊</td>
                            <td>{file.path.split('/').pop()}</td>
                            <td>{file.transcript ?? '-'}</td>
                            <td>{file.tags?.join(', ') ?? '-'}</td>
                            <td>{file.character ?? '-'}</td>
                            <td>
                                <button className="btn-icon" onClick={() => new Audio(`${R2_BASE_URL}/${file.path}`).play()}>▶</button>
                            </td>
                            <td>
                                <button className="btn-icon" onClick={() => window.open(`${R2_BASE_URL}/${file.path}`, '_blank')}>⬇</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

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
    }, [])

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
                    <Breadcrumb nodePath={nodePath} onFolderClick={onFolderClick}></Breadcrumb>
                    <Contents nodePath={nodePath} files={files} onFolderClick={onFolderClick}></Contents>
                </div>
            </div>
        </div>
    )
}