import { useRouter } from "next/router";
import FriendBar from "./friendbar";
import { useEffect, useState } from "react";

const InitPage = () => {
    
    const router = useRouter();
    const id = router.query.id;
    const [chatID, setChatID] = useState<number>(-1);

    useEffect(() => {
        console.log(chatID);
    }, []);

    const sendDelete = async () => {
        await fetch(
            "/api/user/del_friend/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    friend_user_id: id,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    alert("成功");
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
        router.push("/user/friend/friendindex");
    };

    const startChat = async () => {
        await fetch(
            "/api/user/get_or_create_private_conversation/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    friend: id,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if(data.code === 0) {
                    console.log("成功发起会话");
                    setChatID(data.conversation_id);
                }
                else{
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
    };

    useEffect(() => {
        if(chatID > 0) {
            router.push(`/user/msg/chat?id=${chatID}`);
        }
    }, [chatID, router]);

    return (
        <div>
            <FriendBar />
            <div style={{ display: "flex", flexDirection: "column" }}>
                <button className="deleteFriend" onClick={() => {sendDelete();}}>
                    删除此好友
                </button>
                <button className="deleteFriend" style={{backgroundColor: "blue"}} onClick={() => {startChat();}}>
                    发消息
                </button>
            </div>
        </div>
    );
};

export default InitPage;