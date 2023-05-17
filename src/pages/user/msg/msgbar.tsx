import { faBellSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { ChatMetaData, GroupChatMetaData, Options } from "../../../utils/type";
import { Socket, suffix } from "../../../utils/websocket";
import Navbar from "../navbar";


const MsgBar = () => {
    const [stickedPrivate, setStickedPrivate] = useState<ChatMetaData[]>();
    const [stickedGroup, setStickedGroup] = useState<GroupChatMetaData[]>();
    const [chatList, setChatList] = useState<ChatMetaData[]>();
    const [groupChatList, setGroupChatList] = useState<GroupChatMetaData[]>();
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [myID, setMyID] = useState<number>();

    const [chatInfo, setChatInfo] = useState<string[]>();

    const router = useRouter();
    const query = router.query;

    const sockets = useRef<Socket[]>([]);

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
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
                    setMyID(data.user_id);
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
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
        if (typeof chatList === "undefined" || typeof groupChatList === "undefined" || typeof stickedPrivate === "undefined" || typeof stickedGroup === "undefined") {
            console.log("列表不存在");
            return;
        }
        if (myID === undefined) {
            return;
        }
        setChatInfo(Array(chatList.length + groupChatList.length + stickedPrivate.length + stickedGroup.length).fill(""));
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

        stickedPrivate.forEach((chat) => {
            console.log("sticked private");
            options.url = suffix + `${chat.id}/${myID}/`;
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
                    if(JSON.parse(event.data).messages[index - 1].is_transmit === true) {
                        newArray[chat.id] = "合并转发消息";
                    }
                    else{
                        newArray[chat.id] = JSON.parse(event.data).messages[index - 1].msg_body;
                    }
                    return newArray;
                });
                fetch(
                    "/api/user/get_unread_messages/",
                    {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify({
                            token: localStorage.getItem("token"),
                            conversation: chat.id
                        })
                    }
                )
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.code === 0) {
                            const unread = data.UnreadMessages;
                            const target = document.getElementById(`chat${chat.id}`);
                            if (target === null) {
                                return;
                            }
                            target.innerHTML = unread;
                        }
                    })
                    .catch((err) => alert(err));
            });
            sockets.current.push(socket);
        });

        stickedGroup.forEach((chat) => {
            console.log("private");
            options.url = suffix + `${chat.id}/${myID}/`;
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
                    if(JSON.parse(event.data).messages[index - 1].is_transmit === true) {
                        newArray[chat.id] = "合并转发消息";
                    }
                    else{
                        newArray[chat.id] = JSON.parse(event.data).messages[index - 1].msg_body;
                    }
                    return newArray;
                });
                fetch(
                    "/api/user/get_unread_messages/",
                    {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify({
                            token: localStorage.getItem("token"),
                            conversation: chat.id
                        })
                    }
                )
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.code === 0) {
                            const unread = data.UnreadMessages;
                            const target = document.getElementById(`chat${chat.id}`);
                            if (target === null) {
                                return;
                            }
                            target.innerHTML = unread;
                        }
                    })
                    .catch((err) => alert(err));
            });
            sockets.current.push(socket);
        });

        chatList.forEach((chat) => {
            console.log("private");
            options.url = suffix + `${chat.id}/${myID}/`;
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
                    if(JSON.parse(event.data).messages[index - 1].is_transmit === true) {
                        newArray[chat.id] = "合并转发消息";
                    }
                    else{
                        newArray[chat.id] = JSON.parse(event.data).messages[index - 1].msg_body;
                    }
                    return newArray;
                });
                fetch(
                    "/api/user/get_unread_messages/",
                    {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify({
                            token: localStorage.getItem("token"),
                            conversation: chat.id
                        })
                    }
                )
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.code === 0) {
                            const unread = data.UnreadMessages;
                            const target = document.getElementById(`chat${chat.id}`);
                            if (target === null) {
                                return;
                            }
                            target.innerHTML = unread;
                        }
                    })
                    .catch((err) => alert(err));
            });
            sockets.current.push(socket);
        });

        groupChatList.forEach((chat) => {
            console.log("group");
            // options.url = `wss://2023-im-backend-killthisse.app.secoder.net/ws/chat/${chat.id}/`;
            // options.url = `ws://localhost:8000/ws/chat/${chat.id}/`;
            options.url = suffix + `${chat.id}/${myID}/`;
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
                    if(JSON.parse(event.data).messages[index - 1].is_transmit === true) {
                        newArray[chat.id] = "合并转发消息";
                    }
                    else{
                        newArray[chat.id] = JSON.parse(event.data).messages[index - 1].msg_body;
                    }
                    return newArray;
                });
                fetch(
                    "/api/user/get_unread_messages/",
                    {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify({
                            token: localStorage.getItem("token"),
                            conversation: chat.id
                        })
                    }
                )
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.code === 0) {
                            const unread = data.UnreadMessages;
                            const target = document.getElementById(`chat${chat.id}`);
                            if (target === null) {
                                return;
                            }
                            target.innerHTML = unread;
                        }
                    })
                    .catch((err) => alert(err));
            });
            sockets.current.push(socket);
        });

        return cleanUp;
    }, [chatList, groupChatList, stickedPrivate, stickedGroup, myID]);

    const fetchList = async () => {
        setRefreshing(true);
        await fetch(
            "/api/user/get_sticky_private_conversations/",
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
                    console.log("获取置顶私聊成功");
                    setStickedPrivate(data.conversations.map((val: any) => ({ ...val })));
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
        await fetch(
            "/api/user/get_sticky_group_conversations/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    console.log("获取置顶群聊成功");
                    setStickedGroup(data.conversations.map((val: any) => ({ ...val })));
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
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
                if (data.code === 0) {
                    console.log("获取私聊消息列表成功");
                    // console.log(data);
                    setChatList(data.conversations.map((val: any) => ({ ...val })));
                }
                else {
                    throw new Error(`${data.info}`);
                }
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
                if (data.code === 0) {
                    console.log("获取群聊消息列表成功");
                    // console.log(data);
                    setGroupChatList(data.conversations.map((val: any) => ({ ...val })));
                    setRefreshing(false);
                }
                else {
                    throw new Error(`${data.info}`);
                }
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
            {chatList!.length + groupChatList!.length + stickedPrivate!.length + stickedGroup!.length === 0 ? (
                <ul className="friendlist" style={{ color: "white", textAlign: "center" }}> 当前没有会话 </ul>
            ) : (
                <ul className="friendlist">
                    {stickedPrivate!.map((chat) => (
                        (!chat.disabled && <li key={chat.id} style={{ display: "flex", flexDirection: "row", backgroundColor:"#434343" }} onClick={() => { router.push(`/user/msg/chat?id=${chat.id}&name=${chat.friend_name}&group=0&sticked=${chat.sticked ? 1 : 0}&silent=${chat.silent ? 1 : 0}&validation=${chat.validation ? 1 : 0}`); }}>
                            <img src={`${chat.friend_avatar}`} alt="oops" />
                            <div className="msginfopv" >
                                <div className="senderpv">{chat.friend_name.length > 6 ? `${chat.friend_name.slice(0, 6)}...` : chat.friend_name}</div>
                                <div className="msgpv">{chatInfo && chatInfo[chat.id] ? (chatInfo[chat.id].length > 10 ? `${chatInfo[chat.id].slice(0, 10)}...` : chatInfo[chat.id]) : ""}</div>
                            </div>
                            {chat.silent ? (
                                <div className="silentcount" id={`silent_chat${chat.id}`}>
                                    <FontAwesomeIcon style={{ color: "white" }} className="silenticon" icon={faBellSlash} />
                                </div>
                            ) : (
                                <div className="count" id={`chat${chat.id}`}>0</div>
                            )}
                        </li>)
                    ))}
                    {stickedGroup!.map((chat) => (
                        (!chat.disabled && <li key={chat.id} style={{ display: "flex", flexDirection: "row", backgroundColor:"#434343" }} onClick={() => router.push(`/user/msg/chat?id=${chat.id}&name=${chat.name}&group=1&sticked=${chat.sticked ? 1 : 0}&silent=${chat.silent ? 1 : 0}&validation=${chat.validation ? 1 : 0}`)}>
                            <img src={`${chat.avatar}`} alt="oops" />
                            <div className="msginfopv" >
                                <div className="senderpv">{chat.name.length > 6 ? `${chat.name.slice(0, 6)}...` : chat.name}</div>
                                <div className="msgpv">{chatInfo && chatInfo[chat.id] ? (chatInfo[chat.id].length > 10 ? `${chatInfo[chat.id].slice(0, 10)}...` : chatInfo[chat.id]) : ""}</div>
                            </div>
                            {chat.silent ? (
                                <div className="silentcount" id={`silent_chat${chat.id}`}>
                                    <FontAwesomeIcon style={{ color: "white" }} className="silenticon" icon={faBellSlash} />
                                </div>
                            ) : (
                                <div className="count" id={`chat${chat.id}`}>0</div>
                            )}
                        </li>)
                    ))}
                    {chatList!.map((chat) => (
                        (!chat.disabled && <li key={chat.id} style={{ display: "flex", flexDirection: "row" }} onClick={() => { router.push(`/user/msg/chat?id=${chat.id}&name=${chat.friend_name}&group=0&sticked=${chat.sticked ? 1 : 0}&silent=${chat.silent ? 1 : 0}&validation=${chat.validation ? 1 : 0}`); }}>
                            <img src={`${chat.friend_avatar}`} alt="oops" />
                            <div className="msginfopv" >
                                <div className="senderpv">{chat.friend_name.length > 6 ? `${chat.friend_name.slice(0, 6)}...` : chat.friend_name}</div>
                                <div className="msgpv">{chatInfo && chatInfo[chat.id] ? (chatInfo[chat.id].length > 10 ? `${chatInfo[chat.id].slice(0, 10)}...` : chatInfo[chat.id]) : ""}</div>
                            </div>
                            {chat.silent ? (
                                <div className="silentcount" id={`silent_chat${chat.id}`}>
                                    <FontAwesomeIcon style={{ color: "white" }} className="silenticon" icon={faBellSlash} />
                                </div>
                            ) : (
                                <div className="count" id={`chat${chat.id}`}>0</div>
                            )}
                        </li>)
                    ))}
                    {groupChatList!.map((chat) => (
                        (!chat.disabled &&<li key={chat.id} style={{ display: "flex", flexDirection: "row" }} onClick={() => router.push(`/user/msg/chat?id=${chat.id}&name=${chat.name}&group=1&sticked=${chat.sticked ? 1 : 0}&silent=${chat.silent ? 1 : 0}&validation=${chat.validation ? 1 : 0}`)}>
                            <img src={`${chat.avatar}`} alt="oops" />
                            <div className="msginfopv" >
                                <div className="senderpv">{chat.name.length > 6 ? `${chat.name.slice(0, 6)}...` : chat.name}</div>
                                <div className="msgpv">{chatInfo && chatInfo[chat.id] ? (chatInfo[chat.id].length > 10 ? `${chatInfo[chat.id].slice(0, 10)}...` : chatInfo[chat.id]) : ""}</div>
                            </div>
                            {chat.silent ? (
                                <div className="silentcount" id={`silent_chat${chat.id}`}>
                                    <FontAwesomeIcon style={{ color: "white" }} className="silenticon" icon={faBellSlash} />
                                </div>
                            ) : (
                                <div className="count" id={`chat${chat.id}`}>0</div>
                            )}
                        </li>)
                    ))}
                </ul>
            )}

        </div>
    );
};

export default MsgBar;