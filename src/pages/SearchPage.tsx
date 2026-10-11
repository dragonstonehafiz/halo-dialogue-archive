import { useSearchParams } from "react-router-dom"
import Navbar from "../components/Navbar";
import './SearchPage.css'
import type { AudioFile } from "../types/AudioFile";
import Select from "react-select";
import type { GroupBase, OptionsOrGroups } from "react-select";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { search as searchApi, SEARCH_MIN_QUERY_LENGTH } from "../lib/api";
import { FolderContents } from "../components/FolderContents";
import { Pager } from "../components/Pager";
import { LoadingContainer, LoadingSpinner } from "../components/LoadingSpinner";

const SelectLoadingIndicator = () => <LoadingSpinner label="Loading options" size="small" />;

const PAGE_SIZE = 50;

type SearchQuery = {
    q: string;
    games: string[];
    characters: string[];
    tags: string[];
    page: number;
}

// Each value is its own repeated param (?characters=A&characters=B), so names containing commas stay whole.
function parseList(values: string[]): string[] {
    return values.filter(Boolean)
}

function parseChoices(values: string[]): { value: string; label: string }[] {
    return parseList(values).map(v => ({ value: v, label: v }))
}

function parsePage(value: string | null): number {
    const page = Number(value)
    return Number.isInteger(page) && page >= 0 ? page : 0
}

// A URL only describes a runnable search if it carries facets or a long enough q.
function queryFromParams(params: URLSearchParams): SearchQuery | null {
    const query: SearchQuery = {
        q: (params.get('q') ?? '').trim(),
        games: parseList(params.getAll('games')),
        characters: parseList(params.getAll('characters')),
        tags: parseList(params.getAll('tags')),
        page: parsePage(params.get('page')),
    }
    const hasFilters = query.games.length > 0 || query.characters.length > 0 || query.tags.length > 0
    if (Array.from(query.q).length >= SEARCH_MIN_QUERY_LENGTH) return query
    if (!query.q && hasFilters) return query
    return null
}

function paramsFromQuery(query: SearchQuery): Record<string, string | string[]> {
    const params: Record<string, string | string[]> = {}
    if (query.q) params.q = query.q
    if (query.games.length) params.games = query.games
    if (query.tags.length) params.tags = query.tags
    if (query.characters.length) params.characters = query.characters
    if (query.page > 0) params.page = String(query.page)
    return params
}

type Option = { value: string; label: string };
type FilterOptions = OptionsOrGroups<Option, GroupBase<Option>>;
type FilterGroup = { label: string; values: string[] };

