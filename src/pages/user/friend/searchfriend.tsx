import { useRouter } from "next/router";
import { useState } from "react";
import FriendBar from "./friendbar";
import swal from "@sweetalert/with-react";

const InitPage = () => {
    const [friend, setFriend] = useState<string>("");
    const router = useRouter();

    return (
        <div>
            <FriendBar/>
            <div className="searchfriend" style={{ display: "inline-block" }}>
                <input
                    className="searchfriendinput"
                    type="text"
                    value={friend}
                    onChange={(e) => setFriend(e.target.value)}
                />
                <button className="search" onClick={() => {if(isNaN(Number(friend)) || friend.length >= 10) {swal("非法id");} else{router.push(`/user/friend/searchfriend_by_id_result?id=${friend}`);} }}>按id查找</button>
                <button className="search" onClick={() => { router.push(`/user/friend/searchfriend_by_name_result?name=${friend}`); }}>按用户名查找</button>
            </div>
        </div>
    );
};

export default InitPage;