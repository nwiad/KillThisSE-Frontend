import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { MsgMetaData, Options } from "../../../utils/type";
import { Socket } from "../../../utils/websocket";
import Navbar from "../navbar";
import MsgBar from "./msgbar";

const ChatScreen = () => {
    const [inputValue, setInput] = useState<string>("");
    const [message, setMsg] = useState<string>("");
    const [msgList, setMsgList] = useState<MsgMetaData[]>([]);
    const [myID, setID] = useState<number>(-1);
    const chatBoxRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const query = router.query;
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const socket = useRef<Socket>();

    // 功能：切换emoji显示
    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };
    // 功能：处理emoji点击
    const handleEmojiClick = (emoji: { native: string; }) => {
        setInput(inputValue + emoji.native);
        setShowEmojiPicker(false);
    };

    const sendPublic = () => {
        socket.current!.send(JSON.stringify({ message: message, token: localStorage.getItem("token") }));
    };

    const cleanUp = () => {
        console.log("回收");
        socket.current?.destroy();
    };
    
    function createLinkifiedMsgBody(msgBody: string) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return msgBody.replace(urlRegex, (url) => {
          return `<a href="${url}" target="_blank">${url}</a>`;
        });
    }

    useEffect(() => {
        if(!router.isReady) {
            return;
        }
        const options: Options = {
            url: `ws://localhost:8000/ws/chat/${router.query.id}/`,
            // url: `wss://2023-im-backend-killthisse.app.secoder.net/ws/chat/${router.query.id}/`,
            heartTime: 5000, // 心跳时间间隔
            heartMsg: JSON.stringify({message: "heartbeat", token: localStorage.getItem("token"), heartbeat: true}),
            isReconnect: true, // 是否自动重连
            isDestroy: false, // 是否销毁
            reconnectTime: 5000, // 重连时间间隔
            reconnectCount: -1, // 重连次数 -1 则不限制
            openCb: () => { }, // 连接成功的回调
            closeCb: () => { }, // 关闭的回调
            messageCb: (event: MessageEvent) => {
                setMsgList(JSON.parse(event.data).messages.map((val: any) => ({...val})));
            }, // 消息的回调
            errorCb: () => { } // 错误的回调
        };
        socket.current = new Socket(options);
        return cleanUp;
    }, [router, query]);

    useEffect(() => {
        const msgs = document.getElementById("msgdisplay");
        msgs?.scroll(0, msgs?.scrollHeight - msgs?.clientHeight);
    }, [msgList]);

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
                setID(data.user_id);
            })
            .catch((err) => alert(err));
    }, []);

    return (
        <div style={{ padding: 12 }}>
            <Navbar />
            <MsgBar />
            <div ref={chatBoxRef} id="msgdisplay" style={{display: "flex", flexDirection:"column"}}>
                {msgList.map((msg) => (
                    <div key={msg.msg_id} className="msg">
                        <div className={msg.sender_id !== myID ? "msgavatar" : "mymsgavatar"}>
                            <img className="sender_avatar" src={msg.sender_avatar} />
                        </div>
                        <div className={msg.sender_id !== myID ? "msgmain" : "mymsgmain" }>
                            <p className="sendername">{msg.sender_name}</p>
                            <p className={msg.sender_id !== myID ? "msgbody" : "mymsgbody" } dangerouslySetInnerHTML={{__html : createLinkifiedMsgBody(msg.msg_body)}}></p>
                        </div>
                    </div>
                ))}
            </div>
            <div>
                <input
                    className="msginput"
                    id="msginput"
                    type="text"
                    placeholder="请输入内容"
                    value={inputValue}
                    onChange={(e) => { setInput(e.target.value); setMsg(e.target.value); }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            sendPublic(); 
                            setInput("");
                        }}}
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                />
                <button
                    className="msgbutton" 
                    onClick={() => { sendPublic(); setInput(""); }} 
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                > 发送 </button>
                {/* add 发送emoji表情功能 */}
                <button
                    className="emoji-picker-button"
                    onClick={toggleEmojiPicker}
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                >😀</button>
                {showEmojiPicker && (
                    <div className="emoji-picker-container" style={{ position: "absolute", bottom: "50px", right: "50px" }}> 
                        <Picker data = {data} onSelect={handleEmojiClick} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatScreen;