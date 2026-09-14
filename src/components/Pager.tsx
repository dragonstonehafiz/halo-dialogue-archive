import './Pager.css'

const WINDOW = 2;

function pageItems(page: number, totalPages: number): (number | 'gap')[] {
    const wanted = new Set<number>([0, totalPages - 1])
    for (let p = page - WINDOW; p <= page + WINDOW; p++) {
        if (p >= 0 && p < totalPages) wanted.add(p)
    }

    const sorted = [...wanted].sort((a, b) => a - b)
    const items: (number | 'gap')[] = []
    let previous: number | null = null
    for (const p of sorted) {
        if (previous !== null && p - previous > 1) items.push('gap')
        items.push(p)
        previous = p
    }
    return items
}

export function Pager({ page, totalPages, onPageChange }: {
    page: number,
    totalPages: number,
    onPageChange: (page: number) => void }) {

    if (totalPages <= 1) return null

    return (
        <nav className="pager" aria-label="Search results pages">
            <button
                className="pager-button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 0}
                aria-label="Previous page">‹ Prev
            </button>
            {pageItems(page, totalPages).map((item, i) => (
                item === 'gap'
                    ? <span key={`gap-${i}`} className="pager-gap" aria-hidden="true">…</span>
                    : <button
                        key={item}
                        className={`pager-button pager-page${item === page ? ' is-current' : ''}`}
                        onClick={() => onPageChange(item)}
                        aria-label={`Page ${item + 1}`}
                        aria-current={item === page ? 'page' : undefined}>{item + 1}
                    </button>
            ))}
            <button
                className="pager-button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages - 1}
                aria-label="Next page">Next ›
            </button>
        </nav>
    )
}
