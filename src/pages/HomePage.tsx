import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import './HomePage.css';
import halo2Logo from '../assets/games/halo2.png'

export default function HomePage() {
    return (
        <div>
            <Navbar/>

            <div className="header">
                <h2>Games</h2>
                <span className="site-info">Welcome to the Halo Dialogue Archive! Though only Halo 2's voice lines are currently available, I intend on adding voice lines from other games eventually.</span>
            </div>

            <div className="games">
                <div className="game-selector">
                    <img className="game-image" src={halo2Logo} alt="Halo 2" />
                    <Link to="browse/halo2">Halo 2</Link>
                </div>

                <div className="coming-soon">
                    <div className="game-image">
                        <img></img>
                    </div>
                    <span>Coming soon...</span>
                </div>
            </div>
        </div>
    )
}