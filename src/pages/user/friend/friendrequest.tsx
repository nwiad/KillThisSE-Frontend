import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Socket, suffix } from "../../../utils/websocket";
import FriendBar from "./friendbar";
import swal from "@sweetalert/with-react";

interface FriendRequest {
    user_id: number;
    name: string;
    avatar: string;
}

const InitPage = () => {
    const [requests, setRequests] = useState<FriendRequest[]>();
    const [myID, setMyID] = useState<number>();
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const socket = useRef<Socket>();

    const router = useRouter();

    const cleanUp = () => {
        console.log("到底有没有卸载");
        socket.current?.destroy();
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
                if(data.code === 0) {
                    setMyID(data.user_id);
                }
            })
            .catch((err) => swal("获取个人信息:" + err));
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
            .catch((err) => swal("获取好友请求:" + err));
        return cleanUp;
    },[]);

    const startChat = async (friend_id: number) => {
        await fetch(
            "/api/user/search_friend_by_id",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    friend_id: friend_id
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if(data.code === 0) {
                    const name = data.name;
                    fetch(
                        "/api/user/get_or_create_private_conversation/",
                        {
                            method: "POST",
                            credentials: "include",
                            body: JSON.stringify({
                                friend: friend_id,
                                token: localStorage.getItem("token")
                            })
                        }
                    )
                        .then((res) => res.json())
                        .then((_data) => {
                            if (_data.code === 0) {
                                const chatID = _data.conversation_id;
                                console.log("成功发起会话");
                                socket.current = new Socket(
                                    {
                                        url: suffix + `${chatID}/${myID}/`,
                                        heartTime: 5000, // 心跳时间间隔
                                        heartMsg: JSON.stringify({ message: "heartbeat", token: localStorage.getItem("token"), heartbeat: true }),
                                        sayHi: true,
                                        isReconnect: true, // 是否自动重连
                                        isDestroy: false, // 是否销毁
                                        reconnectTime: 5000, // 重连时间间隔
                                        reconnectCount: -1, // 重连次数 -1 则不限制
                                        openCb: () => { }, // 连接成功的回调
                                        closeCb: () => { }, // 关闭的回调
                                        messageCb: (event: MessageEvent) =>{ }, // 消息的回调
                                        errorCb: () => { } // 错误的回调
                                    }
                                );
                                router.push(`/user/msg/chat?id=${chatID}&name=${name}&group=0&sticked=0&silent=0&validation=0`);
                            }
                            else {
                                throw new Error(`${data.info}`);
                            }
                        })
                        .catch((err) => swal("通过id搜索好友:" + err));
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => swal(err));
    };

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
            .catch((err) => swal("回应好友请求: " + err));
        // if(respond === "accept") {
        //     startChat(id);            
        // }
        // else {
        //     router.push("/user/friend/friendindex");
        // }
        router.push("/user/friend/friendindex");
    };

    useEffect(() => {
        if(requests !== undefined && myID !== undefined) {
            setRefreshing(false);
        }
    }, [requests, myID]);

    return refreshing ? (
        <div>正在加载好友请求</div>
    ) : (
        <div>
            <FriendBar />
            <ul className="requests">
                {requests!.map((request) => (
                    <li key = {request.user_id}  className="request">
                        <img src={`${request.avatar}`} alt={""} />
                        <p>{request.name}</p>
                        <button className="reject" onClick={() => { sendRespond(request.user_id,"reject"); }}> 拒绝 </button>
                        <button className="accept" onClick={() => { sendRespond(request.user_id,"accept"); }}> 同意 </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InitPage;