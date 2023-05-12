import Picker from "@emoji-mart/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { uploadFile } from "../../../utils/oss";
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
    // image
    const [newimg, setNewImg] = useState<File>();
    const [isImgUploaded, setIsImgUploaded] = useState(false);
    const [showPopupImg, setShowPopupImg] = useState(false);
    // file
    const [newfile, setNewFile] = useState<File>();
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [showPopupFile, setShowPopupFile] = useState(false);

    const socket = useRef<Socket>();

    // 功能：切换emoji显示
    const toggleEmojiPicker = () => {
        setShowEmojiPicker(showEmojiPicker => !showEmojiPicker);
    };
    // 功能：处理emoji点击
    const handleEmojiClick = (emoji: { native: string; }) => {
        setMsg(inputValue + emoji.native);
        setInput(inputValue + emoji.native);
        setShowEmojiPicker(false);
    };

    const sendPublic = (isImg?: boolean, isFile?: boolean) => {
        socket.current!.send(JSON.stringify({ message: message, token: localStorage.getItem("token"), 
            isImg: false, isFile: false }));
    };

    const cleanUp = () => {
        console.log("回收");
        socket.current?.destroy();
    };
    // 功能：发送图片
    const sendPic = async (pic: File|undefined) => {
        if(pic === undefined) {
            alert("未检测到图片");
            return;
        }
        const image_url = await uploadFile(pic);

        socket.current!.send(JSON.stringify({ message: image_url, token: localStorage.getItem("token"), 
            is_image: true}));        
    };
    // 功能：发送文件
    const sendFile = async (pic: File|undefined) => {
        if(pic === undefined) {
            alert("未检测到文件");
            return;
        }
        const file_url = await uploadFile(pic);

        socket.current!.send(JSON.stringify({ message: file_url, token: localStorage.getItem("token"), 
            is_file: true}));        
    };
    // 功能：创建链接
    function createLinkifiedMsgBody(msgBody: string) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return msgBody.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank">${url}</a>`;
        });
    }

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        const options: Options = {
            url: `ws://localhost:8000/ws/chat/${router.query.id}/`,
            // url: `wss://2023-im-backend-killthisse.app.secoder.net/ws/chat/${router.query.id}/`,
            heartTime: 5000, // 心跳时间间隔
            heartMsg: JSON.stringify({ message: "heartbeat", token: localStorage.getItem("token"), heartbeat: true }),
            isReconnect: true, // 是否自动重连
            isDestroy: false, // 是否销毁
            reconnectTime: 5000, // 重连时间间隔
            reconnectCount: -1, // 重连次数 -1 则不限制
            openCb: () => { }, // 连接成功的回调
            closeCb: () => { }, // 关闭的回调
            messageCb: (event: MessageEvent) => {
                setMsgList(JSON.parse(event.data).messages.map((val: any) => ({ ...val })));
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
                <div>{router.query.name}</div>
                {msgList.map((msg) => (
                    <div key={msg.msg_id} className="msg">
                        <div className={msg.sender_id !== myID ? "msgavatar" : "mymsgavatar"}>
                            <img className="sender_avatar" src={msg.sender_avatar} />
                        </div>
                        <div className={msg.sender_id !== myID ? "msgmain" : "mymsgmain"}>
                            <p className="sendername">{msg.sender_name}</p>
                            {msg.is_image === true ? <img src={msg.msg_body}  style={{maxWidth: "100%", height:"auto"}}/> : 
                                (msg.is_file === true ? <a id="fileLink" href={msg.msg_body} title="下载文件" >
                                        <img src="https://killthisse-avatar.oss-cn-beijing.aliyuncs.com/%E6%96%87%E4%BB%B6%E5%A4%B9-%E7%BC%A9%E5%B0%8F.png" alt="file" 
                                            style={{ width: "100%", height:"auto"}} />
                                    </a> : 
                                    <p className={msg.sender_id !== myID ? "msgbody" : "mymsgbody"} dangerouslySetInnerHTML={{ __html: createLinkifiedMsgBody(msg.msg_body) }}></p>)
                            } 
                        </div>
                    </div>
                ))}
            </div>
            <div className="inputdisplay">
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
                        }
                    }}
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                />
                <div className="sendbuttons" style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", flexDirection: "row"}}>
                        <button className="emojibutton" onClick={() => { toggleEmojiPicker(); }}>
                        😊
                        </button>
                        <button className="filebutton"  onClick={() => { toggleEmojiPicker(); }}>
                        🗣️
                        </button>
                        <button className="picbutton"  onClick={() => { setShowPopupImg(true); }}>
                        🏞️
                        </button>
                        {showPopupImg && (
                            <div className="popup">
                                <form onSubmit={() => { sendPic(newimg); 
                                    setIsImgUploaded(false);  
                                    setShowPopupImg(false);  }}>
                                    <input placeholder = "uploaded image" 
                                        className="fileupload" type="file" 
                                        name="avatar" accept="image/*" 
                                        onChange={(event) => { 
                                            setNewImg(event.target.files?.[0]); 
                                            setIsImgUploaded(!!event.target.files?.[0]); 
                                        }} />
                                    <button type="submit" 
                                        disabled={!isImgUploaded}>发送图片</button>
                                </form>
                                <button onClick={() => { setShowPopupImg(false); }}>取消</button>
                            </div>
                        )}
                        <button className="filebutton"  onClick={() => { setShowPopupFile(true); }}>
                        📁
                        </button>
                        {showPopupFile && (
                            <div className="popup">
                                <form onSubmit={() => { sendFile(newfile); 
                                    setIsFileUploaded(false);  
                                    setShowPopupFile(false);  }}>
                                    <input placeholder = "uploaded file" 
                                        className="fileupload" type="file" 
                                        name="avatar" accept="*"
                                        onChange={(event) => { 
                                            setNewFile(event.target.files?.[0]); 
                                            setIsFileUploaded(!!event.target.files?.[0]); 
                                        }} />
                                    <button type="submit" 
                                        disabled={!isFileUploaded}>发送文件</button>
                                </form>
                                <button onClick={() => { setShowPopupFile(false); }}>取消</button>
                            </div>
                        )}
                    </div>
                    <button
                        className="msgbutton"
                        onClick={() => { sendPublic(); setInput(""); }}
                        style={{ display: "inline-block", verticalAlign: "middle" }}
                    > 发送 </button>
                </div>
            </div>
            {showEmojiPicker && (
                <div className="emoji-picker-container" >
                    <Picker
                        onEmojiSelect={(emoji: { native: string }) => {
                            handleEmojiClick(emoji);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatScreen;