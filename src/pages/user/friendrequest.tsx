import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FriendBar from "./friendbar";

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
            "api/user/get_friend_requests/",
            {
                method: "GET",
                credentials: "include",
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
            "api/user/respond_friend_request/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    response: respond,
                    friend_user_id: id,
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
        router.push("/user/friendindex");
    };


    return (
        <div>
            <FriendBar />
            <ul className="requests">
                {requests.map((request) => (
                    <li key = {request.user_id}  className="request">
                        <img src={`${request.avatar}`} />
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