import Navbar from "../components/Navbar";
import "./NotFoundPage.css";

export default function NotFoundPage() {
    return (
        <div>
            <Navbar />

            <div className="not-found-page">
                404 Page Not Found
            </div>
        </div>
    )
}