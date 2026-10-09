import Navbar from "../components/Navbar"
import './HomePage.css';
import BrowsePageGameSelector from "../components/BrowsePageGameSelector.tsx";


export default function HomePage() {

    return (
        <div>
            <Navbar/>

            <div className="header">
                <h2>Games</h2>
                <span className="site-info">Welcome to the Halo Dialogue Archive! Browse and search voice lines from every mainline Halo game, from Combat Evolved to Infinite.</span>
            </div>

            <div className="games">
                <BrowsePageGameSelector />
            </div>
        </div>
    )
}