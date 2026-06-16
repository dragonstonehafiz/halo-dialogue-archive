import "./Navbar.css";
import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="navbar">
            <Link to="/" className="navbar-title">Halo Dialogue Archive</Link>
            <div className="navbar-links">
                <Link to='/search'>Search</Link>
                <Link to='/browse/halo2'>Browse</Link>
                <Link to="/about">About</Link>
            </div>
        </nav>
    );
}