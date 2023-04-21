import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FriendBar from "./friendbar";
import Image from "next/image";

interface FriendRequest {
    user_id: number;
    name: string;
    avatar: string;
}

const InitPage = () => {
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [respond, setRespond] = useState<string>("");
    const [friend, setFriend] = useState<number>();


    const router = useRouter();
    useEffect(() => {
        fetch(
            "/api/user/get_friend_requests/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    setRequests(data.requests); // 更新 requests 状态
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
    },[]);

    const sendRespond = async (id:number, respond:string) => {
        await fetch(
            "/api/user/respond_friend_request/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    response: respond,
                    friend_user_id: id,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
        router.push("/user/friend/friendindex");
    };


    return (
        <div>
            <FriendBar />
            <ul className="requests">
                {requests.map((request) => (
                    <li key = {request.user_id}  className="request">
                        <Image src={`${request.avatar}`} alt={"https://github.com/LTNSXD/LTNSXD.github.io/blob/main/img/favicon.jpg?raw=true"} />
                        <p>{request.name}</p>
                        <p>id:{request.user_id}</p>
                        <button className="reject" onClick={() => { sendRespond(request.user_id,"reject"); }}> 拒绝 </button>
                        <button className="accept" onClick={() => { sendRespond(request.user_id,"accept"); }}> 同意 </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InitPage;