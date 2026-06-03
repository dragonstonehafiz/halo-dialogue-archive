import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"


export default function BrowsePage() {
    const { game } = useParams();
    return (
        <div>
            <Navbar />

            <div className="browse-page-div">
                <div className="browse-page-directory">
                    {game}
                </div>

                <div className="browse-page-contents">

                </div>
            </div>
        </div>
    )
}