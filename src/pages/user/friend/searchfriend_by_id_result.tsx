import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FriendBar from "./friendbar";

const InitPage = () => {
    const [friend, setFriend] = useState<number>();
    const [avatar, setAvatar] = useState<string>("");
    const [myID, setID] = useState<number>();
    const router = useRouter();
    const id = Number(router.query.id);

    const getNewFriend = () => {
        fetch(
            "/api/user/send_friend_request/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    friend_user_id: id,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => res.json())
            .then((res) => {
                if (res.code === 0) {
                    alert("成功发送请求");
                } else {
                    throw new Error(`${res.info}`);
                }

            })
            .catch((err) => alert(err));
    };

    useEffect(() => {
        fetch(
            "/api/user/get_profile/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    setID(data.user_id);
                    console.log("myID: " + data.user_id);
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => { alert(err); });

        fetch(
            "/api/user/search_by_id/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    friend_user_id: id,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    setFriend(data.name);
                    setAvatar(data.avatar);
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => {
                alert(err);
                router.push("/user/friend/searchfriend");
            });
    }, [id, router, router.query]);

    return (
        <div>
            <FriendBar />
            <div className="requests">
                <li className="request">
                    <img className="friendavatar" src={`${avatar}`} alt={"https://github.com/LTNSXD/LTNSXD.github.io/blob/main/img/favicon.jpg?raw=true"} />
                    <p>{friend}</p>
                    <button className="accept" onClick={() => { getNewFriend(); }} disabled={id === myID}>添加好友</button>
                </li>
            </div>
        </div>
    );
};

export default InitPage;