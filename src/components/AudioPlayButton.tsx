import { useEffect, useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

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
        setState("loading");
        setAudio(new Audio(src));
    };

    const isLoading = state === "loading";
    const hasError = state === "error";

    return (
        <button
            className="btn-icon"
            onClick={handleClick}
            disabled={isLoading}
            aria-busy={isLoading}
            aria-label={hasError ? `Playback failed for ${label}` : `Play ${label}`}
        >
            {isLoading
                ? <LoadingSpinner label={`Loading ${label}`} size="small" />
                : (hasError ? "⚠" : "▶")}
        </button>
    )
}
