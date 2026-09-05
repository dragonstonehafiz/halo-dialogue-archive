import { useSearchParams } from "react-router-dom"
import Navbar from "../components/Navbar";
import './SearchPage.css'
import type { AudioFile } from "../types/AudioFile";
import Select from "react-select";
import { useEffect, useRef, useState } from "react";
import { search as searchApi } from "../lib/api";
import { FolderContents } from "../components/FolderContents";

const MIN_QUERY_LENGTH = 3;
const RESULT_CAP = 200;

const selectStyles = {
    control: (base: object) => ({
        ...base,
        backgroundColor: 'var(--background)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
    }),
    menu: (base: object) => ({
        ...base,
        backgroundColor: 'var(--surface)',
    }),
    option: (base: object, state: { isFocused: boolean }) => ({
        ...base,
        backgroundColor: state.isFocused ? 'var(--border)' : 'var(--surface)',
        color: 'var(--text)',
    }),
    multiValue: (base: object) => ({
        ...base,
        backgroundColor: 'var(--border)',
    }),
    multiValueLabel: (base: object) => ({
        ...base,
        color: 'var(--text)',
    }),
    input: (base: object) => ({
        ...base,
        color: 'var(--text)',
    }),
    placeholder: (base: object) => ({
        ...base,
        color: 'var(--text)',
    }),
}

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams()

    const [gameChoices, setGameChoices] = useState<{ value: string; label: string }[]>(() =>
        (searchParams.get('games')?.split(',').filter(Boolean) ?? []).map(g => ({ value: g, label: g }))
    )
    const [tagChoices, setTagChoices] = useState<{ value: string; label: string }[]>(() =>
        (searchParams.get('tags')?.split(',').filter(Boolean) ?? []).map(t => ({ value: t, label: t }))
    )
    const [characterChoices, setCharacterChoices] = useState<{ value: string; label: string }[]>(() =>
        (searchParams.get('characters')?.split(',').filter(Boolean) ?? []).map(c => ({ value: c, label: c }))
    )

    const [gameOptions, setGameOptions] = useState<{ value: string; label: string }[]>([])
    const [tagOptions, setTagOptions] = useState<{ value: string; label: string }[]>([])
    const [characterOptions, setCharacterOptions] = useState<{ value: string; label: string }[]>([])
    useEffect(() => {
        fetch('/filters.json')
            .then(res => res.json())
            .then(data => {
                setGameOptions(data.games.map((g: string) => ({ value: g, label: g })))
                setTagOptions(data.tags.map((t: string) => ({ value: t, label: t })))
                setCharacterOptions(data.characters.map((c: string) => ({ value: c, label: c})))
            })
    }, [])

    const [search, setSearch] = useState(() => searchParams.get('q') ?? '')

    const [searchResults, setSearchResults] = useState<AudioFile[]>([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [hasSearched, setHasSearched] = useState(false)
    const abortRef = useRef<AbortController | null>(null)

    const trimmedSearch = search.trim()
    const isQueryTooShort = trimmedSearch.length > 0 && Array.from(trimmedSearch).length < MIN_QUERY_LENGTH

    async function onSearch() {
        if (!trimmedSearch || Array.from(trimmedSearch).length < MIN_QUERY_LENGTH) return

        const params: Record<string, string> = { q: trimmedSearch }
        if (gameChoices.length) params.games = gameChoices.map(g => g.value).join(',')
        if (tagChoices.length) params.tags = tagChoices.map(t => t.value).join(',')
        if (characterChoices.length) params.characters = characterChoices.map(c => c.value).join(',')
        setSearchParams(params)

        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setSearchLoading(true)
        setSearchError(null)
        try {
            const data = await searchApi({
                q: trimmedSearch,
                games: gameChoices.map(g => g.value),
                characters: characterChoices.map(c => c.value),
                tags: tagChoices.map(t => t.value),
            }, controller.signal)
            setSearchResults(data)
            setHasSearched(true)
        } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") return
            setSearchResults([])
            setSearchError(err instanceof Error ? err.message : "Search failed. Please try again.")
            setHasSearched(true)
        } finally {
            if (!controller.signal.aborted) setSearchLoading(false)
        }
    }

    useEffect(() => {
        return () => abortRef.current?.abort()
    }, [])



    return (
        <div>
            <Navbar/>

            <div className="filters-section">
                <div className="filters-row">
                    <div className='filter-item'>
                        <label>Transcript Search</label>
                        <input 
                            className='filters-search-transcript' 
                            type='text'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                    </div>
                    <div className='filter-item'>
                        <label>Tags</label>
                        <Select 
                            options={tagOptions}
                            value={tagChoices}
                            styles={selectStyles}
                            onChange={(choices) => setTagChoices([...choices])}
                            isMulti={true}
                        />
                    </div>
                    <div className='filter-item'>
                        <label>Game</label>
                        <Select 
                            options={gameOptions}
                            value={gameChoices}
                            styles={selectStyles}
                            onChange={(choices) => setGameChoices([...choices])}
                            isMulti={true}
                        />
                    </div>
                    <div className='filter-item'>
                        <label>Character</label>
                        <Select 
                            options={characterOptions}
                            value={characterChoices}
                            styles={selectStyles}
                            onChange={(choices) => setCharacterChoices([...choices])}
                            isMulti={true}
                        />
                    </div>
                </div>
                <button
                    className='filter-search-button'
                    disabled={!trimmedSearch || isQueryTooShort || searchLoading}
                    onClick={onSearch}>Search
                </button>
                {isQueryTooShort && (
                    <p className="search-hint">Enter at least {MIN_QUERY_LENGTH} characters to search.</p>
                )}
            </div>

            <div className="files-available-section">
                <h2>Results</h2>
                {searchLoading && <p>Loading…</p>}
                {searchError && <p className="search-error">{searchError}</p>}
                {!searchLoading && !searchError && hasSearched && searchResults.length === RESULT_CAP && (
                    <p className="search-hint">Showing up to {RESULT_CAP} results. Refine your search to narrow the list.</p>
                )}
                {!searchLoading && !searchError && <FolderContents files={searchResults} />}
            </div>
        </div>
    )
}