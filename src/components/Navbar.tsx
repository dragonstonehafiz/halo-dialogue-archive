import "./Navbar.css";
import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="navbar">
            <span>Halo Dialogue Archive</span>
            <div className="navbar-links">
                <Link to='/search'>Search</Link>
                <Link to='/browse/halo2'>Browse</Link>
                <Link to="/about">About</Link>
                <Link to="/">Home</Link>
            </div>
        </nav>
    );
}