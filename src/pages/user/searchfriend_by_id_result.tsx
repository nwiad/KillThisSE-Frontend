import { useRouter } from "next/router";
import Link from 'next/link';
import { useRef, useState } from "react";
import FriendBar from "./friendbar";

interface Item {
    id: number;
    name: string;
    avatar: string;
}

const InitPage = () => {
    const [list, setList] = useState<Item[]>([]);
    const [friend, setFriend] = useState<number>();
    const router = useRouter();
    const cookie = router.query.cookie;
    const id = router.query.id;

    if (typeof cookie === 'string') {
        document.cookie = cookie;
    } else {
        alert("Cookie not found");
    }

    fetch(
        "api/user/search_by_id",
        {
            method: "GET",
            credentials: 'include',
            body: JSON.stringify({
                friend_user_id: id,
            })
        }
    )
        .then((res) => res.json())
        .then((data) => {
            setList(data.list)
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
                if (res.code == 200) {
                    alert(`成功添加好友`)
                } else {
                    throw new Error(`${res.info}`);
                }

            })
            .catch((err) => alert(err));
    };

    return (
        <div>
            <FriendBar cookie={cookie} />
            <div>
                {list.map((item: Item) => (
                    <div className="friend">
                        <img className="friendavatar" src={`${item.avatar}`}></img>
                        {item.name}
                        <button onClick={() => { setFriend(item.id); getNewFriend; }}>添加好友</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InitPage;