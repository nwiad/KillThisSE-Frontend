import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { ChatMetaData, GroupChatMetaData, Options } from "../../../utils/type";
import { Socket, suffix } from "../../../utils/websocket";
import Navbar from "../navbar";

const MsgBar = () => {
    const [chatList, setChatList] = useState<ChatMetaData[]>();
    const [groupChatList, setGroupChatList] = useState<GroupChatMetaData[]>();
    const [refreshing, setRefreshing] = useState<boolean>(true);

    const [chatInfo, setChatInfo] = useState<string[]>();

    const router = useRouter();
    const query = router.query;

    const sockets = useRef<Socket[]>([]);

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        fetchList();
    }, [router, query]);

    const cleanUp = () => {
        sockets.current.forEach((socket) => {
            socket.destroy();
            console.log("回收列表连接");
        });
    };

    useEffect(() => {
        console.log("私聊: ", chatList);
        console.log("群聊: ", groupChatList);
        if (typeof chatList === "undefined" || typeof groupChatList === "undefined") {
            console.log("列表不存在");
            return;
        }
        setChatInfo(Array(chatList.length + groupChatList.length).fill(""));
        const options: Options = {
            url: "",
            heartTime: 5000, // 心跳时间间隔
            heartMsg: JSON.stringify({ message: "heartbeat", token: localStorage.getItem("token"), heartbeat: true }),
            isReconnect: true, // 是否自动重连
            isDestroy: false, // 是否销毁
            reconnectTime: 5000, // 重连时间间隔
            reconnectCount: -1, // 重连次数 -1 则不限制
            openCb: () => { }, // 连接成功的回调
            closeCb: () => { }, // 关闭的回调
            messageCb: (event: MessageEvent) => {

            }, // 消息的回调
            errorCb: () => { } // 错误的回调
        };

        chatList.forEach((chat) => {
            console.log("private");
            options.url = suffix+`${chat.id}/`;
            const socket = new Socket(options);
            socket.onmessage((event: MessageEvent) => {
                console.log("new private msg");
                setChatInfo((array) => {
                    if (array === undefined) {
                        return [];
                    }
                    let newArray = [...array];
                    const index = JSON.parse(event.data).messages.length;
                    if (index === 0) {
                        return [];
                    }
                    newArray[chat.id] = JSON.parse(event.data).messages[index - 1].msg_body;
                    return newArray;
                });
            });
            sockets.current.push(socket);
        });

        groupChatList.forEach((chat) => {
            console.log("group");
            // options.url = `wss://2023-im-backend-killthisse.app.secoder.net/ws/chat/${chat.id}/`;
            // options.url = `ws://localhost:8000/ws/chat/${chat.id}/`;
            options.url = suffix+`${chat.id}/`;
            const socket = new Socket(options);
            socket.onmessage((event: MessageEvent) => {
                setChatInfo((array) => {
                    if (array === undefined) {
                        return [];
                    }
                    let newArray = [...array];
                    const index = JSON.parse(event.data).messages.length;
                    if (index === 0) {
                        return [];
                    }
                    newArray[chat.id] = JSON.parse(event.data).messages[index - 1].msg_body;
                    return newArray;
                });
            });
            sockets.current.push(socket);
        });

        return cleanUp;
    }, [chatList, groupChatList]);

    const fetchList = async () => {
        setRefreshing(true);
        await fetch(
            "/api/user/get_private_conversations/",
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
                console.log("获取私聊消息列表成功");
                // console.log(data);
                setChatList(data.conversations.map((val: any) => ({ ...val })));
            })
            .catch((err) => {
                alert(err);
                setRefreshing(false);
            });

        await fetch(
            "/api/user/get_group_conversations/",
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
                console.log("获取群聊消息列表成功");
                // console.log(data);
                setGroupChatList(data.conversations.map((val: any) => ({ ...val })));
                setRefreshing(false);
            })
            .catch((err) => {
                alert(err);
                setRefreshing(false);
            });
    };

    return refreshing ? (
        <p> Loading... </p>
    ) : (
        <div style={{ padding: 12 }}>
            <Navbar />
            {chatList!.length + groupChatList!.length === 0 ? (
                <ul className="friendlist" style={{color: "white", textAlign: "center"}}> 当前没有会话 </ul>
            ) : (
                <ul className="friendlist">
                    {chatList!.map((chat) => (
                        <li key={chat.id} style={{ display: "flex", flexDirection: "row" }} onClick={() => router.push(`/user/msg/chat?id=${chat.id}&name=${chat.friend_name}&group=0`)}>
                            <img src={`${chat.friend_avatar}`} alt="oops" />
                            <div className="msginfopv">
                                <div className="senderpv">{chat.friend_name.length > 6 ?`${chat.friend_name.slice(0,6)}...` : chat.friend_name}</div>
                                <div className="msgpv">{chatInfo&&chatInfo[chat.id] ? (chatInfo[chat.id].length > 10 ? `${chatInfo[chat.id].slice(0, 10)}...` : chatInfo[chat.id]) : "nope"}</div>
                            </div>
                        </li>
                    ))}
                    {groupChatList!.map((chat) => (
                        <li key={chat.id} style={{ display: "flex", flexDirection: "row" }} onClick={() => router.push(`/user/msg/chat?id=${chat.id}&name=${chat.name}&group=1`)}>
                            <img src={`${chat.avatar}`} alt="oops" />
                            <div className="msginfopv">
                                <div className="senderpv">{chat.name.length > 6 ? `${chat.name.slice(0,6)}...` : chat.name}</div>
                                <div className="msgpv">{chatInfo&&chatInfo[chat.id] ? (chatInfo[chat.id].length > 10 ? `${chatInfo[chat.id].slice(0, 10)}...` : chatInfo[chat.id]) : "nope"}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

        </div>
    );
};

export default MsgBar;