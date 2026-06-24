import Navbar from "../components/Navbar"
import './HomePage.css';
import BrowsePageGameSelector from "../components/BrowsePageGameSelector.tsx";


export default function HomePage() {

    return (
        <div>
            <Navbar/>

            <div className="header">
                <h2>Games</h2>
                <span className="site-info">Welcome to the Halo Dialogue Archive! Right now there are only 4 games worth of data available, but I intend on adding at the very least all the mainline games (minus Halo 5 since I'm not too sure how to get its full game files).</span>
            </div>

            <div className="games">
                <BrowsePageGameSelector />
            </div>
        </div>
    )
}