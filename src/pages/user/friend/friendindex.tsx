import { useRouter } from "next/router";
import FriendBar from "./friendbar";

const InitPage = () => {
    
    const router = useRouter();
    
    return (
        <div>
            <FriendBar />
        </div>
    );
};

export default InitPage;