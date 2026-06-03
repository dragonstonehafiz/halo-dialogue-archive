import "./Navbar.css";
import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="navbar">
            <span>Halo Dialogue Archive</span>
            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/browse">Browse</Link>
            </div>
        </nav>
    );
}