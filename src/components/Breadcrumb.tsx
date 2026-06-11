import type { FolderNode } from "../types/FolderNode"
import './Breadcrumb.css'

export function Breadcrumb({ nodePath, onFolderClick: onSegmentClick } : {
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

