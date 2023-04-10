import { useRouter } from "next/router";
import Link from 'next/link';
import { useRef, useState } from "react";
import FriendBar from "./friendbar";

const InitPage = () => {
    const [friend, setFriend] = useState<string>("");
    const router = useRouter();

    return (
        <div>
            <FriendBar/>
            <div className="searchfriend" style={{ display: 'inline-block' }}>
                <input
                    className="searchfriendinput"
                    type="text"
                    value={friend}
                    onChange={(e) => setFriend(e.target.value)}
                />
                <button className="search" onClick={() => { router.push(`/user/searchfriend_by_id_result?id=${friend}`) }}>按id查找</button>
                <button className="search" onClick={() => { router.push(`/user/searchfriend_by_id_result?id=${friend}`) }}>按用户名查找</button>
            </div>
        </div>
    );
};

export default InitPage;