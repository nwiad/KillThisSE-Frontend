import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FriendBar from "./friendbar";
import swal from "@sweetalert/with-react";
import Swal from "sweetalert2";

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
                    Swal.fire({
                        title: "成功发送好友请求",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#39c5bb",
                        icon: "success",
                    });
                } else {
                    throw new Error(`${res.info}`);
                }

            })
            .catch((err) => 
                Swal.fire({
                    title: "发送好友请求: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
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
                if(data.code === 0){
                    setID(data.user_id);            
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => { 
                Swal.fire({
                    title: "获取个人信息: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                });
            });
    
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
            .catch((err) => {
                Swal.fire({
                    title: "获取好友信息: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                }); router.push("/user/friend/searchfriend");});
    }, [name, router, router.query]);

    return (
        <div>
            <FriendBar />
            <div className="requests">
                <li className="request">
                    <img className="friendavatar" src={`${avatar}`} alt={""} />
                    <p >{name}</p>
                    <button className="accept" onClick={() => { setFriend(friend); getNewFriend(); }} disabled={id === friend}>添加好友</button>
                </li>
            </div>
        </div>
    );
};

export default InitPage;