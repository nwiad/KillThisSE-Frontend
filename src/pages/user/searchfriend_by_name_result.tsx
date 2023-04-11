import { useRouter } from "next/router";
import Link from 'next/link';
import { useRef, useState } from "react";
import FriendBar from "./friendbar";

interface Item {
    user_id: number;
    name: string;
    avatar: string;
}

const InitPage = () => {
    const [friendsList, setFriendsList] = useState<Item[]>([]);
    const [friend, setFriend] = useState<number>();
    const router = useRouter();
    const name = router.query.name;

    fetch(
        "api/user/search_by_name",
        {
            method: "POST",
            credentials: 'include',
            body: JSON.stringify({
                friend_name: name,
            })
        }
    )
        .then((res) => res.json())
        .then((data) => {
            const friends = data.friends.map((friend : Item) => ({
                user_id: friend.user_id,
                name: friend.name,
                avatar: friend.avatar
            }));
            setFriendsList(friends);
        })
        .catch((err) => alert(err));
        
    const getNewFriend = () => {
        fetch(
            "api/user/send_friend_request",
            {
                method: "POST",
                credentials: 'include',
                body: JSON.stringify({
                    friend_id: friend,
                })
            }
        )
            .then((res) => res.json())
            .then((res) => {
                if (res.code === 0) {
                    alert(`成功发送请求`)
                } else {
                    throw new Error(`${res.info}`);
                }

            })
            .catch((err) => alert(err));
    };

    return (
        <div>
            <FriendBar />
            <div>
                {friendsList?.map((friend) => (
                    <div className="friend">
                        <img className="friendavatar" src={`${friend.avatar}`}></img>
                        {friend.name}
                        <button onClick={() => { setFriend(friend.user_id); getNewFriend; }}>添加好友</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InitPage;