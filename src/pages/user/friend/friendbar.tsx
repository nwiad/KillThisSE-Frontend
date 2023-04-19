import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../navbar";

interface Friend {
    user_id: number;
    name: string;
    avatar: string;
}

const FriendBar = () => {
    const [friendsList, setFriendsList] = useState([]);

    const router = useRouter();
    useEffect(() => {
        fetch(
            "/api/user/get_friends/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => {return res.json();})
            .then((data) => {
                if (data.code === 0) {
                    const friends = data.friends.map((friend: Friend) => ({
                        user_id: friend.user_id,
                        name: friend.name,
                        avatar: friend.avatar
                    }));
                    setFriendsList(friends);
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
    },[]);

    return (
        <div style={{ padding: 12 }}>
            <Navbar />
            <div>
                <ul className="friendlist">
                    <li className="newfriend"
                        onClick={() => { router.push("/user/friend/searchfriend"); }}
                        style={{ padding: 20 }}>
                        + 添加新好友
                    </li>
                    <li className="newfriend"
                        onClick={() => { router.push("/user/friend/friendrequest"); }}
                        style={{ padding: 20 }}>
                        收到的好友邀请
                    </li>
                    {friendsList?.map((item: Friend) => (
                        <li key={item.user_id} className="friend" onClick={() => { router.push(`/user/friend/friendinfo?id=${item.user_id}`); }}>
                            <img className="friendavatar" src={`${item.avatar}`}></img>
                            <p>{item.name}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FriendBar;