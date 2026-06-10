import Navbar from "../components/Navbar";
import './AboutPage.css'

export default function AboutPage() {
   return (
    <div>
        <Navbar/>

        <div className="about-section">
            <h2>Why This Site Exists</h2>
            <p>
                This site was made mainly because I had extracted a bunch of Halo voice lines a couple years back and wanted a simple project to get some frontend experience.
                The source code is available on <a href="https://github.com/dragonstonehafiz/halo-dialogue-archive">GitHub</a>.
                While I have no intention of continuously updating this site, you can expect me to tweak/add a few things while I am still in the middle of my job search.
            </p>

            <h2>Voice Line Extraction</h2>
            <p>
                For Bungie-era titles (Halo 2, 3, ODST, and Reach), I used the <a href="https://github.com/Gravemind2401/Reclaimer">Reclaimer</a> tool to 
                extract audio from the game's .map files. These games use proper identifiers in their file names so finding specific lines is easy.
            </p>
            <p>
                For 343-era titles (Halo 4, Halo 5: Forge, and Halo Infinite), I used a
                <a href="https://github.com/Vextil/Wwise-Unpacker"> Wwise Unpacker</a> to extract audio from .pck files. These games use generic file names
                like "sb_001_vo_ai_un_marinemale04_1" so browsing those will be a little less smooth than Bungie era games.
                Halo Wars 2 also uses .bnk files which the same tool can extract, though those files do have proper identifiers.
            </p>

            <h2>Transcripts</h2>
            <p>
                Transcripts were generated using <a href="https://github.com/openai/whisper">OpenAI Whisper</a> on Python.
                They're there to help make searching for specific lines a bit easier, but don't expect 100% accuracy.
            </p>
            <p>
                The specific model used was "Turbo," and I explicitly ignored files that are generally used as efforts and not actual voice lines.
            </p>

            <h2>Downloads</h2>
            <p>
                Each file can be downloaded individually, but I have no intention of adding any way of downloading files in bulk.
                To do so, you will have to extract the files directly with Reclaimer or the Wwise Unpacker.
            </p>
        </div>
    </div>
   ) 
}