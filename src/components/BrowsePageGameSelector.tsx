import GameCard from './GameCard'
import halo2Logo from '../assets/games/halo2.webp'
import halo3Logo from '../assets/games/halo3.webp'
import halo3odstLogo from '../assets/games/halo3odst.webp'
import reachLogo from '../assets/games/reach.webp'
import halo4Logo from '../assets/games/halo4.webp'
import halo5Logo from '../assets/games/halo5.webp'
import infiniteLogo from '../assets/games/infinite.webp'
import halocevLogo from '../assets/games/halo-cev.webp'
import './BrowsePageGameSelector.css'

const games = [
    { name: 'Halo 2', image: halo2Logo, path: '/browse/halo2' },
    { name: 'Halo 3', image: halo3Logo, path: '/browse/halo3' },
    { name: 'Halo 3: ODST', image: halo3odstLogo, path: '/browse/halo3odst' },
    { name: 'Halo Reach', image: reachLogo, path: '/browse/reach' },
    { name: 'Halo 4', image: halo4Logo, path: '/browse/halo4' },
    { name: 'Halo 5: Forge', image: halo5Logo, path: '/browse/halo5' },
    { name: 'Halo Infinite', image: infiniteLogo, path: '/browse/infinite' },
    { name: 'Halo Campaign Evolved', image: halocevLogo, path: '/browse/halo-cev' },
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