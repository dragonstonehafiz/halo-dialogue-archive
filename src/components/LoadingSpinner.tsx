import "./LoadingSpinner.css";

type LoadingSpinnerSize = "small" | "medium";

export function LoadingSpinner({ label, size = "medium" }: {
    label: string,
    size?: LoadingSpinnerSize,
}) {
    return (
        <div className={`loading-spinner loading-spinner--${size}`} role="status">
            <span className="loading-spinner-ring" aria-hidden="true"></span>
            <span className="loading-spinner-label">{label}</span>
        </div>
    )
}

export function LoadingContainer({ label, size = "medium" }: {
    label: string,
    size?: LoadingSpinnerSize,
}) {
    return (
        <div className="loading-container">
            <LoadingSpinner label={label} size={size} />
        </div>
    )
}
