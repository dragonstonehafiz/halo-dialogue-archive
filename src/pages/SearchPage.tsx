import Navbar from "../components/Navbar";
import './SearchPage.css'
import type { AudioFile } from "../types/AudioFile";
import Select from "react-select";
import { useEffect, useState } from "react";
import { supabase } from "../components/Supabase";
import { FolderContents } from "../components/FolderContents";

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
    const [gameChoices, setGameChoices] = useState<{ value: string; label: string }[]>([])
    const [tagChoices, setTagChoices] = useState<{ value: string; label: string }[]>([])
    const [characterChoices, setCharacterChoices] = useState<{ value: string; label: string }[]>([])
    
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

    const [search, setSearch] = useState('')

    const [searchResults, setSearchResults] = useState<AudioFile[]>([])
    async function onSearch() {
        if (!search.trim()) return
        let query = supabase
            .from('audio_files')
            .select('*')
            .or(`transcript.ilike.%${search}%,filename.ilike.%${search}%`)
        
        if (gameChoices.length > 0)
            query = query.in('game', gameChoices.map(g => g.value))

        if (characterChoices.length > 0)
            query = query.in('character', characterChoices.map(c => c.value))

        if (tagChoices.length > 0)
            query = query.overlaps('tags', tagChoices.map(t => t.value))

        const { data, error } = await query

        if (data)
            setSearchResults(data)
        if (error) 
            console.error(error)
    }

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
                    disabled={!search.trim()}
                    onClick={onSearch}>Search
                </button>
            </div>

            <div className="files-available-section">
                <h2>Results</h2>
                <FolderContents files={searchResults} />
            </div>
        </div>
    )
}