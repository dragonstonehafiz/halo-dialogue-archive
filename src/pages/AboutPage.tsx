import { useState } from "react";
import Navbar from "../components/Navbar";
import './AboutPage.css'

const GAME_TABS = ['Bungie Games', 'Halo 4', 'Halo 5: Forge', 'Halo Infinite'] as const;
type GameTab = typeof GAME_TABS[number];

export default function AboutPage() {
   const [activeTab, setActiveTab] = useState<GameTab>('Bungie Games');

   return (
    <div>
        <Navbar/>

        <div className="about-section">
            <h2>Why This Site Exists</h2>
            <p>
                This site started as a simple frontend project built around Halo voice lines I had extracted a few years ago.
                It has since grown to cover most of the series, with every game's dialogue browsable and searchable in one place.
                The source code is available on <a href="https://github.com/dragonstonehafiz/halo-dialogue-archive">GitHub</a>.
            </p>

            <h2>Voice Line Extraction</h2>
            <p>
                Every voice line on this site was extracted from the games' own files, and each game needed a different approach.
                The Bungie-era games keep readable file names, while the 343-era games store their audio in Audiokinetic Wwise packages
                under numeric IDs, so their names had to be recovered from the games' data.
            </p>

            <div className="about-tabs" role="tablist">
                {GAME_TABS.map(tab => (
                    <button
                        key={tab}
                        role="tab"
                        aria-selected={activeTab === tab}
                        className={activeTab === tab ? 'about-tab active' : 'about-tab'}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'Bungie Games' && (
                <div role="tabpanel">
                    <p>
                        For Bungie-era titles (Halo 2, 3, ODST, and Reach), I used the <a href="https://github.com/Gravemind2401/Reclaimer">Reclaimer</a> tool to
                        extract audio from the game's .map files. These games use proper identifiers in their file names so finding specific lines is easy.
                    </p>
                </div>
            )}

            {activeTab === 'Halo 4' && (
                <div role="tabpanel">
                    <p className="about-callout">
                        Generative AI (Claude and ChatGPT) was used to extract audio from Halo 4.
                    </p>
                    <p>
                        The Halo 4 Editing Kit lists the original file path of every recording, but the packaged audio only uses numeric IDs.
                        The game generates each ID by hashing the recording's path, so hashing every path from the Editing Kit
                        gives the ID of its audio file. That is how each file got its original name and folder,
                        e.g. <code>combat/masterchief/.../dodge/</code>.
                    </p>
                    <p>
                        The retail .map files were read with <a href="https://github.com/Gravemind2401/Reclaimer">Reclaimer</a> to find each sound's hashed path,
                        and the Wwise soundbanks were parsed with <a href="https://github.com/bnnm/wwiser">wwiser</a>. Dialogue played through ordinary events
                        was labeled using the event-name list from <a href="https://github.com/XboxChaos/composer">Composer</a>, an original Halo 4 audio tool.
                    </p>
                </div>
            )}

            {activeTab === 'Halo 5: Forge' && (
                <div role="tabpanel">
                    <p className="about-callout">
                        Generative AI (Claude and ChatGPT) was used to extract audio from Halo 5: Forge.
                    </p>
                    <p>
                        Halo 5 audio comes from Halo 5: Forge on PC. The game's .module files were read with <a href="https://github.com/Gravemind2401/Reclaimer">Reclaimer</a>,
                        and each sound in them lists the Wwise events it plays. Each event was traced through the game's soundbanks
                        (using <a href="https://github.com/bnnm/wwiser">wwiser</a>) to the recordings it plays, and the recordings were then named after the event.
                    </p>
                    <p>
                        Where only an event's numeric ID was available, the name was recovered by guessing likely event names,
                        hashing them, and keeping the ones that matched the ID.
                    </p>
                </div>
            )}

            {activeTab === 'Halo Infinite' && (
                <div role="tabpanel">
                    <p className="about-callout">
                        Generative AI (Claude and ChatGPT) was used to extract audio from Halo Infinite.
                    </p>
                    <p>
                        Halo Infinite audio comes from the installed game's Wwise packages and module files, covering both multiplayer and the campaign.
                        The module data was decompressed with <a href="https://github.com/powzix/ooz">ooz</a> and read with <a href="https://github.com/Gravemind2401/Reclaimer">Reclaimer</a>,
                        and each soundbank was parsed with <a href="https://github.com/bnnm/wwiser">wwiser</a> to follow every event to the recordings it plays.
                    </p>
                    <p>
                        The game stores hashes of its sound names rather than the names themselves. About 38,400 recordings take their names directly from
                        the public <a href="https://github.com/Surasia/ReclaimerFiles/blob/master/strings.txt">ReclaimerFiles</a> name list. Each name was hashed
                        and matched against the event ID stored in the game, e.g. <code>001_vo_ai_brute01_02combat_abandonturret_00100</code>.
                    </p>
                    <p>
                        Most of the remaining ~3,300 names were recovered by recombining those known names: the same line tried for other speakers or seasons,
                        or one part of a name swapped, such as the speaker, season, or take. A smaller number used weapon, item, and medal names
                        from <a href="https://www.halopedia.org">Halopedia</a> and words from subtitle text.
                        Every name, however it was found, was kept only when its hash matched the ID stored in the game.
                    </p>
                </div>
            )}

            <h2>Transcripts</h2>
            <p>
                Where a game has its own subtitles for a line, that subtitle text is used directly. It is the game's stored caption, not a transcription,
                and it is only linked to a file when the subtitle's identifier exactly matches the sound's name.
                This currently covers Halo 2, Halo 3, Reach, Halo 4, and Halo Infinite.
                In Halo Infinite, each line's data references its subtitle directly, and that reference is used to link the two. Captions that are empty or damaged in the game files are kept as stored.
            </p>
            <p>
                Everything without an associated subtitle was transcribed using <a href="https://github.com/openai/whisper">OpenAI Whisper</a> ("Turbo" model).
                These are there to make searching easier, but don't expect 100% accuracy. Files that are generally efforts (grunts, breaths, pain sounds)
                rather than actual voice lines were skipped. Combat lines in every game before Halo Infinite have no in-game subtitles, so those are all Whisper transcripts.
            </p>

            <h2>Downloads</h2>
            <p>
                Each file can be downloaded individually, but I have no intention of adding any way of downloading files in bulk.
                Bungie-era files can be extracted yourself with Reclaimer. For the 343-era games, a plain Wwise unpack will give you
                unnamed, numbered files rather than the names used on this site.
            </p>

            <h2>Tools</h2>
            <ul>
                <li><a href="https://github.com/Gravemind2401/Reclaimer">Reclaimer</a>: map reading, Bungie-era extraction, and Halo 4, Halo 5, and Halo Infinite tag reading</li>
                <li>Halo 4 Editing Kit: original voice paths, event names, and string tables</li>
                <li><a href="https://github.com/XboxChaos/composer">Composer</a>: Halo 4 audio reading and event names</li>
                <li><a href="https://github.com/Zoephie/Baboon">Baboon</a>: Halo 4 sound tag inspection</li>
                <li><a href="https://github.com/powzix/ooz">ooz</a>: Halo Infinite module decompression</li>
                <li><a href="https://github.com/bnnm/wwiser">wwiser</a>: Wwise soundbank parsing</li>
                <li><a href="https://github.com/vgmstream/vgmstream">vgmstream</a>: WEM audio decoding</li>
                <li><a href="https://github.com/openai/whisper">OpenAI Whisper</a>: transcripts for lines without subtitles</li>
            </ul>

            <h2>References</h2>
            <ul>
                <li><a href="https://github.com/Surasia/ReclaimerFiles">ReclaimerFiles</a>: Halo Infinite tag definitions and name list</li>
                <li><a href="https://github.com/dortkoldantaciz/Halo-Infinite-Translation-Toolkit">Halo Infinite Translation Toolkit</a>: tag list checked against unnamed dialogue</li>
                <li><a href="https://www.halopedia.org">Halopedia</a>: weapon, item, and medal names used as naming vocabulary</li>
                <li><a href="https://github.com/XboxChaos/Assembly">Assembly</a>: tag layouts</li>
                <li><a href="https://github.com/Lord-Zedd/MCCLocalizationEditor">MCC Localization Editor</a>: documented subtitle file format</li>
                <li><a href="https://github.com/Nibre/HaloWwise">HaloWwise</a>: Halo Wwise package extraction and event tracing</li>
                <li><a href="https://github.com/bnnm/wwiser-utils">wwiser-utils</a>: Wwise package extraction and naming</li>
                <li><a href="https://www.audiokinetic.com">Audiokinetic Wwise documentation</a>: file packages and external sources</li>
                <li><a href="https://github.com/Gamergotten/murmur3Hash_dumper">murmur3Hash_dumper</a>: the game's string hashing</li>
            </ul>
        </div>
    </div>
   )
}
