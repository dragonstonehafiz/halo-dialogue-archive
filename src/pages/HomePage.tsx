import Navbar from "../components/Navbar"
import './HomePage.css';
import halo2Logo from '../assets/games/halo2.png'
import underConstruction from '../assets/underConstruction.png'
import GameCard from "../components/GameCard";


export default function HomePage() {

    return (
        <div>
            <Navbar/>

            <div className="header">
                <h2>Games</h2>
                <span className="site-info">Welcome to the Halo Dialogue Archive! Though only Halo 2's voice lines are currently available, I intend on adding voice lines from other games eventually.</span>
            </div>

            <div className="games">
                <GameCard name="Halo 2" image={halo2Logo} path="/browse/halo2" />
                <GameCard name="Coming soon..." image={underConstruction} path="temp" disabled />
            </div>
        </div>
    )
}