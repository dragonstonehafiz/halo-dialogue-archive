import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import type { FolderNode } from "../types/FolderNode";
import type { AudioFile } from "../types/AudioFile";
import { AudioPlayButton } from "./AudioPlayButton";
import { TranscriptCell } from "./TranscriptCell";
import { Breadcrumb } from "./Breadcrumb";
import './FolderContents.css'

export function FolderContents({ nodePath, files, onFolderClick, groupByFolder } : { 
    nodePath?: FolderNode[] | null, 
    files: AudioFile[] | null,
    onFolderClick?: (node: FolderNode) => void,
    groupByFolder?: boolean }) {
    
    const currentNode = nodePath ? nodePath[nodePath.length - 1]: null;
    const navigate = useNavigate()
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
                    <col style={{width: '110px'}} />
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
                    {currentNode && onFolderClick && currentNode.children.map(child => (
                        <tr key={child.name}>
                            <td>📁</td>
                            <td><button onClick={() => onFolderClick(child)}>{child.name}</button></td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>{child.file_count.toLocaleString("en-US")} files</td>
                        </tr>
                    ))}
                    {files?.map((file, i) => (
                        <Fragment key={file.path}>
                        {groupByFolder && file.parent !== files[i - 1]?.parent && (
                            <tr className="contents-group">
                                <td colSpan={7}>
                                    <Breadcrumb nodePath={folderCrumbs(file.parent ?? '')} onFolderClick={node => navigate(`/browse/${node.path}`)} />
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td>🔊</td>
                            <td>{file.path.split('/').pop()}</td>
                            <td><TranscriptCell text={file.transcript} title={file.path.split('/').pop()} /></td>
                            <td>{file.tags?.join(', ') ?? '-'}</td>
                            <td>{file.character ?? '-'}</td>
                            <td>
                                <AudioPlayButton src={`${R2_BASE_URL}/${file.path}`} label={file.path.split('/').pop() ?? file.path} />
                            </td>
                            <td>
                                <button className="btn-icon" onClick={() => window.open(`${R2_BASE_URL}/${file.path}`, '_blank')}>⬇</button>
                            </td>
                        </tr>
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// Breadcrumb only reads name and path, so a parent path like
// "halo5/multiplayer/x" is enough to build its nodes without the tree.
function folderCrumbs(parent: string): FolderNode[] {
    const segments = parent.split('/')
    return segments.map((name, i) => ({
        name,
        path: segments.slice(0, i + 1).join('/'),
        file_count: 0,
        children: [],
    }))
}
