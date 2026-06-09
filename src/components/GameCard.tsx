import { useNavigate } from "react-router-dom";
import './GameCard.css'

type GameCardProps = {
    name: string;
    image: string;
    path: string;
    disabled?: boolean
}

export default function GameCard({
    name, 
    image, 
    path, 
    disabled = false}: GameCardProps) {
    const navigate = useNavigate();
    return (
        <button
            className={disabled ? 'coming-soon' : 'game-selector'}
            onClick={() => !disabled && navigate(path)}
            disabled={disabled}
        >
            <img className='game-image' src={image} alt={name} />
            <span>{name}</span>
        </button>
    )

}