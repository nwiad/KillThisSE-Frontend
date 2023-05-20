import { faBellSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { ChatMetaData, GroupChatMetaData, Options } from "../../../utils/type";
import { Socket, suffix } from "../../../utils/websocket";
import Navbar from "../navbar";

interface MsgBarProps {
    currentChatID?: number
}

const MsgBar = (props: MsgBarProps) => {
    const [stickedPrivate, setStickedPrivate] = useState<ChatMetaData[]>();
    const [stickedGroup, setStickedGroup] = useState<GroupChatMetaData[]>();
    const [chatList, setChatList] = useState<ChatMetaData[]>();
    const [currentChat, setCurrentChat] = useState<ChatMetaData>();
    const [currentGroupChat, setCurrentGroupChat] = useState<GroupChatMetaData>();
    const [groupChatList, setGroupChatList] = useState<GroupChatMetaData[]>();
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [myID, setMyID] = useState<number>();
    const [showPopupValidFriend, setShowPopupValidFriend] = useState<boolean>(false);
    const [showPopupValidGroup, setShowPopupValidGroup] = useState<boolean>(false);
    const [pwd, setPwd] = useState<string>("");

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
            .catch((err) => alert("获取个人信息: " + err));
        fetchList();
    }, [router, query]);

    const cleanUp = () => {
        sockets.current.forEach((socket) => {
            socket.destroy();
            console.log("回收列表连接");
        });
    };

    const checkPwdFriend = (password: string) => {
        fetch(
            "/api/user/secondary_validate/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    password: password
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    router.push(`/user/msg/chat?id=${currentChat?.id}&name=${currentChat?.friend_name}&group=0&sticked=${currentChat?.sticked ? 1 : 0}&silent=${currentChat?.silent ? 1 : 0}&validation=${currentChat?.validation ? 1 : 0}`);
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert("检查二级密码: " + err));
    };

    const checkPwdGroup = (password: string) => {
        fetch(
            "/api/user/secondary_validate/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    password: password
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    router.push(`/user/msg/chat?id=${currentGroupChat?.id}&name=${currentGroupChat?.name}&group=1&sticked=${currentGroupChat?.sticked ? 1 : 0}&silent=${currentGroupChat?.silent ? 1 : 0}&validation=${currentGroupChat?.validation ? 1 : 0}`);
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert("检查二级密码: " + err));
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
                const target = document.getElementById(`info${chat.id}`);
                if (target === null) {
                    return;
                }
                const data = JSON.parse(event.data);
                const msg_len = data.len_of_msgs;
                const last_msg = JSON.parse(event.data).last_msg;
                if (msg_len === 0) {
                    target.innerHTML = "";
                }
                else {
                    if (last_msg.is_transmit === true) {
                        target.innerHTML = "[合并转发消息]";
                    }
                    else if (last_msg.is_audio === true) {
                        target.innerHTML = "[语音消息]";
                    }
                    else if (last_msg.is_image === true) {
                        target.innerHTML = "[图片消息]";
                    }
                    else if (last_msg.is_video === true) {
                        target.innerHTML = "[视频消息]";
                    }
                    else if (last_msg.is_file === true) {
                        target.innerHTML = "[文件消息]";
                    }
                    else {
                        target.innerHTML = last_msg.msg_body.length > 10 ? last_msg.msg_body.slice(0, 10) + "......" : last_msg.msg_body;
                    }
                }
                const unread = data.unread_msgs;
                const unreadTarget = document.getElementById(`chat${chat.id}`);
                if (unreadTarget === null) {
                    return;
                }
                unreadTarget.innerHTML = (props.currentChatID === chat.id) ? 0 : unread;
            });
            sockets.current.push(socket);
        });

        stickedGroup.forEach((chat) => {
            console.log("private");
            options.url = suffix + `${chat.id}/${myID}/`;
            const socket = new Socket(options);
            socket.onmessage((event: MessageEvent) => {
                const target = document.getElementById(`info${chat.id}`);
                if (target === null) {
                    return;
                }
                const data = JSON.parse(event.data);
                const msg_len = data.len_of_msgs;
                const last_msg = JSON.parse(event.data).last_msg;
                const prefix = (data.mentioned === true) ? "[有人@我] " : "";
                if (msg_len === 0) {
                    target.innerHTML = "";
                }
                else {
                    if (last_msg.is_transmit === true) {
                        target.innerHTML = prefix + "[合并转发消息]";
                    }
                    else if (last_msg.is_audio === true) {
                        target.innerHTML = prefix + "[语音消息]";
                    }
                    else if (last_msg.is_image === true) {
                        target.innerHTML = prefix + "[图片消息]";
                    }
                    else if (last_msg.is_video === true) {
                        target.innerHTML = prefix + "[视频消息]";
                    }
                    else if (last_msg.is_file === true) {
                        target.innerHTML = prefix + "[文件消息]";
                    }
                    else {
                        target.innerHTML = last_msg.msg_body.length > 10 ? prefix + last_msg.msg_body.slice(0, 10) + "......" : prefix + last_msg.msg_body;
                    }
                }
                const unread = data.unread_msgs;
                const unreadTarget = document.getElementById(`chat${chat.id}`);
                if (unreadTarget === null) {
                    return;
                }
                unreadTarget.innerHTML = (props.currentChatID === chat.id) ? 0 : unread;
            });
            sockets.current.push(socket);
        });

        chatList.forEach((chat) => {
            console.log("private");
            options.url = suffix + `${chat.id}/${myID}/`;
            const socket = new Socket(options);
            socket.onmessage((event: MessageEvent) => {
                const target = document.getElementById(`info${chat.id}`);
                if (target === null) {
                    return;
                }
                const data = JSON.parse(event.data);
                const msg_len = data.len_of_msgs;
                const last_msg = JSON.parse(event.data).last_msg;
                const prefix = (data.mentioned === true) ? "[有人@你] " : "";
                if(msg_len === 0) {
                    target.innerHTML = "";
                }
                else {
                    if (last_msg.is_transmit === true) {
                        target.innerHTML = "[合并转发消息]";
                    }
                    else if (last_msg.is_audio === true) {
                        target.innerHTML = "[语音消息]";
                    }
                    else if (last_msg.is_image === true) {
                        target.innerHTML = "[图片消息]";
                    }
                    else if (last_msg.is_video === true) {
                        target.innerHTML = "[视频消息]";
                    }
                    else if (last_msg.is_file === true) {
                        target.innerHTML = "[文件消息]";
                    }
                    else {
                        // target.innerHTML = last_msg.msg_body;
                        target.innerHTML = last_msg.msg_body.length > 10 ? prefix+last_msg.msg_body.slice(0,10)+"......" : prefix+last_msg.msg_body;
                    }
                }
                const unread = data.unread_msgs;
                const unreadTarget = document.getElementById(`chat${chat.id}`);
                if (unreadTarget === null) {
                    return;
                }
                unreadTarget.innerHTML = (props.currentChatID === chat.id) ? 0 : unread;
            });
            sockets.current.push(socket);
        });

        groupChatList.forEach((chat) => {
            console.log("group");
            options.url = suffix + `${chat.id}/${myID}/`;
            const socket = new Socket(options);
            socket.onmessage((event: MessageEvent) => {
                const target = document.getElementById(`info${chat.id}`);
                if (target === null) {
                    return;
                }
                const data = JSON.parse(event.data);
                const msg_len = data.len_of_msgs;
                const last_msg = JSON.parse(event.data).last_msg;
                const prefix = (data.mentioned === true) ? "[有人@我] " : "";
                if (msg_len === 0) {
                    target.innerHTML = "";
                }
                else {
                    if (last_msg.is_transmit === true) {
                        target.innerHTML = prefix + "[合并转发消息]";
                    }
                    else if (last_msg.is_audio === true) {
                        target.innerHTML = prefix + "[语音消息]";
                    }
                    else if (last_msg.is_image === true) {
                        target.innerHTML = prefix + "[图片消息]";
                    }
                    else if (last_msg.is_video === true) {
                        target.innerHTML = prefix + "[视频消息]";
                    }
                    else if (last_msg.is_file === true) {
                        target.innerHTML = prefix + "[文件消息]";
                    }
                    else {
                        target.innerHTML = last_msg.msg_body.length > 10 ? prefix + last_msg.msg_body.slice(0, 10) + "......" : prefix + last_msg.msg_body;
                    }
                }
                const unread = data.unread_msgs;
                const unreadTarget = document.getElementById(`chat${chat.id}`);
                if (unreadTarget === null) {
                    return;
                }
                unreadTarget.innerHTML = (props.currentChatID === chat.id) ? 0 : unread;
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
            .catch((err) => alert("获取置顶私聊: " + err));
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
            .catch((err) => alert("获取置顶群聊: " + err));
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
                alert("获取私聊列表: " + err);
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
                    setGroupChatList(data.conversations.map((val: any) => ({ ...val })));
                    setRefreshing(false);
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => {
                alert("获取群聊消息列表: " + err);
                setRefreshing(false);
            });
    };

    return refreshing ? (
        <p> Loading... </p>
    ) : (
        <div style={{ padding: 12 }}>
            <Navbar />

            {chatList!.length + groupChatList!.length + stickedPrivate!.length + stickedGroup!.length === 0 ? (
                <ul className="friendlist">
                    <li>
                        当前没有会话
                    </li>
                </ul>
            ) : (
                <ul className="friendlist" style={{top:"95px"}}>
                    {stickedPrivate!.map((chat) => (
                        (!chat.disabled && <li key={chat.id} style={{ display: "flex", flexDirection: "row", backgroundColor: "#434343" }}
                            onClick={() => {
                                if (!chat.validation)
                                    router.push(`/user/msg/chat?id=${chat.id}&name=${chat.friend_name}&group=0&sticked=${chat.sticked ? 1 : 0}&silent=${chat.silent ? 1 : 0}&validation=${chat.validation ? 1 : 0}`);
                                else {
                                    setShowPopupValidFriend(true);
                                    setCurrentChat(chat);
                                }
                            }}>
                            <img src={`${chat.friend_avatar}`} alt="oops" />
                            <div className="msginfopv" >
                                <div className="senderpv">{chat.friend_name.length > 6 ? `${chat.friend_name.slice(0, 6)}...` : chat.friend_name}</div>
                                {/* <div className="msgpv" id={`info${chat.id}`}>{chatInfo && chatInfo[chat.id] ? (chatInfo[chat.id].length > 10 ? `${chatInfo[chat.id].slice(0, 10)}...` : chatInfo[chat.id]) : ""}</div> */}
                                <div className="msgpv" id={`info${chat.id}`}>加载中......</div>
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
                        (!chat.disabled && <li key={chat.id} style={{ display: "flex", flexDirection: "row", backgroundColor: "#434343" }}
                            onClick={() => {
                                if (!chat.validation)
                                    router.push(`/user/msg/chat?id=${chat?.id}&name=${chat?.name}&group=1&sticked=${chat?.sticked ? 1 : 0}&silent=${chat?.silent ? 1 : 0}&validation=${chat?.validation ? 1 : 0}`);
                                else {
                                    setShowPopupValidGroup(true);
                                    setCurrentGroupChat(chat);
                                }
                            }}>
                            <img src={`${chat.avatar}`} alt="oops" />
                            <div className="msginfopv" >
                                <div className="senderpv">{chat.name.length > 6 ? `${chat.name.slice(0, 6)}...` : chat.name}</div>
                                <div className="msgpv" id={`info${chat.id}`}>加载中......</div>
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
                        (!chat.disabled && <li key={chat.id} style={{ display: "flex", flexDirection: "row" }}
                            onClick={() => {
                                if (!chat.validation)
                                    router.push(`/user/msg/chat?id=${chat.id}&name=${chat.friend_name}&group=0&sticked=${chat.sticked ? 1 : 0}&silent=${chat.silent ? 1 : 0}&validation=${chat.validation ? 1 : 0}`);
                                else {
                                    setShowPopupValidFriend(true);
                                    setCurrentChat(chat);
                                }
                            }}>
                            <img src={`${chat.friend_avatar}`} alt="oops" />
                            <div className="msginfopv" >
                                <div className="senderpv">{chat.friend_name.length > 6 ? `${chat.friend_name.slice(0, 6)}...` : chat.friend_name}</div>
                                <div className="msgpv" id={`info${chat.id}`}>加载中......</div>
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
                        (!chat.disabled && <li key={chat.id} style={{ display: "flex", flexDirection: "row" }}
                            onClick={() => {
                                if (!chat.validation)
                                    router.push(`/user/msg/chat?id=${chat?.id}&name=${chat?.name}&group=1&sticked=${chat?.sticked ? 1 : 0}&silent=${chat?.silent ? 1 : 0}&validation=${chat?.validation ? 1 : 0}`);
                                else {
                                    setShowPopupValidGroup(true);
                                    setCurrentGroupChat(chat);
                                }
                            }}>
                            <img src={`${chat.avatar}`} alt="oops" />
                            <div className="msginfopv" >
                                <div className="senderpv">{chat.name.length > 6 ? `${chat.name.slice(0, 6)}...` : chat.name}</div>
                                <div className="msgpv" id={`info${chat.id}`}>加载中......</div>
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
            {showPopupValidFriend && (
                <div className="popup">
                    <p>已开启二级验证，请输入密码</p>
                    <input
                        placeholder="输入本账号的登录密码"
                        type="password"
                        onChange={(e) => { setPwd(e.target.value); }}
                    />
                    <button onClick={() => { setShowPopupValidFriend(false); setPwd(""); }}>
                        取消
                    </button>
                    <button onClick={() => { checkPwdFriend(pwd); setShowPopupValidFriend(false); setPwd(""); }}>
                        完成
                    </button>
                </div>
            )}
            {showPopupValidGroup && (
                <div className="popup">
                    <p>已开启二级验证，请输入密码</p>
                    <input
                        placeholder="输入本账号的登录密码"
                        type="password"
                        onChange={(e) => { setPwd(e.target.value); }}
                    />
                    <button onClick={() => { setShowPopupValidGroup(false); setPwd(""); }}>
                        取消
                    </button>
                    <button onClick={() => { checkPwdGroup(pwd); setShowPopupValidGroup(false); setPwd(""); }}>
                        完成
                    </button>
                </div>
            )}
        </div>
    );
};

export default MsgBar;