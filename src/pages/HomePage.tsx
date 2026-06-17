import Navbar from "../components/Navbar"
import './HomePage.css';
import GameCard from "../components/GameCard";

import halo2Logo from '../assets/games/halo2.png'
import halo3Logo from '../assets/games/halo3.png'
import halo3odstLogo from '../assets/games/halo3odst.png'
import reachLogo from '../assets/games/reach.png'
import halo4Logo from '../assets/games/halo4.png'


export default function HomePage() {

    return (
        <div>
            <Navbar/>

            <div className="header">
                <h2>Games</h2>
                <span className="site-info">Welcome to the Halo Dialogue Archive! Right now there are only 4 games worth of data available, but I intend on adding at the very least all the mainline games (minus Halo 5 since I'm not too sure how to get its full game files).</span>
            </div>

            <div className="games">
                <GameCard name="Halo 2" image={halo2Logo} path="/browse/halo2" />
                <GameCard name="Halo 3" image={halo3Logo} path="/browse/halo3" />
                <GameCard name="Halo 3 ODST" image={halo3odstLogo} path="/browse/halo3odst" />
                <GameCard name="Halo Reach" image={reachLogo} path="/browse/reach" />
                <GameCard name="Halo 4" image={halo4Logo} path="/browse/halo4" />
                {/* <GameCard name="Coming soon..." image={underConstruction} path="temp" disabled /> */}
            </div>
        </div>
    )
}