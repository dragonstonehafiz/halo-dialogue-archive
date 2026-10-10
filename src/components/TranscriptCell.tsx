import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import './TranscriptCell.css'

export function TranscriptCell({ text, title } : { text: string | null, title?: string }) {
    const textRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [overflowing, setOverflowing] = useState(false);

    // Re-check whenever the cell is resized, since the clamp depends on the column width.
    useLayoutEffect(() => {
        const el = textRef.current;
        if (!el) return;

        const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
        check();
        const observer = new ResizeObserver(check);
        observer.observe(el);
        return () => observer.disconnect();
    }, [text]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    if (!text) return <>-</>;

    return (
        <div className="transcript-cell">
            <div className="transcript-row">
                <div ref={textRef} className="transcript-text">
                    {text}
                </div>
                {(overflowing || text.includes('\n')) && (
                    <button className="transcript-more" onClick={() => setOpen(true)} aria-label="Show full transcript">
                        ...
                    </button>
                )}
            </div>
            {open && createPortal(
                <div className="transcript-modal-backdrop" onClick={() => setOpen(false)}>
                    <div className="transcript-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                        <div className="transcript-modal-header">
                            <span className="transcript-modal-title">{title ?? 'Transcript'}</span>
                            <button className="transcript-modal-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
                        </div>
                        <div className="transcript-modal-body">{text}</div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
