import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import './HomePage.css';
import halo2Logo from '../assets/games/halo2.png'
import underConstruction from '../assets/underConstruction.png'


export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div>
            <Navbar/>

            <div className="header">
                <h2>Games</h2>
                <span className="site-info">Welcome to the Halo Dialogue Archive! Though only Halo 2's voice lines are currently available, I intend on adding voice lines from other games eventually.</span>
            </div>

            <div className="games">
                <button className="game-selector" onClick={()=>navigate('/browse/halo2')}>
                    <img className="game-image" src={halo2Logo} alt="Halo 2" />
                    <span>Halo 2</span>
                </button>

                <div className="coming-soon">
                    <img className="game-image" src={underConstruction} alt="Coming Soon Icon" />
                    <span>Coming soon...</span>
                </div>
            </div>
        </div>
    )
}