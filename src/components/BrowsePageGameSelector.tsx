import GameCard from './GameCard'
import halo2Logo from '../assets/games/halo2.png'
import halo3Logo from '../assets/games/halo3.png'
import halo3odstLogo from '../assets/games/halo3odst.png'
import reachLogo from '../assets/games/reach.png'
import halo4Logo from '../assets/games/halo4.png'
import halo5Logo from '../assets/games/halo5.png'
import infiniteLogo from '../assets/games/infinite.png'
import './BrowsePageGameSelector.css'

const games = [
    { name: 'Halo 2', image: halo2Logo, path: '/browse/halo2' },
    { name: 'Halo 3', image: halo3Logo, path: '/browse/halo3' },
    { name: 'Halo 3: ODST', image: halo3odstLogo, path: '/browse/halo3odst' },
    { name: 'Halo Reach', image: reachLogo, path: '/browse/reach' },
    { name: 'Halo 4', image: halo4Logo, path: '/browse/halo4' },
    { name: 'Halo 5: Guardians', image: halo5Logo, path: '/browse/halo5' },
    { name: 'Halo Infinite', image: infiniteLogo, path: '/browse/infinite' },
]

export default function GameSelector() {
    return (
        <div className="game-selector-scroll">
            {games.map(game => (
                <GameCard key={game.path} name={game.name} image={game.image} path={game.path} />
            ))}
        </div>
    )
}