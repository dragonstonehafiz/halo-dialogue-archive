import { useEffect, useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

const PlayIcon = () => (
    <svg className="btn-icon-svg" viewBox="0 0 12 12" aria-hidden="true">
        <polygon points="2,1 11,6 2,11" fill="currentColor" />
    </svg>
);

const StopIcon = () => (
    <svg className="btn-icon-svg" viewBox="0 0 12 12" aria-hidden="true">
        <rect x="2" y="2" width="8" height="8" fill="currentColor" />
    </svg>
);

type PlaybackState = "idle" | "loading" | "playing" | "error";

export function AudioPlayButton({ src, label }: { src: string, label: string }) {
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [state, setState] = useState<PlaybackState>("idle");

    useEffect(() => {
        if (!audio) return;

        const onLoadStart = () => setState("loading");
        const onWaiting = () => setState("loading");
        const onPlaying = () => setState("playing");
        const onEnded = () => setState("idle");
        const onError = () => setState("error");

        audio.addEventListener("loadstart", onLoadStart);
        audio.addEventListener("waiting", onWaiting);
        audio.addEventListener("playing", onPlaying);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);

        audio.play().catch(onError);

        return () => {
            audio.removeEventListener("loadstart", onLoadStart);
            audio.removeEventListener("waiting", onWaiting);
            audio.removeEventListener("playing", onPlaying);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("error", onError);
            audio.pause();
        };
    }, [audio]);

    const handleClick = () => {
        if (state === "loading") return;
        if (state === "playing") {
            setAudio(null);
            setState("idle");
            return;
        }
        setState("loading");
        setAudio(new Audio(src));
    };

    const isLoading = state === "loading";
    const hasError = state === "error";
    const isPlaying = state === "playing";

    return (
        <button
            className="btn-icon"
            onClick={handleClick}
            disabled={isLoading}
            aria-busy={isLoading}
            aria-label={hasError ? `Playback failed for ${label}` : (isPlaying ? `Stop ${label}` : `Play ${label}`)}
        >
            {isLoading
                ? <LoadingSpinner label={`Loading ${label}`} size="small" />
                : (hasError ? "⚠" : (isPlaying ? <StopIcon /> : <PlayIcon />))}
        </button>
    )
}
