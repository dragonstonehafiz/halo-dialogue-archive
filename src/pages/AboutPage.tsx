import Navbar from "../components/Navbar";
import './AboutPage.css'

export default function AboutPage() {
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

            <h2>Voice Line Extraction: Bungie-era</h2>
            <p>
                For Bungie-era titles (Halo 2, 3, ODST, and Reach), I used the <a href="https://github.com/Gravemind2401/Reclaimer">Reclaimer</a> tool to
                extract audio from the game's .map files. These games use proper identifiers in their file names so finding specific lines is easy.
            </p>

            <h2>Voice Line Extraction: 343-era</h2>
            <p className="about-callout">
                I used generative AI (Claude and ChatGPT) to extract audio from Halo 4, Halo 5, and Halo Infinite.
            </p>
            <p>
                The 343-era games use Audiokinetic Wwise, which stores audio in .pck packages as numbered files with no readable names.
                Unpacking them directly gives you thousands of files with no indication of who is speaking or when.
                The names on this site were recovered from the games' own data.
            </p>

            <h3>Halo 4</h3>
            <p>
                The Halo 4 Editing Kit lists the original file path of every recording, but the packaged audio only uses numeric IDs.
                The game generates each ID by hashing the recording's path, so hashing every path from the Editing Kit
                gives the ID of its audio file. That is how each file got its original name and folder,
                e.g. <code>combat/masterchief/.../dodge/</code>.
            </p>

            <h3>Halo 5</h3>
            <p>
                Halo 5 audio comes from Halo 5: Forge on PC. Each sound in the game's data lists the Wwise events it plays,
                and each event was traced through the game's soundbanks (using <a href="https://github.com/bnnm/wwiser">wwiser</a>) to the
                recordings it plays. The recordings were then named after the event.
            </p>
            <p>
                Where only an event's numeric ID was available, the name was recovered by guessing likely event names,
                hashing them, and keeping the ones that matched the ID.
            </p>

            <h3>Halo Infinite</h3>
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

            <h2>Tools and References</h2>
            <ul>
                <li><a href="https://github.com/Gravemind2401/Reclaimer">Reclaimer</a>: map reading, Bungie-era extraction, and Halo Infinite tag reading</li>
                <li><a href="https://github.com/Surasia/ReclaimerFiles">ReclaimerFiles</a>: Halo Infinite tag definitions and name list</li>
                <li><a href="https://github.com/powzix/ooz">ooz</a>: Halo Infinite module decompression</li>
                <li><a href="https://github.com/XboxChaos/Assembly">Assembly</a>: tag layouts</li>
                <li><a href="https://github.com/bnnm/wwiser">wwiser</a>: Wwise soundbank parsing</li>
                <li><a href="https://github.com/dortkoldantaciz/Halo-Infinite-Translation-Toolkit">Halo Infinite Translation Toolkit</a>: tag list checked against unnamed dialogue</li>
                <li><a href="https://github.com/Gamergotten/murmur3Hash_dumper">murmur3Hash_dumper</a>: reference for the game's string hashing</li>
                <li><a href="https://www.halopedia.org">Halopedia</a>: weapon, item, and medal names used as naming vocabulary</li>
                <li>MCC Localization Editor: documented subtitle file format</li>
                <li><a href="https://github.com/openai/whisper">OpenAI Whisper</a>: transcripts for lines without subtitles</li>
            </ul>
        </div>
    </div>
   )
}
