import { useRouter } from "next/router";
import Link from "next/link";
import { useRef, useState } from "react";
import FriendBar from "./friendbar";

const InitPage = () => {
    
    const router = useRouter();
    const id = router.query.id;

    const sendDelete = async () => {
        await fetch(
            "api/user/del_friend",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    friend_user_id: id,
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
        router.push("/user/friendindex");
    };

    return (
        <div>
            <FriendBar />
            <button className="deleteFriend" onClick={() => {sendDelete();}}>
                    删除此好友
            </button>
        </div>
    );
};

export default InitPage;