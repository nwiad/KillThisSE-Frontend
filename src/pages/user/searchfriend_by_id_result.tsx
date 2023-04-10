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
    const id = router.query.id;

    fetch(
        "api/user/search_by_id",
        {
            method: "POST",
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