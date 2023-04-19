import { useRouter } from "next/router";
import { useState } from "react";
import FriendBar from "./friendbar";

const InitPage = () => {
    const [friend, setFriend] = useState<number>();
    const [id, setID] = useState<number>();
    const [avatar, setAvatar] = useState<string>("");    
    const router = useRouter();
    const name = router.query.name;

    const getNewFriend = () => {
        fetch(
            "/api/user/send_friend_request/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    friend_user_id: friend,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => {return res.json();})
            .then((res) => {
                if (res.code === 0) {
                    alert("成功发送请求");
                } else {
                    throw new Error(`${res.info}`);
                }

            })
            .catch((err) => alert(err));
    };

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
            if(data.code === 0){
                setID(data.user_id);            
            } else {
                throw new Error(`${data.info}`);
            }
        })
        .catch((err) => {alert(err); });

    fetch(
        "/api/user/search_by_name/",
        {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                friend_name: name,
                token: localStorage.getItem("token")
            })
        }
    )
        .then((res) => res.json())
        .then((data) => {
            if(data.code === 0){
                setFriend(data.user_id);
                setAvatar(data.avatar);
            
            } else {
                throw new Error(`${data.info}`);
            }
        })
        .catch((err) => {alert(err); router.push("/user/searchfriend");});
        

    return (
        <div>
            <FriendBar />
            <div>
                <div className="friend">
                    <img className="friendavatar" src={`${avatar}`} style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        backgroundImage: `url(${avatar})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        border: "2px solid #ccc",
                        margin: "50px auto",
                    }}></img>
                    <p>{name}</p>
                    <p>id:{friend}</p>
                    <button onClick={() => { setFriend(friend); getNewFriend(); }} disabled={id === friend}>添加好友</button>
                </div>
            </div>
        </div>
    );
};

export default InitPage;