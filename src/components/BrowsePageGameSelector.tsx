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

const originalTrilogy = [
    { name: 'Halo Campaign Evolved', image: halocevLogo, path: '/browse/halo-cev' },
    { name: 'Halo 2', image: halo2Logo, path: '/browse/halo2' },
    { name: 'Halo 3', image: halo3Logo, path: '/browse/halo3' },
]

const reclaimerSaga = [
    { name: 'Halo 4', image: halo4Logo, path: '/browse/halo4' },
    { name: 'Halo 5: Forge', image: halo5Logo, path: '/browse/halo5' },
    { name: 'Halo Infinite', image: infiniteLogo, path: '/browse/infinite' },
]

const spinoffs = [
    { name: 'Halo 3: ODST', image: halo3odstLogo, path: '/browse/halo3odst' },
    { name: 'Halo Reach', image: reachLogo, path: '/browse/reach' },
]

type Game = typeof originalTrilogy[number]

function renderCards(games: Game[]) {
    return games.map(game => (
        <GameCard key={game.path} name={game.name} image={game.image} path={game.path} />
    ))
}

export default function GameSelector({ grouped = false }: { grouped?: boolean }) {
    if (grouped) {
        return (
            <div className="game-selector-groups">
                <section className="game-selector-group">
                    <h3>Original Trilogy</h3>
                    <div className="game-selector-grid">{renderCards(originalTrilogy)}</div>
                </section>
                <section className="game-selector-group">
                    <h3>Reclaimer Saga</h3>
                    <div className="game-selector-grid">{renderCards(reclaimerSaga)}</div>
                </section>
                <section className="game-selector-group">
                    <h3>Spin-offs</h3>
                    <div className="game-selector-grid">{renderCards(spinoffs)}</div>
                </section>
            </div>
        )
    }

    return (
        <div className="game-selector-scroll">
            {renderCards([...originalTrilogy, ...reclaimerSaga, ...spinoffs])}
        </div>
    )
}