// filters.json lists every value flat, and may also carry curated groups for a
// key. A value can sit in several groups; react-select matches selections by
// value, so picking it in one group marks it selected everywhere.
function toFilterOptions(values: string[] | undefined, groups: FilterGroup[] | undefined): FilterOptions {
    if (groups?.length) {
        return groups.map(g => ({ label: g.label, options: g.values.map(v => ({ value: v, label: v })) }))
    }
    return (values ?? []).map(v => ({ value: v, label: v }))
}

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
    groupHeading: (base: object) => ({
        ...base,
        color: 'var(--text-muted)',
    }),
}

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams()

    // The URL is the source of truth for the search: Back/Forward, a shared link and
    // a reload all arrive the same way. queryKey is stable while the URL is unchanged,
    // so it drives both the form sync below and the fetch effect.
    const queryKey = searchParams.toString()
    const submittedQuery = useMemo(() => queryFromParams(new URLSearchParams(queryKey)), [queryKey])

    const [gameChoices, setGameChoices] = useState<{ value: string; label: string }[]>(() =>
        parseChoices(searchParams.getAll('games'))
    )
    const [tagChoices, setTagChoices] = useState<{ value: string; label: string }[]>(() =>
        parseChoices(searchParams.getAll('tags'))
    )
    const [characterChoices, setCharacterChoices] = useState<{ value: string; label: string }[]>(() =>
        parseChoices(searchParams.getAll('characters'))
    )

    const [gameOptions, setGameOptions] = useState<FilterOptions>([])
    const [tagOptions, setTagOptions] = useState<FilterOptions>([])
    const [characterOptions, setCharacterOptions] = useState<FilterOptions>([])
    const [filtersLoading, setFiltersLoading] = useState(true)
    const [filtersError, setFiltersError] = useState<string | null>(null)
    useEffect(() => {
        const controller = new AbortController()

        const loadFilters = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_DATA_BASE_URL ?? ''}/filters.json`, { signal: controller.signal })
                if (!res.ok) throw new Error("Could not load filters.")
                const data = await res.json()
                setGameOptions(toFilterOptions(data.games, data.groups?.games))
                setTagOptions(toFilterOptions(data.tags, data.groups?.tags))
                setCharacterOptions(toFilterOptions(data.characters, data.groups?.characters))
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") return
                setFiltersError("Filters could not be loaded. Transcript search is still available.")
            } finally {
                if (!controller.signal.aborted) setFiltersLoading(false)
            }
        }

        loadFilters()

        return () => controller.abort()
    }, [])

    const [search, setSearch] = useState(() => searchParams.get('q') ?? '')

    const [searchResults, setSearchResults] = useState<AudioFile[]>([])
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [hasSearched, setHasSearched] = useState(false)
    const abortRef = useRef<AbortController | null>(null)

    // Pull the form and the results back in line whenever the URL moves out from under
    // us — Back/Forward, or the out-of-range clamp below. Adjusting state during render
    // (rather than in an effect) keeps the form from painting the previous query first.
    const [syncedKey, setSyncedKey] = useState(queryKey)
    if (syncedKey !== queryKey) {
        setSyncedKey(queryKey)
        setSearch(searchParams.get('q') ?? '')
        setGameChoices(parseChoices(searchParams.getAll('games')))
        setTagChoices(parseChoices(searchParams.getAll('tags')))
        setCharacterChoices(parseChoices(searchParams.getAll('characters')))
        setSearchResults([])
        setTotal(0)
        setTotalPages(0)
        setSearchError(null)
        setHasSearched(false)
    }

    const trimmedSearch = search.trim()
    const isQueryTooShort = trimmedSearch.length > 0 && Array.from(trimmedSearch).length < SEARCH_MIN_QUERY_LENGTH
    const hasFilters = gameChoices.length > 0 || tagChoices.length > 0 || characterChoices.length > 0
    const canSearch = !isQueryTooShort && (trimmedSearch.length > 0 || hasFilters)

    // Writing the URL is all a submit does; the render-time sync and the fetch effect
    // both follow from it.
    const submitQuery = useCallback((query: SearchQuery, replace = false) => {
        setSearchParams(paramsFromQuery(query), { replace })
    }, [setSearchParams])

    function onSearch() {
        if (!canSearch) return
        // Any change to the text or the facets starts again from the first page.
        submitQuery({
            q: trimmedSearch,
            games: gameChoices.map(g => g.value),
            characters: characterChoices.map(c => c.value),
            tags: tagChoices.map(t => t.value),
            page: 0,
        })
    }

    function onPageChange(page: number) {
        if (!submittedQuery || page === submittedQuery.page) return
        submitQuery({ ...submittedQuery, page })
    }

    useEffect(() => {
        if (!submittedQuery) return

        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        const run = async () => {
            setSearchLoading(true)
            setSearchError(null)
            try {
                const data = await searchApi({
                    q: submittedQuery.q || undefined,
                    games: submittedQuery.games,
                    characters: submittedQuery.characters,
                    tags: submittedQuery.tags,
                    page: submittedQuery.page,
                    pageSize: PAGE_SIZE,
                }, controller.signal)

                // Asking past the end (a stale link, or facets that narrowed since)
                // returns no rows but a real total — step back to the last real page.
                if (data.results.length === 0 && data.total > 0 && submittedQuery.page > data.totalPages - 1) {
                    // replace: the out-of-range page should not become a Back target.
                    submitQuery({ ...submittedQuery, page: Math.max(0, data.totalPages - 1) }, true)
                    return
                }

                setSearchResults(data.results)
                setTotal(data.total)
                setTotalPages(data.totalPages)
                setHasSearched(true)
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") return
                setSearchResults([])
                setTotal(0)
                setTotalPages(0)
                setSearchError(err instanceof Error ? err.message : "Search failed. Please try again.")
                setHasSearched(true)
            } finally {
                // Clear the spinner unless a newer request has already taken over —
                // including when this one was aborted because the query went away.
                if (abortRef.current === controller) setSearchLoading(false)
            }
        }

        run()

        return () => controller.abort()
    }, [submittedQuery, submitQuery])

    useEffect(() => {
        return () => abortRef.current?.abort()
    }, [])

    const page = submittedQuery?.page ?? 0
    const firstRow = page * PAGE_SIZE + 1
    const lastRow = Math.min(total, page * PAGE_SIZE + searchResults.length)
    const showResults = !searchLoading && !searchError && total > 0

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
                            isLoading={filtersLoading}
                            isDisabled={filtersLoading}
                            components={{ LoadingIndicator: SelectLoadingIndicator }}
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
                            isLoading={filtersLoading}
                            isDisabled={filtersLoading}
                            components={{ LoadingIndicator: SelectLoadingIndicator }}
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
                            isLoading={filtersLoading}
                            isDisabled={filtersLoading}
                            components={{ LoadingIndicator: SelectLoadingIndicator }}
                        />
                    </div>
                </div>
                <button
                    className='filter-search-button'
                    disabled={!canSearch || searchLoading}
                    onClick={onSearch}>{searchLoading ? "Searching…" : "Search"}
                </button>
                {isQueryTooShort && (
                    <p className="search-hint">Enter at least {SEARCH_MIN_QUERY_LENGTH} characters, or clear the text and search by filters alone.</p>
                )}
                {!isQueryTooShort && !trimmedSearch && !hasFilters && (
                    <p className="search-hint">Enter a transcript search, or pick at least one filter.</p>
                )}
                {filtersError && <p className="search-error" role="alert">{filtersError}</p>}
            </div>

            <div className="files-available-section" aria-busy={searchLoading}>
                <h2>Results</h2>
                {searchLoading && <LoadingContainer label="Searching dialogue" />}
                {!searchLoading && searchError && <p className="search-error" role="alert">{searchError}</p>}
                {!searchLoading && !searchError && hasSearched && total === 0 && (
                    <p className="search-hint">No dialogue matched your search.</p>
                )}
                {showResults && (
                    <p className="search-hint">
                        Showing {firstRow.toLocaleString("en-US")}&ndash;{lastRow.toLocaleString("en-US")} of {total.toLocaleString("en-US")} {total === 1 ? "result" : "results"}
                    </p>
                )}
                {!searchLoading && !searchError && (!hasSearched || total > 0) && (
                    <FolderContents files={searchResults} groupByFolder />
                )}
                {showResults && (
                    <Pager page={page} totalPages={totalPages} onPageChange={onPageChange} />
                )}
            </div>
        </div>
    )
}
