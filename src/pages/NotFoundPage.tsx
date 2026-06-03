import "./NotFoundPage.css";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <div className="not-found-page">
            404 Page Not Found
            <Link to="/">Home</Link>
        </div>
    )
}