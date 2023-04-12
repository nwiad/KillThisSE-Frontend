import { useRouter } from "next/router";
import { useState } from "react";
import FriendBar from "./friendbar";

const InitPage = () => {
    const [friend, setFriend] = useState<number>();
    const [avatar, setAvatar] = useState<string>("");    
    const router = useRouter();
    const id = router.query.id;

    const getNewFriend = () => {
        fetch(
            "api/user/send_friend_request",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    friend_user_id: id,
                })
            }
        )
            .then((res) => res.json())
            .then((res) => {
                if (res.code === 0) {
                    alert("成功发送请求");
                } else {
                    throw new Error("${res.code}");
                }

            })
            .catch((err) => alert(err));
    };


    fetch(
        "api/user/search_by_id",
        {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                friend_user_id: id,
            })
        }
    )
        .then((res) => res.json())
        .then((data) => {
            if(data.code === 0){
                setFriend(data.name);
                setAvatar(data.avatar);
            } else {
                throw new Error("${data.info}");
            }
        })
        .catch((err) => {alert(err); 
            router.push("/user/searchfriend");});
        
        return (
            <div>
                <FriendBar />
                <div>
                    <div className="friend">
                        <img className="friendavatar" src={"${avatar}"} style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            backgroundImage: "url(${avatar})",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            border: "2px solid #ccc",
                            margin: "50px auto",
                        }}></img>
                        <p>{friend}</p>
                        <button onClick={() => {getNewFriend(); }}>添加好友</button>
                    </div>
                </div>
            </div>
        );
};

export default InitPage;