import type { FolderNode } from "../types/FolderNode";
import type { AudioFile } from "../types/AudioFile";
import './FolderContents.css'

export function FolderContents({ nodePath, files, onFolderClick } : { 
    nodePath?: FolderNode[] | null, 
    files: AudioFile[] | null,
    onFolderClick?: (node: FolderNode) => void }) {
    
    const currentNode = nodePath ? nodePath[nodePath.length - 1]: null;
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
                    {currentNode && onFolderClick && currentNode.children.map(child => (
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