import type { FolderNode } from "../types/FolderNode"
import './FolderTree.css'

export function FolderTree({ node, depth = 0, onFolderClick }: { 
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
                    .filter(child => child.show_in_browser)
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
